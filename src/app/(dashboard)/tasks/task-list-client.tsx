"use client";

import { useState } from "react";
import { updateTaskStatus } from "@/actions/tasks";
import { formatDate } from "@/lib/utils";
import { TASK_STATUS_LABELS, PRIORITY_COLORS } from "@/lib/constants";
import type { TaskPriority } from "@/types/database";
import Link from "next/link";

export default function TaskListClient({ initialTasks }: { initialTasks: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Optimistic UI update could be implemented here, but we'll keep it simple and just show a loading state
  
  async function handleStatusChange(taskId: string, newStatus: string, projectId: string) {
    setLoadingId(taskId);
    await updateTaskStatus(taskId, newStatus, projectId);
    setLoadingId(null);
  }

  // Group tasks by status
  const groupedTasks = {
    todo: initialTasks.filter(t => t.status === "todo"),
    in_progress: initialTasks.filter(t => t.status === "in_progress"),
    review: initialTasks.filter(t => t.status === "review"),
    delayed: initialTasks.filter(t => t.status === "delayed"),
  };

  const now = new Date();

  const renderTaskCard = (task: any) => {
    const due = task.due_date ? new Date(task.due_date) : null;
    const isOverdue = due && due < now;

    return (
      <div key={task.id} className="glass-card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", borderLeft: `3px solid ${PRIORITY_COLORS[task.priority as TaskPriority] || "var(--text-muted)"}`, opacity: loadingId === task.id ? 0.6 : 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>
            {task.name}
          </h3>
          <span style={{ fontSize: "11px", color: isOverdue ? "var(--danger)" : "var(--text-muted)", background: isOverdue ? "var(--danger-bg)" : "var(--bg-glass)", padding: "2px 6px", borderRadius: "4px" }}>
            {formatDate(task.due_date)} {isOverdue ? "(逾期)" : ""}
          </span>
        </div>

        <Link href={`/dashboard/projects/${task.project_id}`} style={{ fontSize: "13px", color: "var(--accent-blue-light)", textDecoration: "none" }}>
          {task.projects?.name}
        </Link>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(task.id, e.target.value, task.project_id)}
            disabled={loadingId === task.id}
            style={{
              padding: "4px 8px",
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border)",
              borderRadius: "100px",
              color: "var(--text-primary)",
              fontSize: "12px",
              fontWeight: "500",
              outline: "none",
              cursor: "pointer"
            }}
          >
            {Object.entries(TASK_STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          
          {task.status !== "done" && (
            <button
              onClick={() => handleStatusChange(task.id, "done", task.project_id)}
              disabled={loadingId === task.id}
              style={{
                padding: "6px 12px",
                background: "rgba(0, 184, 148, 0.15)",
                border: "1px solid rgba(0, 184, 148, 0.3)",
                color: "var(--success)",
                borderRadius: "var(--radius-sm)",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "var(--transition)"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "rgba(0, 184, 148, 0.25)"}
              onMouseOut={(e) => e.currentTarget.style.background = "rgba(0, 184, 148, 0.15)"}
            >
              完成
            </button>
          )}
        </div>
      </div>
    );
  };

  if (initialTasks.length === 0) {
    return (
      <div style={{ padding: "64px", textAlign: "center", color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
        <div style={{ fontSize: "32px", marginBottom: "16px" }}>🎉</div>
        <p>目前沒有待處理的任務</p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", alignItems: "start" }}>
      
      {/* Todo Column */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingBottom: "12px", borderBottom: "2px solid var(--border)" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#74b9ff" }} />
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>待開始</h2>
          <span style={{ background: "var(--bg-glass)", padding: "2px 8px", borderRadius: "100px", fontSize: "12px", color: "var(--text-secondary)" }}>
            {groupedTasks.todo.length}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {groupedTasks.todo.map(renderTaskCard)}
        </div>
      </div>

      {/* In Progress Column */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingBottom: "12px", borderBottom: "2px solid var(--border)" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#6c5ce7" }} />
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>進行中</h2>
          <span style={{ background: "var(--bg-glass)", padding: "2px 8px", borderRadius: "100px", fontSize: "12px", color: "var(--text-secondary)" }}>
            {groupedTasks.in_progress.length}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {groupedTasks.in_progress.map(renderTaskCard)}
        </div>
      </div>

      {/* Review / Delayed Column */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingBottom: "12px", borderBottom: "2px solid var(--border)" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#fdcb6e" }} />
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>待確認 / 延遲</h2>
          <span style={{ background: "var(--bg-glass)", padding: "2px 8px", borderRadius: "100px", fontSize: "12px", color: "var(--text-secondary)" }}>
            {groupedTasks.review.length + groupedTasks.delayed.length}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {groupedTasks.review.map(renderTaskCard)}
          {groupedTasks.delayed.map(renderTaskCard)}
        </div>
      </div>

    </div>
  );
}
