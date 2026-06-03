"use client";

import { useState } from "react";
import { assignOperationsManager, assignMarketingManager } from "@/actions/project-assignment";

interface ManagerAssignSelectProps {
  projectId: string;
  currentManagerId?: string;
  role: "operations" | "marketing";
  users: any[];
}

export default function ManagerAssignSelect({ projectId, currentManagerId, role, users }: ManagerAssignSelectProps) {
  const [loading, setLoading] = useState(false);

  const handleAssign = async (userId: string) => {
    setLoading(true);
    if (role === "operations") {
      await assignOperationsManager(projectId, userId);
    } else {
      await assignMarketingManager(projectId, userId);
    }
    setLoading(false);
  };

  return (
    <select
      value={currentManagerId || ""}
      onChange={(e) => handleAssign(e.target.value)}
      disabled={loading}
      style={{
        width: "100%", padding: "4px", background: "rgba(255, 255, 255, 0.05)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: "14px", outline: "none", cursor: "pointer"
      }}
    >
      {role === "marketing" && (
        <option value="" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>-- 未指派 --</option>
      )}
      {users.map((u) => (
        <option key={u.id} value={u.id} style={{ color: "var(--text-primary)", background: "var(--bg-secondary)" }}>
          {u.full_name}
        </option>
      ))}
    </select>
  );
}
