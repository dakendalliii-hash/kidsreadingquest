"use client";

import React, { useState } from "react";
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
  // Track top form fields so Update can use them
  const [name, setName] = useState("");
  const [readingLevel, setReadingLevel] = useState("");
  const [age, setAge] = useState("");

  return (
    <FormContainer>
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "black" }}>Manage Kids</h2>

        {/* ADD / UPDATE SOURCE FORM */}
        <form action={addKid} style={{ marginBottom: "30px" }}>
          <input type="hidden" name="parentId" value={parentId} />

          <input
            type="text"
            name="name"
            placeholder="Child's name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginBottom: "12px",
            }}
          />

          <select
            name="readingLevel"
            required
            value={readingLevel}
            onChange={(e) => setReadingLevel(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginBottom: "12px",
            }}
          >
            <option value="">Select reading level</option>
            <option value="0-3">0 to 3</option>
            <option value="3-4">3 to 4</option>
            <option value="5+">5 and above</option>
          </select>

          <input
            type="number"
            name="age"
            placeholder="Age (optional)"
            min="0"
            max="18"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginBottom: "12px",
            }}
          />

          <ActionButton label="Add Kid" />
        </form>

        {/* EXISTING KIDS TABLE */}
        <h3 style={{ color: "black", marginBottom: "15px" }}>Existing Kids</h3>

        {kids.length === 0 && (
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

        {kids.length > 0 && (
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
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
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
                {kids.map((kid) => (
                  <tr key={kid.id}>
                    <td style={cellStyle}>{kid.name}</td>
                    <td style={cellStyle}>{kid.reading_level ?? "N/A"}</td>
                    <td style={cellStyle}>{kid.age ?? "N/A"}</td>

                    {/* UPDATE BUTTON */}
                    <td style={cellCenter}>
                      <form action={updateKid}>
                        <input type="hidden" name="kidId" value={kid.id} />
                        <input type="hidden" name="name" value={name} />
                        <input type="hidden" name="readingLevel" value={readingLevel} />
                        <input type="hidden" name="age" value={age} />
                        <ActionButton label="Update" />
                      </form>
                    </td>

                    {/* DELETE BUTTON */}
                    <td style={cellCenter}>
                      <form action={deleteKid}>
                        <input type="hidden" name="kidId" value={kid.id} />
                        <ActionButton label="Delete" />
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
  );
}

const headerStyle = {
  textAlign: "left" as const,
  padding: "8px",
  borderBottom: "1px solid #ccc",
  color: "black",
};

const headerCenter = {
  ...headerStyle,
  textAlign: "center" as const,
};

const cellStyle = {
  padding: "8px",
  borderBottom: "1px solid #eee",
  color: "black",
};

const cellCenter = {
  ...cellStyle,
  textAlign: "center" as const,
};
