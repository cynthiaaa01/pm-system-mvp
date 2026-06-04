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
    console.error("Error fetching projects detail:", JSON.stringify(error), error);
    throw new Error(`取得專案列表失敗: ${error.message || JSON.stringify(error)}`);
  }
  return data;
}

export async function getProject(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, clients(*), proposals(title, proposal_number, parsed_items, tags), operations:operations_id(full_name), marketing:marketing_id(full_name)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching project:", error);
    throw new Error(`資料庫讀取失敗: ${error.message || JSON.stringify(error)}`);
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
  
  revalidatePath("/dashboard", "layout");
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
  
  const { error: updateError } = await supabase
    .from("projects")
    .update({ progress })
    .eq("id", projectId);
    
  if (updateError) {
    console.error("Error recalculating project progress:", updateError);
  }
}

export async function updateProjectReferenceDates(
  projectId: string,
  dates: {
    start_date?: string | null;
    event_online_date?: string | null;
    event_end_date?: string | null;
    material_confirm_date?: string | null;
    physical_event_date?: string | null;
    system_online_date?: string | null;
    monthly_settle_date?: string | null;
  }
) {
  const supabase = await createClient();
  
  // 1. Update project dates
  const { error: updateError } = await supabase
    .from("projects")
    .update(dates)
    .eq("id", projectId);
  
  if (updateError) {
    console.error("Error updating project dates:", updateError);
    return { error: updateError.message };
  }
  
  // 2. Recalculate task dates
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, reference_point, duration_days")
    .eq("project_id", projectId)
    .not("reference_point", "is", null);
  
  if (tasks && tasks.length > 0) {
    // Get the full project dates after update
    const { data: project } = await supabase
      .from("projects")
      .select("start_date, event_online_date, event_end_date, material_confirm_date, physical_event_date, system_online_date, monthly_settle_date")
      .eq("id", projectId)
      .maybeSingle();
    
    if (project) {
      const { recalculateTaskDates } = await import("@/lib/task-generation");
      
      const { data: allTemplates } = await supabase
        .from("quotation_item_templates")
        .select("task_name, item_name, offset_days, duration_days, reference_point");
      
      const templateMap = new Map<string, { offset_days: number; duration_days: number; reference_point: string }>();
      if (allTemplates) {
        for (const t of allTemplates) {
          templateMap.set(`${t.item_name}|${t.task_name}`, { offset_days: t.offset_days, duration_days: t.duration_days, reference_point: t.reference_point });
        }
      }
      
      // For each task, look up offset_days from the original template
      const tasksWithOffset = await supabase
        .from("tasks")
        .select("id, title, source_item, reference_point, duration_days")
        .eq("project_id", projectId)
        .not("reference_point", "is", null);
      
      if (tasksWithOffset.data) {
        for (const task of tasksWithOffset.data) {
          const key = `${task.source_item}|${task.title}`;
          const tmpl = templateMap.get(key);
          const offsetDays = tmpl?.offset_days || 0;
          const durationDays = task.duration_days || tmpl?.duration_days || 1;
          
          const { resolveReferenceDate, calculateTaskDates } = await import("@/lib/task-generation");
          const refDate = resolveReferenceDate(task.reference_point!, project as any);
          const { startDate, dueDate } = calculateTaskDates(refDate, offsetDays, durationDays);
          
          await supabase
            .from("tasks")
            .update({ start_date: startDate, due_date: dueDate })
            .eq("id", task.id);
        }
      }
    }
  }
  
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function updateProjectTags(projectId: string, tags: string[]) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ tags })
    .eq("id", projectId);
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id);
    
  if (error) {
    console.error("Error deleting project:", error);
    return { error: error.message };
  }
  
  revalidatePath("/dashboard", "layout");
  return { success: true };
}
