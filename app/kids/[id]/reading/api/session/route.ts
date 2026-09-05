// app/kids/[id]/reading/api/session/route.ts
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("workout_sessions")
    .select("data")
    .eq("kid_id", id)
    .single();

  return Response.json({
    workoutSession: data?.data ?? null
  });
}
