"use client";

import Link from "next/link";

const PROPOSAL_STATUS_LABELS: Record<string, string> = {
  lead: "潛在客戶",
  negotiating: "洽談中",
  quoted: "已報價",
  pending: "等待確認",
  won: "成交",
  lost: "失敗",
};

const PROPOSAL_STATUS_COLORS: Record<string, string> = {
  lead: "#74b9ff",
  negotiating: "#a29bfe",
  quoted: "#fdcb6e",
  pending: "#ffeaa7",
  won: "#00b894",
  lost: "#e17055",
};

const PROJECT_STATUS_LABELS: Record<string, string> = {
  pending: "待啟動",
  in_progress: "進行中",
  testing: "測試中",
  completed: "已完成",
  closed: "已結案",
  delayed: "延遲中",
};

const PROJECT_STATUS_COLORS: Record<string, string> = {
  pending: "#74b9ff",
  in_progress: "#6c5ce7",
  testing: "#fdcb6e",
  completed: "#00b894",
  closed: "#636e72",
  delayed: "#e17055",
};

const TASK_STATUS_LABELS: Record<string, string> = {
  todo: "待開始",
  in_progress: "進行中",
  review: "待確認",
  done: "已完成",
  delayed: "延遲",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "#636e72",
  medium: "#74b9ff",
  high: "#fdcb6e",
  urgent: "#e17055",
};

interface DashboardContentProps {
  role: string;
  stats: {
    totalProposals: number;
    wonProposals: number;
    winRate: number;
    monthlyRevenue: number;
    totalProjects: number;
    activeProjects: number;
    delayedProjects: number;
    completedProjects: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    upcomingTasks: number;
  };
  proposalsByStatus: Record<string, number>;
  projectsByStatus: Record<string, number>;
  myTasks: Array<{
    id: string;
    name: string;
    status: string;
    due_date: string | null;
    priority: string;
    project_id: string;
    projects: { name: string } | null;
  }>;
}

