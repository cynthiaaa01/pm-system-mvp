"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { UpdateType, UserRole } from "@/types/database";

export async function createTaskUpdate(
  taskId: string,
  projectId: string,
  content: string,
  updateType: UpdateType = 'progress',
  metadata: any = {}
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Fetch user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const { data, error } = await supabase
    .from("task_updates")
    .insert({
      task_id: taskId,
      project_id: projectId,
      author_id: user.id,
      author_role: profile?.role as UserRole | null,
      content,
      update_type: updateType,
      metadata
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating task update:", error);
    return { error: error.message };
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/dashboard/activity`);
  return { success: true, data };
}

export async function getProjectUpdates(projectId: string, filters?: { role?: UserRole }) {
  const supabase = await createClient();
  let query = supabase
    .from("task_updates")
    .select("*, tasks(title), profiles:author_id(full_name, avatar_url, role)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (filters?.role) {
    query = query.eq("author_role", filters.role);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching project updates:", error);
    return [];
  }

  return data;
}

export async function getPersonUpdates(profileId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_updates")
    .select("*, tasks(title), projects(name), profiles:author_id(full_name, avatar_url, role)")
    .eq("author_id", profileId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching person updates:", error);
    return [];
  }

  return data;
}

export async function getAllUpdates(limit: number = 50) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_updates")
    .select("*, tasks(title), projects(name), profiles:author_id(full_name, avatar_url, role)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching all updates:", error);
    return [];
  }

  return data;
}
