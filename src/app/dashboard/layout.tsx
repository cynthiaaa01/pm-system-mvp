"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    label: "提案管理",
    href: "/dashboard/crm",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "專案管理",
    href: "/dashboard/projects",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7h-9" />
        <path d="M14 17H5" />
        <circle cx="17" cy="17" r="3" />
        <circle cx="7" cy="7" r="3" />
      </svg>
    ),
  },
  {
    label: "我的任務",
    href: "/dashboard/tasks",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "系統設定",
    href: "/dashboard/settings",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

interface UserProfile {
  full_name: string;
  role: string;
  email: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", authUser.id)
          .single();
        setUser({
          full_name: profile?.full_name || authUser.email?.split("@")[0] || "User",
          role: profile?.role || "operations",
          email: authUser.email || "",
        });
      }
    }
    loadUser();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const ROLE_LABELS: Record<string, string> = {
    admin: "管理員",
    sales: "業務",
    operations: "運營",
    marketing: "行銷",
  };

  const initials = user?.full_name
    ? user.full_name.slice(0, 2)
    : "U";

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarCollapsed ? "sidebar--collapsed" : ""} ${mobileMenuOpen ? "sidebar--mobile-open" : ""}`}
      >
        <div className="sidebar-header">
          <Link href="/dashboard" className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="url(#sidebar-logo-gradient)" />
                <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="sidebar-logo-gradient" x1="0" y1="0" x2="32" y2="32">
                    <stop stopColor="#6c5ce7" />
                    <stop offset="1" stopColor="#0984e3" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            {!sidebarCollapsed && <span className="sidebar-logo-text">PM System</span>}
          </Link>
          <button
            className="sidebar-collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? "展開側欄" : "收起側欄"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {sidebarCollapsed ? (
                <path d="M9 18l6-6-6-6" />
              ) : (
                <path d="M15 18l-6-6 6-6" />
              )}
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? "sidebar-nav-item--active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                {!sidebarCollapsed && <span className="sidebar-nav-label">{item.label}</span>}
                {isActive && <span className="sidebar-nav-indicator" />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleSignOut} role="button" tabIndex={0}>
            <div className="sidebar-avatar">
              {initials}
            </div>
            {!sidebarCollapsed && (
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user?.full_name || "Loading..."}</span>
                <span className="sidebar-user-role">{ROLE_LABELS[user?.role || ""] || user?.role}</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="選單"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
          <div className="header-breadcrumb">
            {getBreadcrumb(pathname)}
          </div>
          <div className="header-actions">
            <button className="header-icon-btn" aria-label="通知" title="通知">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="dashboard-content">
          {children}
        </div>
      </main>

      <style>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg-primary);
        }

        /* Sidebar */
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: var(--sidebar-width);
          height: 100vh;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 100;
          overflow: hidden;
        }

        .sidebar--collapsed {
          width: 72px;
        }

        .sidebar-overlay {
          display: none;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 16px;
          border-bottom: 1px solid var(--border);
          min-height: 65px;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .sidebar-logo-icon {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar-logo-text {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          letter-spacing: -0.02em;
        }

        .sidebar-collapse-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border: none;
          background: var(--bg-glass);
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition);
          flex-shrink: 0;
        }

        .sidebar-collapse-btn:hover {
          color: var(--text-primary);
          background: var(--bg-glass-hover);
        }

        .sidebar-nav {
          flex: 1;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }

        .sidebar-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: var(--transition);
          white-space: nowrap;
          overflow: hidden;
        }

        .sidebar-nav-item:hover {
          color: var(--text-primary);
          background: var(--bg-glass);
        }

        .sidebar-nav-item--active {
          color: var(--accent-purple-light);
          background: rgba(108, 92, 231, 0.12);
        }

        .sidebar-nav-item--active:hover {
          background: rgba(108, 92, 231, 0.18);
        }

        .sidebar-nav-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
        }

        .sidebar-nav-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: var(--accent-purple);
          border-radius: 0 3px 3px 0;
        }

        .sidebar-footer {
          padding: 12px 8px;
          border-top: 1px solid var(--border);
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition);
          overflow: hidden;
        }

        .sidebar-user:hover {
          background: var(--bg-glass);
        }

        .sidebar-avatar {
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: white;
        }

        .sidebar-user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          white-space: nowrap;
        }

        .sidebar-user-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .sidebar-user-role {
          font-size: 11px;
          color: var(--text-muted);
        }

        /* Main */
        .dashboard-main {
          flex: 1;
          margin-left: var(--sidebar-width);
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sidebar--collapsed ~ .dashboard-main {
          margin-left: 72px;
        }

        .dashboard-header {
          position: sticky;
          top: 0;
          display: flex;
          align-items: center;
          height: var(--header-height);
          padding: 0 32px;
          background: rgba(10, 10, 26, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          z-index: 50;
          gap: 16px;
        }

        .mobile-menu-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          background: var(--bg-glass);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          cursor: pointer;
        }

        .header-breadcrumb {
          flex: 1;
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          background: transparent;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition);
        }

        .header-icon-btn:hover {
          color: var(--text-primary);
          background: var(--bg-glass);
        }

        .dashboard-content {
          flex: 1;
          padding: 32px;
          animation: fadeIn 0.4s ease-out;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            width: var(--sidebar-width);
          }

          .sidebar--mobile-open {
            transform: translateX(0);
          }

          .sidebar--collapsed {
            width: var(--sidebar-width);
          }

          .sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 99;
          }

          .sidebar-collapse-btn {
            display: none;
          }

          .dashboard-main {
            margin-left: 0 !important;
          }

          .mobile-menu-btn {
            display: flex;
          }

          .dashboard-content {
            padding: 20px 16px;
          }

          .dashboard-header {
            padding: 0 16px;
          }
        }
      `}</style>
    </div>
  );
}

function getBreadcrumb(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const map: Record<string, string> = {
    dashboard: "Dashboard",
    crm: "提案管理",
    projects: "專案管理",
    tasks: "我的任務",
    settings: "系統設定",
    new: "新增",
    templates: "任務模板",
  };

  return segments
    .map((seg) => map[seg] || seg)
    .join(" / ");
}