export default function DashboardContent({
  role,
  stats,
  proposalsByStatus,
  projectsByStatus,
  myTasks,
}: DashboardContentProps) {
  const now = new Date();

  function getDaysLabel(dateStr: string | null): { text: string; color: string } {
    if (!dateStr) return { text: "無期限", color: "var(--text-muted)" };
    const due = new Date(dateStr);
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { text: `逾期 ${Math.abs(diff)} 天`, color: "var(--danger)" };
    if (diff === 0) return { text: "今天到期", color: "var(--warning)" };
    if (diff <= 3) return { text: `${diff} 天後到期`, color: "var(--warning)" };
    return { text: `${diff} 天後到期`, color: "var(--text-muted)" };
  }

  return (
    <div className="dash">
      {/* Welcome */}
      <div className="dash-welcome">
        <h1 className="dash-welcome-title">
          {getGreeting()}，歡迎回來 👋
        </h1>
        <p className="dash-welcome-sub">
          {role === "admin" && "以下是系統總覽"}
          {role === "sales" && "以下是您的業務概覽"}
          {role === "operations" && "以下是專案管理概覽"}
          {role === "marketing" && "以下是您的待辦任務"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="dash-stats">
        {(role === "admin" || role === "sales") && (
          <>
            <StatCard
              title="總提案數"
              value={stats.totalProposals}
              icon="📋"
              color="var(--accent-purple)"
            />
            <StatCard
              title="成交率"
              value={`${stats.winRate}%`}
              icon="🎯"
              color="var(--success)"
            />
            <StatCard
              title="本月營收"
              value={formatCurrency(stats.monthlyRevenue)}
              icon="💰"
              color="var(--accent-blue-light)"
              small
            />
            <StatCard
              title="成交數"
              value={stats.wonProposals}
              icon="🏆"
              color="var(--warning)"
            />
          </>
        )}

        {(role === "admin" || role === "operations") && (
          <>
            <StatCard
              title="進行中專案"
              value={stats.activeProjects}
              icon="🚀"
              color="var(--accent-purple)"
            />
            <StatCard
              title="延遲專案"
              value={stats.delayedProjects}
              icon="⚠️"
              color="var(--danger)"
              alert={stats.delayedProjects > 0}
            />
            <StatCard
              title="已完成專案"
              value={stats.completedProjects}
              icon="✅"
              color="var(--success)"
            />
            <StatCard
              title="逾期任務"
              value={stats.overdueTasks}
              icon="🔴"
              color="var(--danger)"
              alert={stats.overdueTasks > 0}
            />
          </>
        )}

        {role === "operations" && (
          <>
            <StatCard
              title="待處理任務"
              value={myTasks.filter((t) => t.status === "todo").length}
              icon="📝"
              color="var(--accent-purple)"
            />
            <StatCard
              title="進行中"
              value={myTasks.filter((t) => t.status === "in_progress").length}
              icon="⚡"
              color="var(--accent-blue)"
            />
            <StatCard
              title="即將到期"
              value={stats.upcomingTasks}
              icon="⏰"
              color="var(--warning)"
              alert={stats.upcomingTasks > 0}
            />
            <StatCard
              title="逾期"
              value={stats.overdueTasks}
              icon="🔴"
              color="var(--danger)"
              alert={stats.overdueTasks > 0}
            />
          </>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="dash-grid">
        {/* Left: Status Distribution */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">
              {(role === "admin" || role === "sales") ? "提案狀態分佈" : "專案狀態分佈"}
            </h2>
            <Link
              href={(role === "admin" || role === "sales") ? "/dashboard/crm" : "/dashboard/projects"}
              className="dash-card-link"
            >
              查看全部 →
            </Link>
          </div>
          <div className="dash-card-body">
            <div className="status-bars">
              {Object.entries(
                (role === "admin" || role === "sales") ? proposalsByStatus : projectsByStatus
              ).map(([status, count]) => {
                const labels = (role === "admin" || role === "sales") ? PROPOSAL_STATUS_LABELS : PROJECT_STATUS_LABELS;
                const colors = (role === "admin" || role === "sales") ? PROPOSAL_STATUS_COLORS : PROJECT_STATUS_COLORS;
                const total = Object.values(
                  (role === "admin" || role === "sales") ? proposalsByStatus : projectsByStatus
                ).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;

                return (
                  <div key={status} className="status-bar-row">
                    <div className="status-bar-label">
                      <span
                        className="status-dot"
                        style={{ background: colors[status] || "var(--text-muted)" }}
                      />
                      <span>{labels[status] || status}</span>
                    </div>
                    <div className="status-bar-track">
                      <div
                        className="status-bar-fill"
                        style={{
                          width: `${pct}%`,
                          background: colors[status] || "var(--text-muted)",
                        }}
                      />
                    </div>
                    <span className="status-bar-count">{count}</span>
                  </div>
                );
              })}
              {Object.keys(
                (role === "admin" || role === "sales") ? proposalsByStatus : projectsByStatus
              ).length === 0 && (
                <div className="dash-empty">
                  <span className="dash-empty-icon">📊</span>
                  <p>尚無資料</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: My Tasks */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">我的任務</h2>
            <Link href="/dashboard/tasks" className="dash-card-link">
              查看全部 →
            </Link>
          </div>
          <div className="dash-card-body">
            {myTasks.length > 0 ? (
              <div className="task-list">
                {myTasks.slice(0, 8).map((task) => {
                  const dueInfo = getDaysLabel(task.due_date);
                  return (
                    <div key={task.id} className="task-item">
                      <div className="task-item-left">
                        <span
                          className="task-priority-dot"
                          style={{ background: PRIORITY_COLORS[task.priority] || "var(--text-muted)" }}
                          title={task.priority}
                        />
                        <div className="task-item-info">
                          <span className="task-item-name">{task.title || task.name || "未命名任務"}</span>
                          <span className="task-item-project">
                            {task.projects?.name || "—"}
                          </span>
                        </div>
                      </div>
                      <div className="task-item-right">
                        <span
                          className="task-status-badge"
                          data-status={task.status}
                        >
                          {TASK_STATUS_LABELS[task.status] || task.status}
                        </span>
                        <span className="task-due" style={{ color: dueInfo.color }}>
                          {dueInfo.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="dash-empty">
                <span className="dash-empty-icon">🎉</span>
                <p>沒有待處理的任務</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .dash {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .dash-welcome-title {
          font-size: 26px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px 0;
          letter-spacing: -0.02em;
        }

        .dash-welcome-sub {
          font-size: 14px;
          color: var(--text-muted);
          margin: 0;
        }

        /* Stats */
        .dash-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .stat-card {
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 22px 24px;
          transition: var(--transition);
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--stat-color);
          opacity: 0.6;
        }

        .stat-card:hover {
          border-color: var(--border-hover);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .stat-card--alert {
          border-color: rgba(225, 112, 85, 0.3);
          animation: pulse 2s ease-in-out infinite;
        }

        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .stat-title {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .stat-icon {
          font-size: 22px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          line-height: 1;
        }

        .stat-value--small {
          font-size: 22px;
        }

        /* Cards */
        .dash-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .dash-card {
          background: var(--bg-card);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .dash-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px 0;
        }

        .dash-card-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .dash-card-link {
          font-size: 13px;
          color: var(--accent-purple-light);
          text-decoration: none;
          font-weight: 500;
          transition: var(--transition);
        }

        .dash-card-link:hover {
          color: var(--accent-purple);
        }

        .dash-card-body {
          padding: 20px 24px 24px;
        }

        /* Status Bars */
        .status-bars {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .status-bar-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-bar-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
          min-width: 90px;
          white-space: nowrap;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .status-bar-track {
          flex: 1;
          height: 6px;
          background: var(--bg-glass);
          border-radius: 3px;
          overflow: hidden;
        }

        .status-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .status-bar-count {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          min-width: 24px;
          text-align: right;
        }

        /* Task List */
        .task-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .task-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          border-radius: var(--radius-md);
          transition: var(--transition);
          gap: 12px;
        }

        .task-item:hover {
          background: var(--bg-glass);
        }

        .task-item-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .task-priority-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .task-item-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .task-item-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .task-item-project {
          font-size: 12px;
          color: var(--text-muted);
        }

        .task-item-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .task-status-badge {
          font-size: 11px;
          font-weight: 500;
          padding: 3px 8px;
          border-radius: 100px;
          background: var(--bg-glass);
          color: var(--text-secondary);
        }

        .task-status-badge[data-status="in_progress"] {
          background: rgba(108, 92, 231, 0.15);
          color: var(--accent-purple-light);
        }

        .task-status-badge[data-status="review"] {
          background: var(--warning-bg);
          color: var(--warning);
        }

        .task-status-badge[data-status="delayed"] {
          background: var(--danger-bg);
          color: var(--danger);
        }

        .task-due {
          font-size: 12px;
          white-space: nowrap;
        }

        /* Empty */
        .dash-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          color: var(--text-muted);
          font-size: 14px;
        }

        .dash-empty-icon {
          font-size: 36px;
          margin-bottom: 12px;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }

        @media (max-width: 1024px) {
          .dash-stats { grid-template-columns: repeat(2, 1fr); }
          .dash-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 640px) {
          .dash-stats { grid-template-columns: 1fr; }
          .dash-welcome-title { font-size: 22px; }
        }
      `}</style>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  alert = false,
  small = false,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  alert?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={`stat-card ${alert ? "stat-card--alert" : ""}`}
      style={{ "--stat-color": color } as React.CSSProperties}
    >
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className={`stat-value ${small ? "stat-value--small" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "早安";
  if (h < 18) return "午安";
  return "晚安";
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
