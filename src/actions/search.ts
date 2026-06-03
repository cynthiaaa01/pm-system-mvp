"use server";

import { createClient } from "@/lib/supabase/server";

export async function searchKnowledgeBase(query: string, selectedTags: string[] = []) {
  const supabase = await createClient();
  
  // 取得所有專案與其對應的任務
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*, tasks(id, title, status)")
    .order("created_at", { ascending: false });

  if (error || !projects) {
    console.error("Search error:", error);
    return [];
  }

  const q = query.toLowerCase().trim();

  // 進行過濾
  const results = projects.filter((project) => {
    let matchTags = true;
    
    // 如果有指定標籤，則專案必須包含所有指定的標籤
    if (selectedTags.length > 0) {
      const projectTags = project.tags || [];
      matchTags = selectedTags.every(tag => projectTags.includes(tag));
    }

    if (!matchTags) return false;
    if (!q) return true; // 如果沒有輸入關鍵字，只用標籤篩選

    // 關鍵字比對：專案名稱、描述、標籤
    const matchProjectName = project.name.toLowerCase().includes(q);
    const matchProjectDesc = project.description?.toLowerCase().includes(q) || false;
    const matchProjectTags = (project.tags || []).some((tag: string) => tag.toLowerCase().includes(q));
    
    // 關鍵字比對：專案內的所有任務名稱
    const matchTasks = project.tasks?.some((task: any) => task.title.toLowerCase().includes(q)) || false;

    return matchProjectName || matchProjectDesc || matchProjectTags || matchTasks;
  });

  return results;
}

// 用於更新專案標籤
export async function updateProjectTags(projectId: string, tags: string[]) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("projects")
    .update({ tags })
    .eq("id", projectId);

  if (error) {
    console.error("Update tags error:", error);
    return { error: error.message };
  }

  return { success: true };
}
