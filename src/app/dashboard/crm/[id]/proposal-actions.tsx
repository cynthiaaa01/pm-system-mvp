"use client";

import { useState } from "react";
import { markAsWon, updateProposalStatus, deleteProposal } from "@/actions/proposals";
import { useRouter } from "next/navigation";
import { PROPOSAL_STATUS_LABELS } from "@/lib/constants";
import { ProposalStatus } from "@/types/database";

export default function ProposalActions({ proposal }: { proposal: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isWon = proposal.status === "won";
  const isLost = proposal.status === "lost";
  const isTerminal = isWon || isLost;

  async function handleMarkAsWon() {
    if (!confirm("確定要將此提案標記為成交嗎？系統將自動建立對應的專案與任務。")) return;
    
    setLoading(true);
    const res = await markAsWon(proposal.id);
    setLoading(false);
    
    if (res?.error) {
      alert("操作失敗：" + res.error);
    } else if (res?.projectId) {
      router.push(`/dashboard/projects/${res.projectId}`);
      router.refresh();
    } else {
      router.refresh();
    }
  }

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as ProposalStatus;
    if (newStatus === "won") {
      handleMarkAsWon();
      e.target.value = proposal.status; // reset
      return;
    }
    
    setLoading(true);
    await updateProposalStatus(proposal.id, newStatus);
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("確定要刪除此提案嗎？此操作無法復原。")) return;
    
    setLoading(true);
    const res = await deleteProposal(proposal.id);
    if (res?.error) {
      alert("刪除失敗：" + res.error);
      setLoading(false);
    } else {
      router.push("/dashboard/crm");
      router.refresh();
    }
  }

  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      {!isTerminal && (
        <>
          <select 
            value={proposal.status} 
            onChange={handleStatusChange}
            disabled={loading}
            style={{
              padding: "8px 12px",
              background: "var(--bg-glass)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              fontSize: "14px",
              outline: "none"
            }}
          >
            {Object.entries(PROPOSAL_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value} disabled={value === "won"}>
                {label}
              </option>
            ))}
          </select>

          <button
            onClick={handleMarkAsWon}
            disabled={loading}
            style={{
              padding: "10px 20px",
              background: "linear-gradient(135deg, #00b894, #00cec9)",
              border: "none",
              color: "white",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 4px 15px rgba(0, 184, 148, 0.3)",
              transition: "var(--transition)"
            }}
          >
            {loading ? "處理中..." : "🎉 標記為成交"}
          </button>
        </>
      )}

      <button
        onClick={handleDelete}
        disabled={loading}
        style={{
          padding: "10px 16px",
          background: "transparent",
          border: "1px solid rgba(255, 71, 87, 0.5)",
          color: "#ff4757",
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          opacity: loading ? 0.7 : 1,
          transition: "all 0.2s"
        }}
        onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255, 71, 87, 0.1)"; }}
        onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; }}
      >
        🗑️ 刪除提案
      </button>
    </div>
  );
}
