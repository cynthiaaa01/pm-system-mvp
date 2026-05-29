import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  const isAdmin = profile?.role === "admin";

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "24px" }}>系統設定</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Templates */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", margin: "0 0 8px 0" }}>任務模板管理</h2>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
                管理不同專案類型的標準任務流程與預設時間。
              </p>
            </div>
            <Link 
              href="/dashboard/settings/templates"
              style={{
                padding: "8px 16px",
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "500",
                transition: "var(--transition)"
              }}
            >
              設定模板 →
            </Link>
          </div>
        </div>

        {/* Users (Admin Only) */}
        {isAdmin && (
          <div className="glass-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", margin: "0 0 8px 0" }}>使用者管理</h2>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
                  管理系統使用者、分配權限與職位。
                </p>
              </div>
              <button 
                disabled
                style={{
                  padding: "8px 16px",
                  background: "var(--bg-glass)",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                  borderRadius: "var(--radius-md)",
                  cursor: "not-allowed",
                  fontSize: "14px"
                }}
              >
                尚未開放
              </button>
            </div>
          </div>
        )}

        {/* Integrations */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", margin: "0 0 16px 0" }}>第三方整合</h2>
          
          <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", background: "var(--bg-tertiary)" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#E51670", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "white", fontWeight: "bold" }}>
              n8n
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: "15px", fontWeight: "500", color: "var(--text-primary)", margin: "0 0 4px 0" }}>n8n 工作流引擎</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>負責自動建立專案資料夾與發送 Slack 通知</p>
            </div>
            <span style={{
              padding: "4px 10px",
              borderRadius: "100px",
              fontSize: "12px",
              fontWeight: "500",
              background: "rgba(0, 184, 148, 0.15)",
              color: "var(--success)"
            }}>
              已啟用
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
