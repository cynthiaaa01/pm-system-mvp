"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { fuzzyMatchItems, generateTasksFromTemplates } from "@/lib/task-generation";
import type { GeneratedTask } from "@/lib/task-generation";

export async function previewQuotationTasks(projectId: string) {
  const supabase = await createClient();

  // 1. Get Project and its related Proposal (which contains parsed_items)
  const { data: project, error: projError } = await supabase
    .from("projects")
    .select("*, proposals(parsed_items)")
    .eq("id", projectId)
    .single();

  if (projError || !project) {
    console.error("Error fetching project for preview:", projError);
    return { error: "找不到專案資料或讀取失敗" };
  }

  // Handle both possible structures of the join (array or object)
  const proposal = Array.isArray(project.proposals) ? project.proposals[0] : project.proposals;

  if (!proposal || !proposal.parsed_items) {
    return { error: "該專案沒有關聯的報價單，或是報價單尚未進行 AI 解析" };
  }

  // 2. Extract item names from parsed_items
  const items = Array.isArray(proposal.parsed_items) ? proposal.parsed_items : [];
  const parsedItemNames = items.map((i: any) => i.item_name || i.name).filter(Boolean);

  if (parsedItemNames.length === 0) {
    return { error: "報價單中沒有找到任何品項" };
  }

  // 3. Fetch all quotation_item_templates
  const { data: templates, error: tplError } = await supabase
    .from("quotation_item_templates")
    .select("*");

  if (tplError || !templates) {
    console.error("Error fetching templates:", tplError);
    return { error: "無法讀取 SOP 任務範本" };
  }

  // 4. Match templates to parsed items
  const templateItemNames = Array.from(new Set(templates.map(t => t.item_name)));
  let matchedTemplateNames = new Set<string>();

  for (const parsedName of parsedItemNames) {
    const matches = fuzzyMatchItems(parsedName, templateItemNames);
    matches.forEach(m => matchedTemplateNames.add(m));
  }

  // If no matches, return empty array rather than error, so user knows they just didn't hit any SOPs
  if (matchedTemplateNames.size === 0) {
    return { tasks: [] };
  }

  // 5. Generate tasks for the matched templates
  const matchedTemplates = templates.filter(t => matchedTemplateNames.has(t.item_name));
  
  // Format project dates for generation
  const projectDates = {
    start_date: project.start_date,
    event_online_date: project.event_online_date,
    event_end_date: project.event_end_date,
    material_confirm_date: project.material_confirm_date,
    physical_event_date: project.physical_event_date,
    system_online_date: project.system_online_date,
    monthly_settle_date: project.monthly_settle_date,
  };

  const previewTasks = generateTasksFromTemplates(matchedTemplates, projectDates);

  return { tasks: previewTasks };
}

export async function importTasks(projectId: string, tasksToImport: GeneratedTask[]) {
  const supabase = await createClient();

  if (!tasksToImport || tasksToImport.length === 0) {
    return { success: true };
  }

  const insertPayload = tasksToImport.map(t => ({
    project_id: projectId,
    title: t.title,
    source_item: t.source_item,
    task_category: t.task_category,
    reference_point: t.reference_point,
    offset_days: t.offset_days,
    duration_days: t.duration_days,
    start_date: t.start_date,
    due_date: t.due_date,
    sort_order: t.sort_order,
    status: t.status,
    priority: t.priority
  }));

  const { error } = await supabase
    .from("tasks")
    .insert(insertPayload);

  if (error) {
    console.error("Error importing tasks:", error);
    return { error: error.message };
  }

  // Recalculate progress if needed, though all new tasks will be 'todo', progress drops.
  const { recalculateProgress } = await import("./projects");
  await recalculateProgress(projectId);

  revalidatePath("/dashboard", "layout");
  return { success: true };
}
