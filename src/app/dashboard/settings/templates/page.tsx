import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PROJECT_TYPE_LABELS, ROLE_LABELS } from "@/lib/constants";

import type { ProjectType } from "@/types/database";

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("task_templates")
    .select("*")
    .order("project_type");

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
        {(templates || []).map((template) => {
          const tasks = (template.tasks as any[]) || [];
          return (
            <div key={template.id} className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", background: "rgba(0,0,0,0.2)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>
                  {PROJECT_TYPE_LABELS[template.project_type as ProjectType] || template.project_type} - {template.name}
                </h2>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", background: "var(--bg-tertiary)", padding: "4px 8px", borderRadius: "100px" }}>
                  {tasks.length} 個任務
                </span>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "12px 20px", color: "var(--text-secondary)", fontSize: "13px", width: "80px" }}>順序</th>
                    <th style={{ padding: "12px 20px", color: "var(--text-secondary)", fontSize: "13px" }}>任務名稱</th>
                    <th style={{ padding: "12px 20px", color: "var(--text-secondary)", fontSize: "13px", width: "150px" }}>優先度</th>
                    <th style={{ padding: "12px 20px", color: "var(--text-secondary)", fontSize: "13px", width: "150px" }}>相對開始日</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task: any, index: number) => (
                    <tr key={index} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 20px", color: "var(--text-muted)", fontSize: "14px" }}>
                        {task.sort_order}
                      </td>
                      <td style={{ padding: "12px 20px", color: "var(--text-primary)", fontSize: "14px", fontWeight: "500" }}>
                        {task.title}
                      </td>
                      <td style={{ padding: "12px 20px", color: "var(--text-secondary)", fontSize: "13px" }}>
                        {task.priority}
                      </td>
                      <td style={{ padding: "12px 20px", color: "var(--text-secondary)", fontSize: "13px" }}>
                        專案開始後 <span style={{ color: "var(--text-primary)" }}>{task.default_offset_days}</span> 天
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}

        {(templates || []).length === 0 && (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)", background: "var(--bg-glass)", borderRadius: "var(--radius-lg)" }}>
            目前沒有任何任務模板
          </div>
        )}
      </div>
    </div>
  );
}
