import Link from "next/link";
import { getProposal } from "@/actions/proposals";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PROJECT_TYPE_LABELS, PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_COLORS } from "@/lib/constants";
import type { ProposalStatus, ProjectType } from "@/types/database";
import ProposalActions from "./proposal-actions";

export default async function ProposalDetailPage({ params }: { params: { id: string } }) {
  const proposal = await getProposal(params.id);

  if (!proposal) {
    notFound();
  }

  const isWon = proposal.status === "won";
  const hasProject = proposal.projects && proposal.projects.length > 0;
  const project = hasProject ? proposal.projects[0] : null;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <Link 
          href="/dashboard/crm"
          style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px", textDecoration: "none" }}
        >
          ← 返回列表
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
              {proposal.title}
            </h1>
            <span style={{
              padding: "4px 10px",
              borderRadius: "100px",
              fontSize: "12px",
              fontWeight: "500",
              background: `rgba(${hexToRgb(PROPOSAL_STATUS_COLORS[proposal.status as ProposalStatus])}, 0.15)`,
              color: PROPOSAL_STATUS_COLORS[proposal.status as ProposalStatus]
            }}>
              {PROPOSAL_STATUS_LABELS[proposal.status as ProposalStatus]}
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            提案編號: {proposal.proposal_number}
          </p>
        </div>
        
        <ProposalActions proposal={proposal} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="glass-card" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", margin: "0 0 16px 0" }}>提案資訊</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 4px 0" }}>客戶</p>
                <p style={{ fontSize: "15px", color: "var(--text-primary)", margin: 0, fontWeight: "500" }}>{proposal.clients?.name}</p>
              </div>
              
              <div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 4px 0" }}>業務負責人</p>
                <p style={{ fontSize: "15px", color: "var(--text-primary)", margin: 0 }}>{proposal.profiles?.full_name}</p>
              </div>

              <div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 4px 0" }}>專案類型</p>
                <p style={{ fontSize: "15px", color: "var(--text-primary)", margin: 0 }}>{PROJECT_TYPE_LABELS[(proposal.project_type || "") as ProjectType] || proposal.project_type}</p>
              </div>

              <div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 4px 0" }}>提案金額</p>
                <p style={{ fontSize: "15px", margin: 0, fontWeight: "600", color: "var(--accent-blue-light)" }}>
                  {formatCurrency(proposal.amount || 0)}
                </p>
              </div>
              
              <div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 4px 0" }}>預計開始日</p>
                <p style={{ fontSize: "15px", color: "var(--text-primary)", margin: 0 }}>{formatDate(proposal.expected_start) || "未設定"}</p>
              </div>

              <div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 4px 0" }}>預計結束日</p>
                <p style={{ fontSize: "15px", color: "var(--text-primary)", margin: 0 }}>{formatDate(proposal.expected_end) || "未設定"}</p>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", margin: "0 0 16px 0" }}>備註</h2>
            <div style={{ color: "var(--text-primary)", fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
              {proposal.notes || <span style={{ color: "var(--text-muted)" }}>無備註內容</span>}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {isWon && project && (
            <div className="glass-card" style={{ padding: "24px", border: "1px solid rgba(0, 184, 148, 0.3)", background: "rgba(0, 184, 148, 0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <span style={{ fontSize: "20px" }}>🏆</span>
                <h2 style={{ fontSize: "16px", fontWeight: "600", color: "var(--success)", margin: 0 }}>已成功轉為專案</h2>
              </div>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px" }}>
                專案編號: {project.project_number}
              </p>
              <Link 
                href={`/dashboard/projects/${project.id}`}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "10px",
                  background: "var(--success)",
                  color: "white",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                前往專案管理
              </Link>
            </div>
          )}

          <div className="glass-card" style={{ padding: "24px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", margin: "0 0 16px 0" }}>報價單文件</h2>
            {proposal.quotation_url ? (
              <a 
                href={proposal.quotation_url} 
                target="_blank" 
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px",
                  background: "rgba(108, 92, 231, 0.1)",
                  border: "1px solid rgba(108, 92, 231, 0.3)",
                  color: "var(--accent-purple-light)",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  fontWeight: "500",
                  fontSize: "14px",
                  transition: "var(--transition)"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                下載或預覽報價單
              </a>
            ) : (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", fontSize: "13px", background: "var(--bg-glass)", borderRadius: "var(--radius-md)" }}>
                尚未上傳報價單
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "#74b9ff");
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "116, 185, 255";
}
