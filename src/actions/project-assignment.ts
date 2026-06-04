"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";

/**
 * Assign operations manager to a project
 */
export async function assignOperationsManager(projectId: string, userId: string) {
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (!currentUser) return { error: "Not authenticated" };
  if (!userId) return { error: "Operations manager is required" };

  const { error } = await supabase
    .from("projects")
    .update({ operations_id: userId })
    .eq("id", projectId);

  if (error) {
    console.error("Error assigning operations manager:", error);
    return { error: error.message };
  }

  // Notify the assigned user if they are not the one assigning
  if (currentUser.id !== userId) {
    const { data: project } = await supabase.from("projects").select("name").eq("id", projectId).single();
    await createNotification({
      user_id: userId,
      title: "您已被指派為專案營運負責人",
      message: `您已被指派負責專案：${project?.name || '未知專案'}，請至專案詳情頁面查看。`,
      reference_type: "project",
      reference_id: projectId
    });
  }

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

/**
 * Assign marketing manager to a project
 */
export async function assignMarketingManager(projectId: string, userId: string) {
  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (!currentUser) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("projects")
    .update({ marketing_id: userId || null })
    .eq("id", projectId);

  if (error) {
    console.error("Error assigning marketing manager:", error);
    return { error: error.message };
  }

  // Notify the assigned user if they are not the one assigning
  if (currentUser.id !== userId) {
    const { data: project } = await supabase.from("projects").select("name").eq("id", projectId).single();
    await createNotification({
      user_id: userId,
      title: "您已被指派為專案行銷負責人",
      message: `您已被指派負責專案：${project?.name || '未知專案'}，請至專案詳情頁面查看。`,
      reference_type: "project",
      reference_id: projectId
    });
  }

  revalidatePath("/dashboard", "layout");
  return { success: true };
}
