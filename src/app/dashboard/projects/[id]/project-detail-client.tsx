"use client";

import { useState, useRef } from "react";
import { updateTaskStatus, assignTask, deleteTask, createTask } from "@/actions/tasks";
import { updateProjectStatus, updateProjectReferenceDates } from "@/actions/projects";
import { assignOperationsManager, assignMarketingManager } from "@/actions/project-assignment";
import { formatDate } from "@/lib/utils";
import { TASK_STATUS_LABELS, PROJECT_STATUS_LABELS, PRIORITY_COLORS, REFERENCE_POINT_LABELS, TASK_CATEGORY_COLORS } from "@/lib/constants";
import type { TaskPriority } from "@/types/database";
import { previewQuotationTasks, importTasks, uploadAndParseQuotationForProject } from "@/actions/task-import";
import type { GeneratedTask } from "@/lib/task-generation";
import { ActivityFeed } from "@/components/ui/activity-feed";
import { UpdateComposer } from "@/components/ui/update-composer";
import { createTaskUpdate } from "@/actions/task-updates";
import { ProjectGantt } from "@/components/ui/gantt-chart";

const REFERENCE_DATE_FIELDS = [
  { key: 'start_date', label: '專案啟動日', icon: '🚀' },
  { key: 'event_online_date', label: '活動上線日', icon: '🌐' },
  { key: 'event_end_date', label: '活動結束日', icon: '🏁' },
  { key: 'material_confirm_date', label: '素材確認日', icon: '📎' },
  { key: 'physical_event_date', label: '實體活動日', icon: '🎪' },
  { key: 'system_online_date', label: '系統上線日', icon: '⚙️' },
  { key: 'monthly_settle_date', label: '月底結算日', icon: '📅' },
];

