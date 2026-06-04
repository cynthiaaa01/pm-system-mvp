import Link from "next/link";
import { getProject } from "@/actions/projects";
import { getProjectTasks, getAllUsers } from "@/actions/tasks";
import { getProjectUpdates } from "@/actions/task-updates";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from "@/lib/constants";
import ProjectDetailClient from "./project-detail-client";
import ManagerAssignSelect from "./manager-assign-select";
import ProjectActions from "./project-actions";
import { TagManager } from "@/components/ui/tag-manager";
import type { ProjectStatus } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const project = await getProject(resolvedParams.id);
  
  if (!project) {
    notFound();
  }

  const tasks = await getProjectTasks(project.id);
  const users = await getAllUsers();
  const updates = await getProjectUpdates(project.id);

  // Dynamically calculate progress to ensure it's always perfectly in sync on the detail page
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t: any) => t.status === "done").length;
  const calculatedProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", justifyContent: "space-between" }}>
        <Link 
          href="/dashboard/projects"
          style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px", textDecoration: "none" }}
        >
          ← 返回列表
        </Link>
        <ProjectActions projectId={project.id} />
      </div>

      {/* Header */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <h1 style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>
                {project.name}
              </h1>
              <span style={{
                padding: "4px 10px",
                borderRadius: "100px",
                fontSize: "12px",
                fontWeight: "500",
                background: `rgba(${hexToRgb(PROJECT_STATUS_COLORS[project.status as ProjectStatus])}, 0.15)`,
                color: PROJECT_STATUS_COLORS[project.status as ProjectStatus]
              }}>
                {PROJECT_STATUS_LABELS[project.status as ProjectStatus]}
              </span>
            </div>
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>
              專案編號: {project.project_number}
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "24px", padding: "16px", background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)" }}>
          <div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 4px 0" }}>客戶</p>
            <p style={{ fontSize: "14px", color: "var(--text-primary)", margin: 0, fontWeight: "500" }}>{project.clients?.name}</p>
          </div>
          <div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 4px 0" }}>活動標籤</p>
            <TagManager 
              projectId={project.id} 
              initialTags={Array.from(new Set([...(project.tags || []), ...(project.proposals?.tags || [])]))} 
            />
          </div>
          <div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 4px 0" }}>運營負責人</p>
            <ManagerAssignSelect projectId={project.id} currentManagerId={project.operations_id} role="operations" users={users} />
          </div>
          <div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 4px 0" }}>行銷負責人</p>
            <ManagerAssignSelect projectId={project.id} currentManagerId={project.marketing_id} role="marketing" users={users} />
          </div>
          <div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 4px 0" }}>開始日期</p>
            <p style={{ fontSize: "14px", color: "var(--text-primary)", margin: 0 }}>{formatDate(project.start_date) || "未設定"}</p>
          </div>
          <div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 4px 0" }}>截止日期</p>
            <p style={{ fontSize: "14px", color: "var(--text-primary)", margin: 0 }}>{formatDate(project.end_date) || "未設定"}</p>
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 4px 0" }}>OneDrive 資料夾</p>
            {project.drive_folder_url ? (
              <a href={project.drive_folder_url} target="_blank" rel="noreferrer" style={{ fontSize: "14px", color: "var(--accent-blue-light)", textDecoration: "none" }}>
                開啟資料夾 ↗
              </a>
            ) : (
              <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>尚未建立</p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
            <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>專案進度</span>
            <span style={{ color: "var(--accent-blue-light)", fontWeight: "600" }}>{calculatedProgress}%</span>
          </div>
          <div style={{ width: "100%", height: "8px", background: "var(--bg-glass)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ 
              height: "100%", 
              width: `${calculatedProgress}%`, 
              background: "linear-gradient(90deg, var(--accent-purple), var(--accent-blue))",
              borderRadius: "4px",
              transition: "width 0.5s ease-out"
            }} />
          </div>
        </div>
      </div>

      {/* Interactive Task List Component */}
      <ProjectDetailClient project={project} tasks={tasks} users={users} updates={updates} />

    </div>
  );
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "#74b9ff");
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "116, 185, 255";
}
