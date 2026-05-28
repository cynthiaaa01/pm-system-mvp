"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProjects(filters?: { status?: string; search?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select("*, clients(name), operations:operations_id(full_name), marketing:marketing_id(full_name)")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,project_number.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
  return data;
}

export async function getProject(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, clients(*), proposals(title, proposal_number), operations:operations_id(full_name), marketing:marketing_id(full_name)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching project:", error);
    return null;
  }
  return data;
}

export async function updateProjectStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", id);
    
  if (error) {
    console.error("Error updating project status:", error);
    return { error: error.message };
  }
  
  revalidatePath(`/dashboard/projects/${id}`);
  revalidatePath("/dashboard/projects");
  return { success: true };
}

export async function recalculateProgress(projectId: string) {
  const supabase = await createClient();
  const { data: tasks, error: fetchError } = await supabase
    .from("tasks")
    .select("status")
    .eq("project_id", projectId);
    
  if (fetchError || !tasks || tasks.length === 0) return;
  
  const doneCount = tasks.filter(t => t.status === "done").length;
  const progress = Math.round((doneCount / tasks.length) * 100);
  
  await supabase
    .from("projects")
    .update({ progress })
    .eq("id", projectId);
}
