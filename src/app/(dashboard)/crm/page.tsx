import Link from "next/link";
import { getProposals } from "@/actions/proposals";
import CrmFilters from "./crm-filters";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_COLORS } from "@/lib/constants";
import type { ProposalStatus } from "@/types/database";

export default async function CrmPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined;

  const proposals = await getProposals({ status, search });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "600", color: "var(--text-primary)" }}>提案管理</h1>
        <Link 
          href="/dashboard/crm/new"
          style={{
            padding: "10px 16px",
            background: "linear-gradient(135deg, var(--accent-purple), var(--accent-blue))",
            color: "white",
            borderRadius: "var(--radius-md)",
            fontSize: "14px",
            fontWeight: "600",
            textDecoration: "none",
          }}
        >
          + 新增提案
        </Link>
      </div>

      <CrmFilters />

      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,0.2)" }}>
              <th style={{ padding: "16px", color: "var(--text-secondary)", fontSize: "13px", fontWeight: "500" }}>提案編號</th>
              <th style={{ padding: "16px", color: "var(--text-secondary)", fontSize: "13px", fontWeight: "500" }}>客戶</th>
              <th style={{ padding: "16px", color: "var(--text-secondary)", fontSize: "13px", fontWeight: "500" }}>提案名稱</th>
              <th style={{ padding: "16px", color: "var(--text-secondary)", fontSize: "13px", fontWeight: "500" }}>金額</th>
              <th style={{ padding: "16px", color: "var(--text-secondary)", fontSize: "13px", fontWeight: "500" }}>業務</th>
              <th style={{ padding: "16px", color: "var(--text-secondary)", fontSize: "13px", fontWeight: "500" }}>狀態</th>
              <th style={{ padding: "16px", color: "var(--text-secondary)", fontSize: "13px", fontWeight: "500" }}>預計開始日</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((proposal) => (
              <tr key={proposal.id} style={{ borderBottom: "1px solid var(--border)", transition: "var(--transition)" }} className="table-row">
                <td style={{ padding: "16px" }}>
                  <Link href={`/dashboard/crm/${proposal.id}`} style={{ color: "var(--text-primary)", textDecoration: "none", fontWeight: "500" }}>
                    {proposal.proposal_number}
                  </Link>
                </td>
                <td style={{ padding: "16px", color: "var(--text-primary)", fontSize: "14px" }}>{proposal.clients?.name}</td>
                <td style={{ padding: "16px", color: "var(--text-primary)", fontSize: "14px" }}>{proposal.title}</td>
                <td style={{ padding: "16px", color: "var(--text-primary)", fontSize: "14px" }}>{formatCurrency(proposal.amount || 0)}</td>
                <td style={{ padding: "16px", color: "var(--text-secondary)", fontSize: "14px" }}>{proposal.profiles?.full_name}</td>
                <td style={{ padding: "16px" }}>
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
                </td>
                <td style={{ padding: "16px", color: "var(--text-secondary)", fontSize: "14px" }}>{formatDate(proposal.expected_start)}</td>
              </tr>
            ))}
            {proposals.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>
                  沒有符合條件的提案
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .table-row:hover {
          background: var(--bg-glass);
        }
      `}</style>
    </div>
  );
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "#74b9ff");
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "116, 185, 255";
}
