"use client";

import { useState, useEffect } from "react";
import { getClients } from "@/actions/clients";
import { createProposal } from "@/actions/proposals";
import { useRouter } from "next/navigation";

export default function NewProposalPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    getClients().then(setClients);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await createProposal(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <button 
          onClick={() => router.back()}
          style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px" }}
        >
          ← 返回
        </button>
        <h1 style={{ fontSize: "24px", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>新增提案</h1>
      </div>

      <div className="glass-card" style={{ padding: "32px" }}>
        {error && (
          <div style={{ padding: "12px", background: "var(--danger-bg)", color: "var(--danger)", borderRadius: "var(--radius-md)", marginBottom: "24px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Client */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>客戶名稱 *</label>
              <input 
                name="client_name"
                list="clients-list"
                required 
                placeholder="請輸入或選擇客戶名稱"
                style={inputStyle}
              />
              <datalist id="clients-list">
                {clients.map(c => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>

            {/* Tags */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>活動標籤</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {['線上任務', '線上電競賽', '實體電競賽', '攤位活動'].map(tag => (
                  <label key={tag} style={{ 
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "6px 12px",
                    background: "var(--bg-tertiary)",
                    border: "1px solid var(--border)",
                    borderRadius: "100px",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: "var(--text-primary)",
                    transition: "var(--transition)"
                  }}>
                    <input type="checkbox" name="tags" value={tag} style={{ accentColor: "var(--accent-purple)" }} />
                    {tag}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>提案名稱 *</label>
            <input 
              name="title" 
              required 
              style={inputStyle} 
              placeholder="例如：2026年Q3線上活動" 
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Amount */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>提案金額</label>
              <input 
                name="amount" 
                type="number" 
                style={inputStyle} 
                placeholder="0" 
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Start Date */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>預計開始日</label>
              <input 
                name="expected_start" 
                type="date" 
                style={inputStyle} 
              />
            </div>

            {/* End Date */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>預計結束日</label>
              <input 
                name="expected_end" 
                type="date" 
                style={inputStyle} 
              />
            </div>
          </div>

          {/* Quotation Upload */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>上傳報價單</label>
            <input 
              name="quotation" 
              type="file" 
              accept=".pdf,.png,.jpg,.jpeg"
              style={{...inputStyle, padding: "8px"}} 
            />
          </div>

          {/* Notes */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>備註</label>
            <textarea 
              name="notes" 
              rows={4}
              style={{...inputStyle, resize: "vertical"}} 
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
            <button 
              type="button" 
              onClick={() => router.back()}
              style={{ padding: "10px 20px", background: "var(--bg-glass)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "var(--radius-md)", cursor: "pointer" }}
            >
              取消
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                padding: "10px 24px", 
                background: "linear-gradient(135deg, var(--accent-purple), var(--accent-blue))", 
                border: "none", 
                color: "white", 
                borderRadius: "var(--radius-md)", 
                cursor: "pointer",
                fontWeight: "600",
                opacity: loading ? 0.7 : 1,
                minWidth: "150px"
              }}
            >
              {loading ? "處理中... (AI解析約需5秒)" : "建立提案"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  background: "var(--bg-tertiary)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  color: "var(--text-primary)",
  fontSize: "14px",
  outline: "none",
};
