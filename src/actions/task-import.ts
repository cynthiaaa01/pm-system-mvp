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
  let items = [];
  if (proposal.parsed_items?.items && Array.isArray(proposal.parsed_items.items)) {
    items = proposal.parsed_items.items;
  } else if (Array.isArray(proposal.parsed_items)) {
    items = proposal.parsed_items;
  }
  
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

  // 取得專案的負責人資訊 (運營 / 行銷)
  const { data: project } = await supabase
    .from("projects")
    .select("name, client_id, operations_id, marketing_id, drive_folder_url")
    .eq("id", projectId)
    .single();

  const insertPayload = tasksToImport.map(t => {
    // 根據任務類別自動分派給對應的負責人
    let assignee_id = null;
    if (project) {
      if (t.task_category === "運營") {
        assignee_id = project.operations_id;
      } else if (t.task_category === "行銷") {
        assignee_id = project.marketing_id;
      }
    }

    return {
      project_id: projectId,
      title: t.title,
      source_item: t.source_item,
      task_category: t.task_category,
      reference_point: t.reference_point,
      duration_days: t.duration_days,
      start_date: t.start_date,
      due_date: t.due_date,
      sort_order: t.sort_order,
      status: t.status,
      priority: t.priority,
      assignee_id
    };
  });

  const { error } = await supabase
    .from("tasks")
    .insert(insertPayload);

  if (error) {
    console.error("Error importing tasks:", error);
    return { error: error.message };
  }

  // Check and create OneDrive folder if it doesn't exist
  if (project && !project.drive_folder_url) {
    try {
      const { data: client } = await supabase.from("clients").select("name").eq("id", project.client_id).single();
      const clientName = client?.name || "未知客戶";
      const { createProjectFolder } = await import("@/lib/onedrive");
      const folderUrl = await createProjectFolder(project.name, clientName);
      if (folderUrl) {
        await supabase.from("projects").update({ drive_folder_url: folderUrl }).eq("id", projectId);
      }
    } catch (e) {
      console.error("OneDrive fallback creation failed during task import:", e);
    }
  }

  // Recalculate progress if needed, though all new tasks will be 'todo', progress drops.
  const { recalculateProgress } = await import("./projects");
  await recalculateProgress(projectId);

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function uploadAndParseQuotationForProject(projectId: string, formData: FormData) {
  const file = formData.get("file") as File;
  if (!file || file.size === 0) {
    return { error: "請提供有效的檔案" };
  }

  const supabase = await createClient();
  const { data: project, error: projError } = await supabase
    .from("projects")
    .select("proposal_id")
    .eq("id", projectId)
    .single();

  if (projError || !project?.proposal_id) {
    return { error: "找不到專案或關聯的提案紀錄" };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileExt = file.name.split('.').pop() || 'pdf';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    
    // Upload
    const { uploadToOneDrive } = await import("@/lib/onedrive");
    const quotation_url = await uploadToOneDrive(buffer, fileName);

    // AI Parse
    const { parseQuotation } = await import("@/lib/ai-parser");
    const mimeType = file.type || "application/pdf";
    const parsed_items = await parseQuotation(buffer, mimeType);

    if (!parsed_items) {
       return { error: "AI 解析報價單失敗，請稍後再試或檢查檔案格式" };
    }

    // Update Proposal
    const { error: updateError } = await supabase
      .from("proposals")
      .update({ quotation_url, parsed_items })
      .eq("id", project.proposal_id);

    if (updateError) {
      return { error: `資料庫更新失敗: ${updateError.message}` };
    }

    return { success: true };
  } catch (e: any) {
    console.error("Upload/Parse Error:", e);
    return { error: `處理失敗: ${e.message}` };
  }
}
