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
    .single();

  if (error) {
    console.error("Error fetching proposal:", error);
    return null;
  }
  return data;
}

export async function createProposal(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get("title") as string;
  const client_id = formData.get("client_id") as string;
  const amountStr = formData.get("amount") as string;
  const amount = amountStr ? parseFloat(amountStr) : null;
  const project_type = formData.get("project_type") as ProjectType;
  const expected_start = formData.get("expected_start") as string;
  const expected_end = formData.get("expected_end") as string;
  const notes = formData.get("notes") as string;
  const quotationFile = formData.get("quotation") as File | null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  let quotation_url = null;
  if (quotationFile && quotationFile.size > 0) {
    const fileExt = quotationFile.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('quotations')
      .upload(filePath, quotationFile);
      
    if (uploadError) {
      console.error("Upload error:", uploadError);
    } else {
      const { data: publicUrlData } = supabase.storage
        .from('quotations')
        .getPublicUrl(filePath);
      quotation_url = publicUrlData.publicUrl;
    }
  }

  const { data, error } = await supabase
    .from("proposals")
    .insert({
      title,
      client_id,
      amount,
      project_type,
      expected_start: expected_start || null,
      expected_end: expected_end || null,
      notes,
      quotation_url,
      sales_person_id: user.id,
      status: 'lead'
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating proposal:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/crm");
  redirect(`/dashboard/crm/${data.id}`);
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
  
  revalidatePath(`/dashboard/crm/${id}`);
  revalidatePath("/dashboard/crm");
  return { success: true };
}

export async function markAsWon(id: string) {
  const supabase = await createClient();
  
  // 1. Get proposal details
  const { data: proposal, error: fetchError } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", id)
    .single();
    
  if (fetchError || !proposal) return { error: "Proposal not found" };
  
  // 2. Update status
  await updateProposalStatus(id, 'won');
  
  // 3. Create project
  const startDate = proposal.expected_start ? new Date(proposal.expected_start) : new Date();
  const endDate = proposal.expected_end ? new Date(proposal.expected_end) : addDays(startDate, 30);
  
  const { data: project, error: projError } = await supabase
    .from("projects")
    .insert({
      name: proposal.title,
      client_id: proposal.client_id,
      proposal_id: proposal.id,
      project_type: proposal.project_type || 'online_event',
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      status: 'pending'
    })
    .select()
    .single();
    
  if (projError) {
    console.error("Project creation error:", projError);
    return { error: projError.message };
  }
  
  // 4. Create tasks from template
  if (project.project_type) {
    const { data: templates } = await supabase
      .from("task_templates")
      .select("*")
      .eq("project_type", project.project_type)
      .order("sort_order");
      
    if (templates && templates.length > 0) {
      const tasksToCreate = templates.map(t => {
        const tStart = addDays(startDate, t.delay_days);
        const tEnd = addDays(tStart, t.duration_days);
        return {
          project_id: project.id,
          name: t.task_name,
          sort_order: t.sort_order,
          start_date: tStart.toISOString().split('T')[0],
          due_date: tEnd.toISOString().split('T')[0],
          status: 'todo' as any,
          priority: 'medium' as any,
        };
      });
      
      await supabase.from("tasks").insert(tasksToCreate);
    }
  }
  
  // 5. Trigger n8n webhook (non-blocking)
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
  
  revalidatePath("/dashboard/crm");
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/crm/${id}`);
  
  return { success: true, projectId: project.id };
}