export default function ProjectDetailClient({ project, tasks, users, updates = [] }: { project: any, tasks: any[], users: any[], updates?: any[] }) {
  const [loading, setLoading] = useState(false);
  const [datesLoading, setDatesLoading] = useState(false);
  const [dates, setDates] = useState<Record<string, string>>(() => {
    const d: Record<string, string> = {};
    for (const f of REFERENCE_DATE_FIELDS) {
      d[f.key] = (project as any)[f.key] || '';
    }
    return d;
  });
  const [taskFilter, setTaskFilter] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadingQuotation, setUploadingQuotation] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [previewTasks, setPreviewTasks] = useState<(GeneratedTask & { selected: boolean; _id: string })[]>([]);
  const [activeTab, setActiveTab] = useState<'tasks' | 'gantt' | 'activity'>('tasks');

  const [composerTaskId, setComposerTaskId] = useState<string>('');

  async function handleProjectStatus(e: React.ChangeEvent<HTMLSelectElement>) {
    setLoading(true);
    await updateProjectStatus(project.id, e.target.value);
    setLoading(false);
  }

  async function handleTaskStatus(taskId: string, status: string) {
    setLoading(true);
    await updateTaskStatus(taskId, status, project.id);
    
    // Check if this was the last task to complete
    if (status === "done") {
      const allOtherTasksDone = tasks.filter(t => t.id !== taskId).every(t => t.status === "done");
      if (allOtherTasksDone && project.status !== "completed") {
        if (confirm("所有的任務皆已完成！是否要將專案狀態更新為「完成」？")) {
          await updateProjectStatus(project.id, "completed");
        }
      }
    }
    setLoading(false);
  }

  function handleDownloadCSV() {
    // Generate CSV content
    const headers = ["#", "任務名稱", "任務類別", "來源品項", "負責人", "狀態", "基準點", "開始日", "截止日", "天數"];
    const rows = tasks.map(t => {
      const assigneeName = (t as any).assignee?.full_name || "未指派";
      const statusLabel = TASK_STATUS_LABELS[t.status as keyof typeof TASK_STATUS_LABELS] || t.status;
      return [
        t.sort_order,
        t.title || t.name,
        t.task_category || "",
        t.source_item || "",
        assigneeName,
        statusLabel,
        t.reference_point || "",
        t.start_date || "",
        t.due_date || "",
        t.duration_days || ""
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(",");
    });
    
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n"); // add BOM for Excel
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${project.name}_任務清單.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleAssign(taskId: string, assigneeId: string) {
    setLoading(true);
    await assignTask(taskId, assigneeId, project.id);
    setLoading(false);
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm("確定要刪除此任務嗎？")) return;
    setLoading(true);
    const res = await deleteTask(taskId, project.id);
    if (res?.error) alert("刪除失敗：" + res.error);
    setLoading(false);
  }

  async function handleAddTask() {
    const title = prompt("請輸入任務名稱：", "新任務");
    if (!title) return;
    
    setLoading(true);
    const newTask = {
      project_id: project.id,
      title: title,
      status: "todo",
      task_category: "未分類",
      sort_order: tasks.length > 0 ? Math.max(...tasks.map(t => t.sort_order || 0)) + 1 : 1
    };
    const res = await createTask(newTask);
    if (res?.error) alert("新增失敗：" + res.error);
    setLoading(false);
  }

  async function handleAssignOperations(userId: string) {
    setLoading(true);
    await assignOperationsManager(project.id, userId);
    setLoading(false);
  }

  async function handleAssignMarketing(userId: string) {
    setLoading(true);
    await assignMarketingManager(project.id, userId);
    setLoading(false);
  }

  async function handleSaveDates() {
    setDatesLoading(true);
    const payload: any = {};
    for (const f of REFERENCE_DATE_FIELDS) {
      payload[f.key] = dates[f.key] || null;
    }
    await updateProjectReferenceDates(project.id, payload);
    setDatesLoading(false);
  }

  async function handleOpenImportModal() {
    setImporting(true);
    const res = await previewQuotationTasks(project.id);
    if (res.error) {
      if (res.error.includes("沒有關聯的報價單") || res.error.includes("未進行 AI 解析") || res.error.includes("找不到任何品項")) {
        setShowUploadModal(true);
      } else {
        alert(res.error);
      }
    } else if (res.tasks) {
      if (res.tasks.length === 0) {
        alert("目前的報價單品項沒有配對到任何預設任務 (SOP)。");
      } else {
        setPreviewTasks(res.tasks.map((t, idx) => ({ ...t, selected: true, _id: `temp_${idx}` })));
        setShowImportModal(true);
      }
    }
    setImporting(false);
  }

  async function handleUploadQuotation() {
    if (!uploadFile) return alert("請選擇檔案");
    setUploadingQuotation(true);
    
    const formData = new FormData();
    formData.append("file", uploadFile);
    
    const res = await uploadAndParseQuotationForProject(project.id, formData);
    if (res.error) {
      alert(res.error);
      setUploadingQuotation(false);
    } else {
      setShowUploadModal(false);
      setUploadFile(null);
      // 上傳解析成功後，自動重試匯入預覽
      await handleOpenImportModal();
      setUploadingQuotation(false);
    }
  }

  function handlePreviewTaskChange(id: string, field: string, value: string | number | boolean) {
    setPreviewTasks(prev => prev.map(t => t._id === id ? { ...t, [field]: value } : t));
  }

  async function handleConfirmImport() {
    const selectedTasks = previewTasks.filter(t => t.selected);
    if (selectedTasks.length === 0) return alert("請至少選擇一項任務");
    
    setImporting(true);
    const payload = selectedTasks.map(({ selected, _id, ...rest }) => rest);
    const res = await importTasks(project.id, payload as GeneratedTask[]);
    if (res.error) {
      alert(res.error);
    } else {
      setShowImportModal(false);
    }
    setImporting(false);
  }

  async function handleAddUpdate(content: string, type: any, file?: File) {
    if (!composerTaskId) {
      alert("請先選擇要更新的任務");
      return;
    }
    setLoading(true);
    let fileUrl = null;
    let fileName = null;
    
    if (file) {
      fileUrl = URL.createObjectURL(file); 
      fileName = file.name;
    }

    const res = await createTaskUpdate(
      composerTaskId,
      project.id,
      content,
      type,
      file ? { file_url: fileUrl, file_name: fileName } : null
    );

    if (res.error) {
      alert(res.error);
    } else {
      window.location.reload();
    }
    setLoading(false);
  }

  const now = new Date();

  const categories = [...new Set(tasks.map(t => t.task_category || '未分類'))];

  const getGroupedTasks = (category: string | null) => {
    let filtered = tasks;
    if (taskFilter !== "all") {
      filtered = filtered.filter(t => t.status === taskFilter);
    }
    return filtered.filter(t => (t.task_category || '未分類') === category);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="glass-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>📆</span>
              <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>專案設定</h2>
            </div>
            
            {/* 移到這裡的專案狀態選單 */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>專案狀態:</span>
              <select
                value={project.status}
                onChange={handleProjectStatus}
                disabled={loading}
                style={{
                  padding: "6px 12px",
                  background: "var(--bg-glass)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                {Object.entries(PROJECT_STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleSaveDates}
            disabled={datesLoading}
            style={{
              padding: "8px 16px",
              background: "linear-gradient(135deg, var(--accent-purple), var(--accent-blue))",
              border: "none",
              color: "white",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px",
              opacity: datesLoading ? 0.7 : 1,
            }}
          >
            {datesLoading ? "重新計算中..." : "🔄 儲存並重算任務日期"}
          </button>
        </div>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 16px 0" }}>
          設定各基準日期後，系統會自動重新計算對應任務的開始日和截止日。若需要微調，可手動修改單一任務日期。
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          {REFERENCE_DATE_FIELDS.map(f => (
            <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                <span>{f.icon}</span> {f.label}
              </label>
              <input
                type="date"
                value={dates[f.key] || ''}
                onChange={e => setDates(prev => ({ ...prev, [f.key]: e.target.value }))}
                style={{
                  padding: "8px 10px",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
        <button
          onClick={() => setActiveTab('tasks')}
          style={{
            padding: "0.5rem 1rem",
            background: "transparent",
            border: "none",
            borderBottom: activeTab === 'tasks' ? "2px solid var(--accent-purple)" : "2px solid transparent",
            color: activeTab === 'tasks' ? "var(--text-primary)" : "var(--text-secondary)",
            fontWeight: activeTab === 'tasks' ? 600 : 500,
            cursor: "pointer",
            fontSize: "15px",
            transition: "all 0.2s"
          }}
        >
          任務清單 ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('gantt')}
          style={{
            padding: "0.5rem 1rem",
            background: "transparent",
            border: "none",
            borderBottom: activeTab === 'gantt' ? "2px solid var(--accent-purple)" : "2px solid transparent",
            color: activeTab === 'gantt' ? "var(--text-primary)" : "var(--text-secondary)",
            fontWeight: activeTab === 'gantt' ? 600 : 500,
            cursor: "pointer",
            fontSize: "15px",
            transition: "all 0.2s"
          }}
        >
          專案排程 (甘特圖)
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          style={{
            padding: "0.5rem 1rem",
            background: "transparent",
            border: "none",
            borderBottom: activeTab === 'activity' ? "2px solid var(--accent-blue)" : "2px solid transparent",
            color: activeTab === 'activity' ? "var(--text-primary)" : "var(--text-secondary)",
            fontWeight: activeTab === 'activity' ? 600 : 500,
            cursor: "pointer",
            fontSize: "15px",
            transition: "all 0.2s"
          }}
        >
          動態更新 ({updates.length})
        </button>
      </div>

      {activeTab === 'tasks' && (
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>
            任務清單
            <span style={{ fontSize: "13px", fontWeight: "400", color: "var(--text-muted)", marginLeft: "8px" }}>
              ({tasks.length} 項)
            </span>
          </h2>
          
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={handleOpenImportModal}
              disabled={importing}
              style={{
                padding: "6px 12px",
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                opacity: importing ? 0.7 : 1
              }}
            >
              {importing ? "載入中..." : "✨ 匯入報價單任務"}
            </button>
            <button
              onClick={handleAddTask}
              disabled={loading}
              style={{
                padding: "6px 12px",
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                opacity: loading ? 0.7 : 1
              }}
            >
              ➕ 新增任務
            </button>
            <button
              onClick={handleDownloadCSV}
              style={{
                padding: "6px 12px",
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              📥 下載 Excel (CSV)
            </button>
            <select
              value={taskFilter}
              onChange={e => setTaskFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                background: "var(--bg-glass)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                color: "var(--text-primary)",
                fontSize: "13px",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="all">所有任務</option>
              {Object.entries(TASK_STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {categories.map(category => (
          <div key={category || 'all'} style={{ marginBottom: "24px" }}>
            <div style={{ 
              display: "flex", alignItems: "center", gap: "8px", 
              padding: "8px 12px", marginBottom: "12px",
              background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)",
              borderLeft: `3px solid ${TASK_CATEGORY_COLORS[category] || 'var(--text-muted)'}` 
            }}>
              <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>
                {category}
              </h3>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                ({getGroupedTasks(category).length} 項)
              </span>
            </div>
            <div style={{ width: "100%", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "1000px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "10px", color: "var(--text-secondary)", fontSize: "12px", width: "40px" }}>#</th>
                    <th style={{ padding: "10px", color: "var(--text-secondary)", fontSize: "12px" }}>任務名稱</th>
                    <th style={{ padding: "10px", color: "var(--text-secondary)", fontSize: "12px", width: "160px" }}>來源品項</th>
                    <th style={{ padding: "10px", color: "var(--text-secondary)", fontSize: "12px", width: "150px" }}>負責人</th>
                    <th style={{ padding: "10px", color: "var(--text-secondary)", fontSize: "12px", width: "120px" }}>狀態</th>
                    <th style={{ padding: "10px", color: "var(--text-secondary)", fontSize: "12px", width: "90px" }}>基準點</th>
                    <th style={{ padding: "10px", color: "var(--text-secondary)", fontSize: "12px", width: "90px" }}>開始日</th>
                    <th style={{ padding: "10px", color: "var(--text-secondary)", fontSize: "12px", width: "90px" }}>截止日</th>
                    <th style={{ padding: "10px", color: "var(--text-secondary)", fontSize: "12px", width: "60px" }}>天數</th>
                    <th style={{ padding: "10px", color: "var(--text-secondary)", fontSize: "12px", width: "50px", textAlign: "center" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {getGroupedTasks(category).map((task: any) => {
                    const due = task.due_date ? new Date(task.due_date) : null;
                    const isOverdue = due && due < now && task.status !== "done";
                    
                    return (
                      <tr key={task.id} style={{ borderBottom: "1px solid var(--border)", transition: "var(--transition)" }} className="table-row">
                        <td style={{ padding: "10px", color: "var(--text-muted)", fontSize: "12px" }}>
                          {task.sort_order}
                        </td>
                        <td style={{ padding: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span 
                              style={{ 
                                width: "7px", height: "7px", borderRadius: "50%", 
                                background: PRIORITY_COLORS[task.priority as TaskPriority] || "var(--text-muted)",
                                flexShrink: 0
                              }} 
                              title={`優先度: ${task.priority}`}
                            />
                            <span style={{ 
                              color: "var(--text-primary)", fontSize: "13px", fontWeight: "500",
                              textDecoration: task.status === "done" ? "line-through" : "none",
                              opacity: task.status === "done" ? 0.6 : 1
                            }}>
                              {task.title || task.name}
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: "10px", color: "var(--text-muted)", fontSize: "12px" }}>
                          <span title={task.source_item} style={{ 
                            display: "inline-block", maxWidth: "150px", overflow: "hidden", 
                            textOverflow: "ellipsis", whiteSpace: "nowrap" 
                          }}>
                            {task.source_item || '-'}
                          </span>
                        </td>
                        <td style={{ padding: "10px" }}>
                          <select
                            value={task.assignee_id || ""}
                            onChange={(e) => handleAssign(task.id, e.target.value)}
                            disabled={loading}
                            style={{
                              width: "100%", padding: "5px",
                              background: "transparent", border: "1px solid transparent",
                              borderRadius: "var(--radius-sm)", color: "var(--text-primary)",
                              fontSize: "12px", cursor: "pointer",
                            }}
                            className="inline-select"
                          >
                            <option value="">未指派</option>
                            {users.map((u: any) => (
                              <option key={u.id} value={u.id}>{u.full_name}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: "10px" }}>
                          <select
                            value={task.status}
                            onChange={(e) => handleTaskStatus(task.id, e.target.value)}
                            disabled={loading}
                            style={{
                              padding: "3px 8px",
                              background: task.status === "done" ? "rgba(0, 184, 148, 0.15)" : "var(--bg-glass)",
                              border: "1px solid var(--border)",
                              borderRadius: "100px",
                              color: task.status === "done" ? "var(--success)" : "var(--text-primary)",
                              fontSize: "11px", fontWeight: "500", cursor: "pointer", outline: "none"
                            }}
                          >
                            {Object.entries(TASK_STATUS_LABELS).map(([val, label]) => (
                              <option key={val} value={val} style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}>{label}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: "10px", fontSize: "11px", color: "var(--text-muted)" }}>
                          {task.reference_point || '-'}
                        </td>
                        <td style={{ padding: "10px", color: "var(--text-secondary)", fontSize: "12px" }}>
                          {formatDate(task.start_date)}
                        </td>
                        <td style={{ padding: "10px", color: isOverdue ? "var(--danger)" : "var(--text-secondary)", fontSize: "12px" }}>
                          {formatDate(task.due_date)}
                          {isOverdue && <span style={{ marginLeft: "2px", fontSize: "10px" }}>(逾期)</span>}
                        </td>
                        <td style={{ padding: "10px", color: "var(--text-muted)", fontSize: "12px", textAlign: "center" }}>
                          {task.duration_days || '-'}
                        </td>
                        <td style={{ padding: "10px", textAlign: "center" }}>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={loading}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--danger)",
                              cursor: "pointer",
                              padding: "4px",
                              opacity: loading ? 0.5 : 0.7,
                              transition: "opacity 0.2s"
                            }}
                            title="刪除任務"
                            onMouseOver={e => e.currentTarget.style.opacity = "1"}
                            onMouseOut={e => e.currentTarget.style.opacity = "0.7"}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {tasks.length === 0 && (
                    <tr>
                      <td colSpan={11} style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                        此專案尚未建立任務
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        </div>
      )}

      {activeTab === 'gantt' && (
        <ProjectGantt tasks={tasks} projectName={project.name} />
      )}

      {activeTab === 'activity' && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "24px" }}>
          {/* Activity Section */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "var(--text-primary)" }}>發佈新動態</h3>
            
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>選擇要更新的任務</label>
              <select
                value={composerTaskId}
                onChange={e => setComposerTaskId(e.target.value)}
                style={{
                  width: "100%", padding: "10px", background: "var(--bg-tertiary)",
                  border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)", fontSize: "14px", outline: "none"
                }}
              >
                <option value="">-- 請選擇任務 --</option>
                {tasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title || t.name}</option>
                ))}
              </select>
            </div>
            
            {composerTaskId && (
              <UpdateComposer 
                projectId={project.id} 
                taskId={composerTaskId} 
                onSubmit={handleAddUpdate} 
              />
            )}
            
            <h3 style={{ fontSize: "16px", fontWeight: "600", marginTop: "32px", marginBottom: "16px", color: "var(--text-primary)" }}>歷史動態</h3>
            <ActivityFeed items={updates} />
          </div>
        </div>
      )}

      <style>{`
        .table-row:hover {
          background: var(--bg-glass);
        }
        .inline-select:hover {
          background: var(--bg-glass) !important;
          border-color: var(--border) !important;
        }
      `}</style>

      {showImportModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)", zIndex: 100,
          display: "flex", justifyContent: "center", alignItems: "center", padding: "20px"
        }}>
          <div className="glass-card" style={{ width: "90%", maxWidth: "1000px", maxHeight: "90vh", display: "flex", flexDirection: "column", padding: 0 }}>
            <div style={{ padding: "20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "18px", color: "var(--text-primary)" }}>✨ 預覽並匯入報價單任務</h2>
              <button onClick={() => setShowImportModal(false)} style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "20px", cursor: "pointer" }}>×</button>
            </div>
            
            <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th style={{ padding: "8px", width: "40px" }}>
                      <input 
                        type="checkbox" 
                        checked={previewTasks.every(t => t.selected)}
                        onChange={e => setPreviewTasks(prev => prev.map(t => ({ ...t, selected: e.target.checked })))}
                        style={{ accentColor: "var(--accent-purple)" }}
                      />
                    </th>
                    <th style={{ padding: "8px", color: "var(--text-secondary)", fontSize: "12px" }}>任務名稱 (可修改)</th>
                    <th style={{ padding: "8px", color: "var(--text-secondary)", fontSize: "12px" }}>來源品項</th>
                    <th style={{ padding: "8px", color: "var(--text-secondary)", fontSize: "12px", width: "130px" }}>開始日 (可修改)</th>
                    <th style={{ padding: "8px", color: "var(--text-secondary)", fontSize: "12px", width: "130px" }}>截止日 (可修改)</th>
                  </tr>
                </thead>
                <tbody>
                  {previewTasks.map((t, idx) => (
                    <tr key={t._id} style={{ borderBottom: "1px solid var(--border)", opacity: t.selected ? 1 : 0.5 }}>
                      <td style={{ padding: "8px" }}>
                        <input 
                          type="checkbox" 
                          checked={t.selected}
                          onChange={e => handlePreviewTaskChange(t._id, 'selected', e.target.checked)}
                          style={{ accentColor: "var(--accent-purple)" }}
                        />
                      </td>
                      <td style={{ padding: "8px" }}>
                        <input
                          type="text"
                          value={t.title}
                          onChange={e => handlePreviewTaskChange(t._id, 'title', e.target.value)}
                          disabled={!t.selected}
                          style={{ width: "100%", padding: "6px 8px", background: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "13px" }}
                        />
                      </td>
                      <td style={{ padding: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span>{t.source_item}</span>
                          <span style={{ fontSize: "10px", color: "var(--accent-blue-light)" }}>基準: {t.reference_point}</span>
                        </div>
                      </td>
                      <td style={{ padding: "8px" }}>
                        <input
                          type="date"
                          value={t.start_date || ""}
                          onChange={e => handlePreviewTaskChange(t._id, 'start_date', e.target.value)}
                          disabled={!t.selected}
                          style={{ width: "100%", padding: "6px", background: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "12px" }}
                        />
                      </td>
                      <td style={{ padding: "8px" }}>
                        <input
                          type="date"
                          value={t.due_date || ""}
                          onChange={e => handlePreviewTaskChange(t._id, 'due_date', e.target.value)}
                          disabled={!t.selected}
                          style={{ width: "100%", padding: "6px", background: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-primary)", fontSize: "12px" }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: "20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button onClick={() => setShowImportModal(false)} style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "var(--radius-md)", cursor: "pointer", fontSize: "13px" }}>
                取消
              </button>
              <button 
                onClick={handleConfirmImport} 
                disabled={importing || previewTasks.filter(t => t.selected).length === 0}
                style={{ padding: "8px 16px", background: "linear-gradient(135deg, var(--accent-purple), var(--accent-blue))", border: "none", color: "white", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: "600", fontSize: "13px", opacity: (importing || previewTasks.filter(t => t.selected).length === 0) ? 0.7 : 1 }}
              >
                {importing ? "匯入中..." : `確認匯入 ${previewTasks.filter(t => t.selected).length} 項任務`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Quotation Modal */}
      {showUploadModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: "450px", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📄</span> 上傳並解析報價單
              </h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "20px", padding: "0" }}>×</button>
            </div>
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                系統未偵測到此專案已完成 AI 解析的報價單。請重新上傳報價單檔案，系統將自動進行 AI 分析並產生預設任務清單。
              </p>
              <div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={e => setUploadFile(e.target.files?.[0] || null)}
                  disabled={uploadingQuotation}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px",
                    background: "var(--bg-tertiary)",
                    border: "1px dashed var(--border)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "13px"
                  }}
                />
                {uploadFile && (
                  <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--accent-purple-light)" }}>
                    已選擇檔案: {uploadFile.name}
                  </div>
                )}
              </div>
            </div>
            <div style={{ padding: "20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button onClick={() => setShowUploadModal(false)} disabled={uploadingQuotation} style={{ padding: "8px 16px", background: "transparent", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "var(--radius-md)", cursor: "pointer", fontSize: "13px" }}>
                取消
              </button>
              <button 
                onClick={handleUploadQuotation} 
                disabled={uploadingQuotation || !uploadFile}
                style={{ padding: "8px 16px", background: "linear-gradient(135deg, var(--accent-purple), var(--accent-blue))", border: "none", color: "white", borderRadius: "var(--radius-md)", cursor: "pointer", fontWeight: "600", fontSize: "13px", opacity: (uploadingQuotation || !uploadFile) ? 0.7 : 1 }}
              >
                {uploadingQuotation ? "上傳與解析中..." : "開始上傳並解析"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
