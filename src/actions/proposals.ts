"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ProposalStatus, ProjectType } from "@/types/database";
import { addDays } from "date-fns";

export async function getProposals(filters?: { status?: string; search?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("proposals")
    .select("*, clients(name), profiles:sales_person_id(full_name)")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,proposal_number.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching proposals:", error);
    return [];
  }
  return data;
}

export async function getProposal(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("*, clients(*), profiles:sales_person_id(full_name), projects(id, name, project_number)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching proposal details:", error.message, error.details, error.hint, error.code);
    throw new Error(`資料庫讀取失敗: ${error.message || JSON.stringify(error)}`);
  }
  return data;
}

export async function createProposal(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const client_name = formData.get("client_name") as string;
  const amountStr = formData.get("amount") as string;
  const amount = amountStr ? parseFloat(amountStr) : null;
  const expected_start = formData.get("expected_start") as string;
  const expected_end = formData.get("expected_end") as string;
  const notes = formData.get("notes") as string;
  const quotationFile = formData.get("quotation") as File | null;
  
  const rawTags = formData.getAll("tags") as string[];
  const customTagStr = formData.get("custom_tag") as string;
  let tags = [...rawTags];
  if (customTagStr) {
    const customTags = customTagStr.split(",").map(t => t.trim()).filter(Boolean);
    tags = [...tags, ...customTags];
  }

  const client_tag = formData.get("client_tag") as string || null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // 0. Find or create client
  let client_id = null;
  if (client_name) {
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("name", client_name)
      .maybeSingle();
      
    if (existingClient) {
      client_id = existingClient.id;
    } else {
      const { data: newClient } = await supabase
        .from("clients")
        .insert({ name: client_name })
        .select("id")
        .single();
      if (newClient) client_id = newClient.id;
    }
  }

  if (!client_id) return { error: "Client is required" };

  let quotation_url = null;
  let parsed_items = null;

  if (quotationFile && quotationFile.size > 0) {
    try {
      // 1. 將 File 轉換為 Buffer
      const arrayBuffer = await quotationFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileExt = quotationFile.name.split('.').pop() || 'pdf';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      
      // 2. 上傳到 OneDrive
      const { uploadToOneDrive } = await import("@/lib/onedrive");
      quotation_url = await uploadToOneDrive(buffer, fileName);

      // 3. 呼叫 Gemini AI 進行解析
      const { parseQuotation } = await import("@/lib/ai-parser");
      const mimeType = quotationFile.type || "application/pdf";
      parsed_items = await parseQuotation(buffer, mimeType);

    } catch (e: any) {
      console.error("OneDrive/AI Error:", e);
      // Even if upload/parse fails, we might still want to create the record, or we can abort.
      // For now, we continue but just log the error.
      return { error: `File processing failed: ${e.message}` };
    }
  }

  const { data, error } = await supabase
    .from("proposals")
    .insert({
      title,
      client_id,
      amount,
      expected_start: expected_start || null,
      expected_end: expected_end || null,
      notes,
      quotation_url,
      parsed_items,
      tags,
      client_tag,
      sales_person_id: user.id,
      status: 'lead'
    })
    .select();

  if (error) {
    console.error("Error creating proposal:", error);
    return { error: error.message };
  }

  // 安全地取得 ID，因為有時候 Supabase 根據版本差異可能會回傳陣列
  const insertedId = Array.isArray(data) ? (data as any)[0]?.id : (data as any)?.id;
  
  if (!insertedId) {
    console.error("No ID returned from insert. Data was:", data);
    return { error: "新增成功，但無法取得提案 ID (可能是資料庫權限設定導致無法讀取)" };
  }

  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/crm/${insertedId}`);
}

export async function updateProposalStatus(id: string, status: ProposalStatus) {
  const supabase = await createClient();
  const updates: any = { status };
  
  if (status === 'won') {
    updates.won_at = new Date().toISOString();
  }
  
  const { error } = await supabase
    .from("proposals")
    .update(updates)
    .eq("id", id);
    
  if (error) {
    console.error("Error updating status:", error);
    return { error: error.message };
  }

  // 提案未成交(lost)時，自動刪除關聯專案
  if (status === 'lost') {
    await supabase.from("projects").delete().eq("proposal_id", id);
  }
  
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function markAsWon(id: string) {
  const supabase = await createClient();
  
  // 1. Get proposal details
  const { data: proposal, error: fetchError } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", id)
    .maybeSingle();
    
  if (fetchError || !proposal) return { error: "Proposal not found" };
  
  const startDate = proposal.expected_start ? new Date(proposal.expected_start) : new Date();
  const endDate = proposal.expected_end ? new Date(proposal.expected_end) : addDays(startDate, 30);
  
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id || proposal.sales_person_id; // 如果抓不到當前使用者，至少指派給原業務

  // 1. Create project first (so we don't end up with a won proposal and no project if this fails)
  const { data: project, error: projError } = await supabase
    .from("projects")
    .insert({
      name: proposal.title,
      client_id: proposal.client_id,
      proposal_id: proposal.id,
      operations_id: currentUserId, // 預設指派給當前操作者或原業務，避免違反 not-null 限制
      marketing_id: null,  // 待行銷主管指派
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      status: 'pending',
      project_type: proposal.project_type || 'online_event',
      tags: proposal.tags || []
    })
    .select()
    .single();
    
  if (projError) {
    console.error("Project creation error:", projError);
    return { error: projError.message };
  }

  // 2. Update status ONLY IF project creation succeeds
  await updateProposalStatus(id, 'won');
  
  // 4. Create OneDrive Folder
  const clientName = proposal.clients?.name || "未知客戶";
  let folderUrl = null;
  try {
    const { createProjectFolder } = await import("@/lib/onedrive");
    folderUrl = await createProjectFolder(project.name, clientName);
    
    if (folderUrl) {
      await supabase.from("projects").update({ drive_folder_url: folderUrl }).eq("id", project.id);
    }
  } catch (e) {
    console.error("OneDrive creation failed:", e);
  }

  // 5. Generate tasks from quotation items using fuzzy matching
  if (proposal.parsed_items?.items && proposal.parsed_items.items.length > 0) {
    // Get all unique template item names
    const { data: allTemplateNames } = await supabase
      .from("quotation_item_templates")
      .select("item_name")
      .order("item_name");
    
    const uniqueNames = [...new Set((allTemplateNames || []).map((t: any) => t.item_name))];
    
    // Match each parsed item against templates
    const { fuzzyMatchItems, generateTasksFromTemplates } = await import("@/lib/task-generation");
    
    const matchedItemNames: string[] = [];
    for (const item of proposal.parsed_items.items) {
      const matches = fuzzyMatchItems(item.name, uniqueNames);
      matchedItemNames.push(...matches);
    }
    
    // Remove duplicates
    const uniqueMatched = [...new Set(matchedItemNames)];
    
    if (uniqueMatched.length > 0) {
      // Fetch all templates for matched items
      const { data: templates } = await supabase
        .from("quotation_item_templates")
        .select("*")
        .in("item_name", uniqueMatched)
        .order("sort_order");
      
      if (templates && templates.length > 0) {
        const projectDates = {
          start_date: project.start_date,
          event_online_date: null,
          event_end_date: null,
          material_confirm_date: null,
          physical_event_date: null,
          system_online_date: null,
          monthly_settle_date: null,
        };
        
        const generatedTasks = generateTasksFromTemplates(templates, projectDates);
        
        const tasksToInsert = generatedTasks.map((t: any) => {
          let assignee_id = null;
          if (t.task_category === "運營") {
            assignee_id = project.operations_id;
          } else if (t.task_category === "行銷") {
            assignee_id = project.marketing_id;
          }

          return {
            project_id: project.id,
            title: t.title,
            source_item: t.source_item,
            task_category: t.task_category,
            reference_point: t.reference_point,
            start_date: t.start_date,
            due_date: t.due_date,
            duration_days: t.duration_days,
            sort_order: t.sort_order,
            status: 'todo' as any,
            priority: 'medium' as any,
            assignee_id
          };
        });
        
        await supabase.from("tasks").insert(tasksToInsert);
      }
    }
  }
  
  // 6. Trigger n8n webhook (non-blocking)
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const apiKey = process.env.N8N_API_KEY;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "Authorization": `Bearer ${apiKey}` } : {})
        },
        body: JSON.stringify({
          event: "proposal.won",
          proposal,
          project
        })
      }).catch(e => console.error("Webhook fetch failed:", e));
    }
  } catch (e) {
    console.error("Error triggering webhook:", e);
  }
  
  revalidatePath("/dashboard", "layout");
  return { success: true, projectId: project.id };
}

export async function deleteProposal(id: string) {
  const supabase = await createClient();
  
  // 1. 確保連動刪除關聯專案
  await supabase.from("projects").delete().eq("proposal_id", id);

  // 2. 刪除提案
  const { error } = await supabase
    .from("proposals")
    .delete()
    .eq("id", id);
    
  if (error) {
    console.error("Error deleting proposal:", error);
    return { error: error.message };
  }
  
  revalidatePath("/dashboard", "layout");
  return { success: true };
}
