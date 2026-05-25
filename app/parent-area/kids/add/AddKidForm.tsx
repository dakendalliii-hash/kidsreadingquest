// app/parent/kids/add/AddKidForm.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AddKidForm({ parentId }: { parentId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
    const readingLevel = formData.get("reading_level") as string;
    const age = formData.get("age") as string;

    await supabase.rpc("create_kid_for_parent", {
      p_email: email,
      p_password: password,
      p_name: name,
      p_parent_record_id: parentId, // ✔ guaranteed non-null
      p_reading_level: readingLevel || null,
      p_age: age ? Number(age) : null
    });

    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-4 max-w-md">
      <input
        type="email"
        name="email"
        placeholder="Kid Email"
        required
        className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        required
        className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
      />

      <input
        type="text"
        name="name"
        placeholder="Kid Name"
        required
        className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
      />

      <input
        type="text"
        name="reading_level"
        placeholder="Reading Level"
        className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
      />

      <input
        type="number"
        name="age"
        placeholder="Age"
        className="w-full p-2 bg-slate-800 border border-slate-700 rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded text-white w-full"
      >
        {loading ? "Adding..." : "Add Kid"}
      </button>
    </form>
  );
}
