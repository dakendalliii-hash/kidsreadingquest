// =========================================================
// FILE: ManageKidsClient.tsx
// PURPOSE: Manage Kids with Name, Level (A/B/C), Age
// =========================================================

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import FormContainer from "@/components/FormContainer";
import ActionButton from "@/components/ActionButton";

type Kid = {
  id: string;
  name: string;
  reading_level: string | null;
  age: number | null;
};

type ManageKidsClientProps = {
  kids: Kid[];
  parentId: string;
  addKid: (formData: FormData) => void;
  deleteKid: (formData: FormData) => void;
  updateKid: (formData: FormData) => void;
};

export default function ManageKidsClient({
  kids,
  parentId,
  addKid,
  deleteKid,
  updateKid,
}: ManageKidsClientProps) {
  const router = useRouter();

  // Local state to reflect updates instantly
  const [localKids, setLocalKids] = useState<Kid[]>(kids);

  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [age, setAge] = useState("");

  // =========================================================
  // UPDATE KID (with confirmation)
  // =========================================================
  const handleLocalUpdate = async (formData: FormData) => {
    const kidId = formData.get("kidId") as string;
    const newName = formData.get("name") as string;
    const newLevel = formData.get("level") as string;
    const newAge = formData.get("age") as string;

    const confirmed = window.confirm("Are you sure you want to make changes?");
    if (!confirmed) return;

    // Update UI instantly
    setLocalKids((prev) =>
      prev.map((k) =>
        k.id === kidId
          ? {
              ...k,
              name: newName,
              reading_level: newLevel,
              age: newAge ? Number(newAge) : null,
            }
          : k
      )
    );

    // Run server action
    await updateKid(formData);

    // Refresh SSR data
    router.refresh();
  };

  return (
    <div
      style={{
        backgroundImage: "url('/DiverseKids.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        paddingTop: "40px",
        paddingBottom: "80px",
      }}
    >
      {/* ========================================================= */}
      {/* ADD KID SECTION */}
      {/* ========================================================= */}
      <FormContainer>
        <div className="page-container">
          <h2 className="section-header">Add Kid</h2>

          <form
            action={async (formData) => {
              const newName = formData.get("name") as string;
              const newLevel = formData.get("level") as string;
              const newAge = formData.get("age") as string;

              // Run server action
              await addKid(formData);

              // Update UI instantly
              setLocalKids((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(), // temporary placeholder
                  name: newName,
                  reading_level: newLevel,
                  age: newAge ? Number(newAge) : null,
                },
              ]);

              // Clear form fields
              setName("");
              setLevel("");
              setAge("");

              // Refresh SSR data
              router.refresh();
            }}
          >
            <input type="hidden" name="parentId" value={parentId} />

            <input
              type="text"
              name="name"
              placeholder="Kid's name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />

            <select
              name="level"
              required
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="input-field"
            >
              <option value="">Select level</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>

            <select
              name="age"
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="input-field"
            >
              <option value="">Select age</option>
              {Array.from({ length: 13 }, (_, i) => {
                const ageValue = i + 4;
                return (
                  <option key={ageValue} value={ageValue}>
                    {ageValue}
                  </option>
                );
              })}
            </select>

            <ActionButton label="Add Kid" />
          </form>
        </div>
      </FormContainer>

      {/* ========================================================= */}
      {/* EXISTING KIDS SECTION */}
      {/* ========================================================= */}
      <FormContainer>
        <div className="page-container">
          <h2 className="section-header">Existing Kids</h2>

          {localKids.length === 0 && (
            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                borderRadius: "8px",
                border: "2px dashed #3b4a63",
                backgroundColor: "rgba(255,255,255,0.9)",
                color: "#3b4a63",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              No kids added yet.
            </div>
          )}

          {localKids.length > 0 && (
            <div
              style={{
                marginTop: "10px",
                backgroundColor: "rgba(255,255,255,0.9)",
                borderRadius: "12px",
                border: "1px solid #ccc",
                padding: "16px",
                overflowX: "auto",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={headerStyle}>Name</th>
                    <th style={headerStyle}>Level</th>
                    <th style={headerStyle}>Age</th>
                    <th style={headerCenter}>Update</th>
                    <th style={headerCenter}>Delete</th>
                  </tr>
                </thead>

                <tbody>
                  {localKids.map((kid) => (
                    <tr key={kid.id}>
                      <td style={cellStyle}>{kid.name}</td>
                      <td style={cellStyle}>{kid.reading_level ?? "N/A"}</td>
                      <td style={cellStyle}>{kid.age ?? "N/A"}</td>

                      {/* ========================================================= */}
                      {/* UPDATE ROW */}
                      {/* ========================================================= */}
                      <td style={cellCenter}>
                        <form
                          action={handleLocalUpdate}
                          className="kid-update-form"
                        >
                          <input type="hidden" name="kidId" value={kid.id} />

                          <div className="kid-update-row">
                            <input
                              type="text"
                              name="name"
                              defaultValue={kid.name}
                              className="input-field"
                            />

                            <select
                              name="level"
                              defaultValue={kid.reading_level ?? ""}
                              className="input-field"
                            >
                              <option value="">Select level</option>
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                            </select>

                            <select
                              name="age"
                              defaultValue={
                                kid.age !== null && kid.age !== undefined
                                  ? kid.age
                                  : ""
                              }
                              className="input-field"
                            >
                              <option value="">Select age</option>
                              {Array.from({ length: 13 }, (_, i) => {
                                const ageValue = i + 4;
                                return (
                                  <option key={ageValue} value={ageValue}>
                                    {ageValue}
                                  </option>
                                );
                              })}
                            </select>

                            <ActionButton label="Update" />
                          </div>
                        </form>
                      </td>

                      {/* ========================================================= */}
                      {/* DELETE ROW */}
                      {/* ========================================================= */}
                      <td style={cellCenter}>
                        <form
                          action={async (formData) => {
                            const kidId = formData.get("kidId") as string;

                            const confirmed = window.confirm(
                              `Are you sure you want to delete ${kid.name}? This will remove all progress for this kid.`
                            );

                            if (!confirmed) return;

                            // Update UI instantly
                            setLocalKids((prev) =>
                              prev.filter((k) => k.id !== kidId)
                            );

                            // Run server action
                            await deleteKid(formData);

                            // Refresh SSR data
                            router.refresh();
                          }}
                        >
                          <input type="hidden" name="kidId" value={kid.id} />
                          <button type="submit" className="btn-danger">
                            Delete
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </FormContainer>

      <div className="floating-slate">More actions below</div>
    </div>
  );
}

// =========================================================
// TABLE CELL STYLES
// =========================================================

const headerStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px",
  borderBottom: "1px solid #ccc",
  color: "black",
};

const headerCenter: React.CSSProperties = {
  ...headerStyle,
  textAlign: "center",
};

const cellStyle: React.CSSProperties = {
  padding: "8px",
  borderBottom: "1px solid #eee",
  color: "black",
};

const cellCenter: React.CSSProperties = {
  ...cellStyle,
  textAlign: "center",
};
