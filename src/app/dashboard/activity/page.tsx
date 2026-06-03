import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ActivityPageClient from "./activity-client";

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const resolvedParams = await searchParams;
  const viewMode = resolvedParams.view === "person" ? "person" : "project";

  // Fetch updates based on view mode
  let updates = [];
  
  if (viewMode === "person") {
    // 按人員視角：顯示所有人或特定人員的更新
    const { data } = await supabase
      .from("task_updates")
      .select("*, tasks(title), projects(name), author:profiles!author_id(full_name, avatar_url, role)")
      .order("created_at", { ascending: false })
      .limit(100);
      
    updates = data || [];
  } else {
    // 按專案視角：顯示各專案的更新
    const { data } = await supabase
      .from("task_updates")
      .select("*, tasks(title), projects(name), author:profiles!author_id(full_name, avatar_url, role)")
      .order("created_at", { ascending: false })
      .limit(100);
      
    updates = data || [];
  }

  // 對資料進行分組
  const groupedUpdates = updates.reduce((acc: any, update: any) => {
    let key;
    let title;
    
    if (viewMode === "person") {
      key = update.author_id || "system";
      title = update.author?.full_name || "系統";
    } else {
      key = update.project_id;
      title = update.projects?.name || "未知專案";
    }
    
    if (!acc[key]) {
      acc[key] = {
        title,
        items: []
      };
    }
    acc[key].items.push(update);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem 0' }}>
      <ActivityPageClient initialViewMode={viewMode} groupedUpdates={groupedUpdates} />
    </div>
  );
}
