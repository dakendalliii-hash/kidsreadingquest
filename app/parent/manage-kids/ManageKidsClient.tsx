// =========================================================
// FILE: ManageKidsClient.tsx
// PURPOSE: Manage Kids with Unified Update (Name + Band)
// =========================================================

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FormContainer from "@/components/FormContainer";

type Kid = {
  id: string;
  name: string;
  age: number | null;
  reading_level: string | null;
};

type ManageKidsClientProps = {
  kids: Kid[];
  parentId: string;
  addKid: (formData: FormData) => Promise<string>;
  deleteKid: (formData: FormData) => Promise<void>;
  updateKid: (formData: FormData) => Promise<void>;
};

export default function ManageKidsClient({
  kids,
  parentId,
  addKid,
  deleteKid,
  updateKid,
}: ManageKidsClientProps) {
  const router = useRouter();

  const [localKids, setLocalKids] = useState<Kid[]>(kids);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  // =========================================================
  // Rebuild Kid objects on every render (initial load)
  // =========================================================
  useEffect(() => {
    const refreshKids = async () => {
      const res = await fetch(`/api/kids?parentId=${parentId}`);
      const data = await res.json();
      setLocalKids(data || []);
    };

    refreshKids();
  }, [parentId]);

  // =========================================================
  // Unified Local Update (Name + Band)
  // =========================================================
  const handleLocalUpdate = async (formData: FormData) => {
    const confirmed = window.confirm("Are you sure you want to make changes?");
    if (!confirmed) return;

    await updateKid(formData);

    const res = await fetch(`/api/kids?parentId=${parentId}`);
    const refreshedKids = await res.json();
    setLocalKids(refreshedKids || []);
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
      {/* ADD KID SECTION */}
      <FormContainer>
        <div className="page-container">
          <h2 className="section-header">Add Kid</h2>

          <form
            action={async (formData) => {
              const newName = formData.get("name") as string;
              const newAge = Number(formData.get("age"));

              const newKidId = await addKid(formData);

              let band = "";
              if (newAge >= 4 && newAge <= 5) band = "A 4-5";
              else if (newAge >= 6 && newAge <= 7) band = "B 6-7";
              else if (newAge >= 8 && newAge <= 9) band = "C 8-9";

              setLocalKids((prev) => [
                ...prev,
                {
                  id: newKidId,
                  name: newName,
                  age: newAge,
                  reading_level: band,
                },
              ]);

              setName("");
              setAge("");

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
              name="age"
              required
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="input-field"
            >
              <option value="">Select age</option>
              {[4, 5, 6, 7, 8, 9].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <button type="submit" className="btn-blue full-card-button">
              Add Kid
            </button>
          </form>
        </div>
      </FormContainer>

      {/* EXISTING KIDS SECTION */}
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
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  fontWeight: "bold",
                  borderBottom: "1px solid #ccc",
                  paddingBottom: "8px",
                  marginBottom: "8px",
                  textAlign: "center",
                }}
              >
                <div>Name</div>
                <div>Band</div>
                <div>Update</div>
                <div>Delete</div>
              </div>

              {/* Rows */}
              {localKids.map((kid) => (
                <div
                  key={kid.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    alignItems: "center",
                    borderBottom: "1px solid #eee",
                    padding: "8px 0",
                    gap: "12px",
                  }}
                >
                  {/* Unified Update Form */}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault(); // ⛔ prevent navigation
                      const formData = new FormData(e.currentTarget);
                      await handleLocalUpdate(formData);
                    }}
                    style={{
                      display: "contents",
                    }}
                  >
                    <input type="hidden" name="kidId" value={kid.id} />

                    {/* Name */}
                    <div style={{ textAlign: "center" }}>
                      <input
                        type="text"
                        name="name"
                        defaultValue={kid.name}
                        className="input-field"
                        style={{
                          width: "90%",
                          padding: "6px",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                        }}
                      />
                    </div>

                    {/* Band */}
                    <div style={{ textAlign: "center" }}>
                      <select
                        name="level"
                        defaultValue={kid.reading_level ?? ""}
                        className="input-field"
                        style={{
                          width: "90%",
                          padding: "6px",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                        }}
                      >
                        <option value="">Select band</option>
                        <option value="A 4-5">A 4-5</option>
                        <option value="B 6-7">B 6-7</option>
                        <option value="C 8-9">C 8-9</option>
                      </select>
                    </div>

                    {/* Update */}
                    <div style={{ textAlign: "center" }}>
                      <button
                        type="submit"
                        className="btn-blue full-card-button"
                        style={{
                          width: "90%",
                          padding: "8px 0",
                        }}
                      >
                        Update
                      </button>
                    </div>
                  </form>

                  {/* Delete */}
                  <div style={{ textAlign: "center" }}>
                    <form
                      action={async (formData) => {
                        const kidId = formData.get("kidId") as string;

                        const confirmed = window.confirm(
                          `Are you sure you want to delete ${kid.name}? This will remove all progress for this kid.`
                        );

                        if (!confirmed) return;

                        setLocalKids((prev) =>
                          prev.filter((k) => k.id !== kidId)
                        );

                        await deleteKid(formData);
                      }}
                    >
                      <input type="hidden" name="kidId" value={kid.id} />
                      <button
                        type="submit"
                        className="btn-danger"
                        style={{
                          width: "90%",
                          padding: "8px 0",
                        }}
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </FormContainer>

      <div className="floating-slate">More actions below</div>
    </div>
  );
}
