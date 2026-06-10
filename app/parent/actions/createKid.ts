"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function createKid({
  parentId,
  name,
  reading_level,
  age,
}: {
  parentId: string;
  name: string;
  reading_level: string | null;
  age: number | null;
}) {
  const supabase = createServerSupabaseClient();

  // 1. Create the kid
  const { data: kid, error: kidError } = await supabase
    .from("kids")
    .insert({
      parent_id: parentId,
      name,
      reading_level,
      age,
    })
    .select()
    .single();

  if (kidError) {
    console.error("❌ Error creating kid:", kidError);
    throw kidError;
  }

  // 2. Get the FIRST passage (your rule)
  const { data: firstPassage, error: passageError } = await supabase
    .from("passages")
    .select("id")
    .order("id", { ascending: true })
    .limit(1)
    .single();

  if (passageError || !firstPassage) {
    console.error("❌ Error fetching first passage:", passageError);
    throw new Error("No passages found — cannot create initial progress record.");
  }

  // 3. Create initial progress record
  const { error: progressError } = await supabase.from("progress").insert({
    kid_id: kid.id,
    passage_id: firstPassage.id,
  });

  if (progressError) {
    console.error("❌ Error creating initial progress record:", progressError);
    throw progressError;
  }

  console.log("✅ Kid created with initial progress:", {
    kid_id: kid.id,
    passage_id: firstPassage.id,
  });

  return kid;
}
