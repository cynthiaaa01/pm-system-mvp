"use client";

import { useState } from "react";
import { updateTaskStatus, assignTask } from "@/actions/tasks";
import { updateProjectStatus } from "@/actions/projects";
import { formatDate } from "@/lib/utils";
import { TASK_STATUS_LABELS, PROJECT_STATUS_LABELS, PRIORITY_COLORS } from "@/lib/constants";
import type { TaskPriority } from "@/types/database";

export default function ProjectDetailClient({ project, tasks, users }: { project: any, tasks: any[], users: any[] }) {
  const [loading, setLoading] = useState(false);

  async function handleProjectStatus(e: React.ChangeEvent<HTMLSelectElement>) {
    setLoading(true);
    await updateProjectStatus(project.id, e.target.value);
    setLoading(false);
  }

  async function handleTaskStatus(taskId: string, status: string) {
    setLoading(true);
    await updateTaskStatus(taskId, status, project.id);
    setLoading(false);
  }

  async function handleAssign(taskId: string, assigneeId: string) {
    setLoading(true);
    await assignTask(taskId, assigneeId, project.id);
    setLoading(false);
  }

  const now = new Date();

  return (
    <div className="glass-card" style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>任務列表</h2>
        
        <select
          value={project.status}
          onChange={handleProjectStatus}
          disabled={loading}
          style={{
            padding: "8px 12px",
            background: "var(--bg-glass)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-primary)",
            fontSize: "13px",
            outline: "none"
          }}
        >
          {Object.entries(PROJECT_STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      <div style={{ width: "100%", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "800px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "12px", color: "var(--text-secondary)", fontSize: "13px", width: "50px" }}>順序</th>
              <th style={{ padding: "12px", color: "var(--text-secondary)", fontSize: "13px" }}>任務名稱</th>
              <th style={{ padding: "12px", color: "var(--text-secondary)", fontSize: "13px", width: "180px" }}>負責人</th>
              <th style={{ padding: "12px", color: "var(--text-secondary)", fontSize: "13px", width: "140px" }}>狀態</th>
              <th style={{ padding: "12px", color: "var(--text-secondary)", fontSize: "13px", width: "120px" }}>截止日期</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => {
              const due = task.due_date ? new Date(task.due_date) : null;
              const isOverdue = due && due < now && task.status !== "done";
              
              return (
                <tr key={task.id} style={{ borderBottom: "1px solid var(--border)", transition: "var(--transition)" }} className="table-row">
                  <td style={{ padding: "12px", color: "var(--text-muted)", fontSize: "13px" }}>
                    {task.sort_order}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span 
                        style={{ 
                          width: "8px", 
                          height: "8px", 
                          borderRadius: "50%", 
                          background: PRIORITY_COLORS[task.priority as TaskPriority] || "var(--text-muted)",
                          flexShrink: 0
                        }} 
                        title={`優先度: ${task.priority}`}
                      />
                      <span style={{ 
                        color: "var(--text-primary)", 
                        fontSize: "14px", 
                        fontWeight: "500",
                        textDecoration: task.status === "done" ? "line-through" : "none",
                        opacity: task.status === "done" ? 0.6 : 1
                      }}>
                        {task.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <select
                      value={task.assignee_id || ""}
                      onChange={(e) => handleAssign(task.id, e.target.value)}
                      disabled={loading}
                      style={{
                        width: "100%",
                        padding: "6px",
                        background: "transparent",
                        border: "1px solid transparent",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--text-primary)",
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                      className="inline-select"
                    >
                      <option value="">未指派</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.full_name}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <select
                      value={task.status}
                      onChange={(e) => handleTaskStatus(task.id, e.target.value)}
                      disabled={loading}
                      style={{
                        padding: "4px 8px",
                        background: task.status === "done" ? "rgba(0, 184, 148, 0.15)" : "var(--bg-glass)",
                        border: "1px solid var(--border)",
                        borderRadius: "100px",
                        color: task.status === "done" ? "var(--success)" : "var(--text-primary)",
                        fontSize: "12px",
                        fontWeight: "500",
                        cursor: "pointer",
                        outline: "none"
                      }}
                    >
                      {Object.entries(TASK_STATUS_LABELS).map(([val, label]) => (
                        <option key={val} value={val} style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: "12px", color: isOverdue ? "var(--danger)" : "var(--text-secondary)", fontSize: "13px" }}>
                    {formatDate(task.due_date)}
                    {isOverdue && <span style={{ marginLeft: "4px", fontSize: "11px" }}>(逾期)</span>}
                  </td>
                </tr>
              );
            })}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                  此專案尚未建立任務
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
        .inline-select:hover {
          background: var(--bg-glass) !important;
          border-color: var(--border) !important;
        }
      `}</style>
    </div>
  );
}
