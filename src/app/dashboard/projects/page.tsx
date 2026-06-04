import Link from "next/link";
import { getProjects } from "@/actions/projects";
import ProjectFilters from "./project-filters";
import { formatDate } from "@/lib/utils";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS } from "@/lib/constants";
import type { ProjectStatus } from "@/types/database";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const status = typeof resolvedParams.status === "string" ? resolvedParams.status : undefined;
  const search = typeof resolvedParams.search === "string" ? resolvedParams.search : undefined;

  const projects = await getProjects({ status, search });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "600", color: "var(--text-primary)" }}>專案管理</h1>
      </div>

      <ProjectFilters />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {projects.map((project) => (
          <Link key={project.id} href={`/dashboard/projects/${project.id}`} style={{ textDecoration: "none" }}>
            <div className="glass-card project-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", height: "100%", transition: "var(--transition)" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
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
                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "monospace" }}>
                  {project.project_number}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-primary)", margin: "0 0 4px 0" }}>
                  {project.name}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
                  {project.clients?.name}
                </p>
              </div>

              {/* Progress Bar */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>專案進度</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: "500" }}>{project.progress || 0}%</span>
                </div>
                <div style={{ width: "100%", height: "6px", background: "var(--bg-glass)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ 
                    height: "100%", 
                    width: `${project.progress || 0}%`, 
                    background: "linear-gradient(90deg, var(--accent-purple), var(--accent-blue))",
                    borderRadius: "3px" 
                  }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: "auto", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ color: "var(--text-muted)" }}>運營</span>
                  <span style={{ color: "var(--text-primary)" }}>{project.operations?.full_name || "未指派"}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "right" }}>
                  <span style={{ color: "var(--text-muted)" }}>截止日</span>
                  <span style={{ color: "var(--text-primary)" }}>{formatDate(project.end_date) || "未設定"}</span>
                </div>
              </div>
              
            </div>
          </Link>
        ))}
      </div>

      {projects.length === 0 && (
        <div style={{ padding: "64px", textAlign: "center", color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: "32px", marginBottom: "16px" }}>📂</div>
          <p>沒有符合條件的專案</p>
        </div>
      )}

      <style>{`
        .project-card:hover {
          transform: translateY(-4px);
          border-color: var(--border-hover);
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </div>
  );
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "#74b9ff");
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "116, 185, 255";
}
