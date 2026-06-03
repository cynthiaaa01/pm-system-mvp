"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { recalculateProgress } from "./projects";

export async function getProjectTasks(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*, assignee:assignee_id(full_name)")
    .eq("project_id", projectId)
    .order("sort_order");

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
  return data;
}

export async function getMyTasks() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("tasks")
    .select("*, projects(name)")
    .eq("assignee_id", user.id)
    .neq("status", "done")
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching my tasks:", error);
    return [];
  }
  return data;
}

export async function updateTaskStatus(id: string, status: string, projectId?: string) {
  const supabase = await createClient();
  const updates: any = { status };
  
  if (status === "done") {
    updates.completed_at = new Date().toISOString();
  }
  
  const { error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id);
    
  if (error) {
    console.error("Error updating task status:", error);
    return { error: error.message };
  }
  
  // Also recalculate project progress if projectId is known
  if (projectId) {
    await recalculateProgress(projectId);
    revalidatePath(`/dashboard/projects/${projectId}`);
  }
  
  revalidatePath("/dashboard/tasks");
  return { success: true };
}

export async function assignTask(id: string, assigneeId: string, projectId?: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ assignee_id: assigneeId })
    .eq("id", id);
    
  if (error) {
    return { error: error.message };
  }
  
  if (projectId) revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

export async function getAllUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .order("full_name");
    
  if (error) return [];
  return data;
}

export async function getAllTasks() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*, projects(name)")
    .order("due_date", { ascending: true });

  if (error) {
    console.error("Error fetching all tasks:", error);
    return [];
  }
  return data;
}
export async function deleteTask(id: string, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);
    
  if (error) {
    console.error("Error deleting task:", error);
    return { error: error.message };
  }
  
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/tasks");
  return { success: true };
}
