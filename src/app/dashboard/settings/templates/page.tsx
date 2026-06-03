import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("quotation_item_templates")
    .select("*")
    .order("item_name")
    .order("sort_order");

  // Group templates by item_name
  const groupedTemplates: Record<string, any[]> = {};
  if (templates) {
    for (const t of templates) {
      if (!groupedTemplates[t.item_name]) {
        groupedTemplates[t.item_name] = [];
      }
      groupedTemplates[t.item_name].push(t);
    }
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <Link 
          href="/dashboard/settings"
          style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px", textDecoration: "none" }}
        >
          ← 返回設定
        </Link>
        <h1 style={{ fontSize: "24px", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>任務模板管理</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        {Object.entries(groupedTemplates).map(([itemName, tasks]) => {
          return (
            <div key={itemName} className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", background: "rgba(0,0,0,0.2)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>
                  品項名稱：{itemName}
                </h2>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", background: "var(--bg-tertiary)", padding: "4px 8px", borderRadius: "100px" }}>
                  {tasks.length} 個任務
                </span>
              </div>

              <div style={{ width: "100%", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "600px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      <th style={{ padding: "12px 20px", color: "var(--text-secondary)", fontSize: "13px", width: "60px" }}>順序</th>
                      <th style={{ padding: "12px 20px", color: "var(--text-secondary)", fontSize: "13px" }}>任務名稱</th>
                      <th style={{ padding: "12px 20px", color: "var(--text-secondary)", fontSize: "13px", width: "120px" }}>任務類別</th>
                      <th style={{ padding: "12px 20px", color: "var(--text-secondary)", fontSize: "13px", width: "100px" }}>基準點</th>
                      <th style={{ padding: "12px 20px", color: "var(--text-secondary)", fontSize: "13px", width: "80px" }}>偏移天數</th>
                      <th style={{ padding: "12px 20px", color: "var(--text-secondary)", fontSize: "13px", width: "80px" }}>持續天數</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task: any, index: number) => (
                      <tr key={task.id || index} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 20px", color: "var(--text-muted)", fontSize: "14px" }}>
                          {task.sort_order}
                        </td>
                        <td style={{ padding: "12px 20px", color: "var(--text-primary)", fontSize: "14px", fontWeight: "500" }}>
                          {task.task_name}
                        </td>
                        <td style={{ padding: "12px 20px", color: "var(--text-secondary)", fontSize: "13px" }}>
                          {task.task_category}
                        </td>
                        <td style={{ padding: "12px 20px", color: "var(--text-secondary)", fontSize: "13px" }}>
                          {task.reference_point}
                        </td>
                        <td style={{ padding: "12px 20px", color: "var(--text-secondary)", fontSize: "13px" }}>
                          {task.offset_days > 0 ? `+${task.offset_days}` : task.offset_days} 天
                        </td>
                        <td style={{ padding: "12px 20px", color: "var(--text-secondary)", fontSize: "13px" }}>
                          {task.duration_days} 天
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {Object.keys(groupedTemplates).length === 0 && (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)", background: "var(--bg-glass)", borderRadius: "var(--radius-lg)" }}>
            目前沒有任何任務模板
          </div>
        )}
      </div>
    </div>
  );
}
