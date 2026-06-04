import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardContent from "./dashboard-content";

export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const role = profile?.role || "operations";

  // Fetch stats based on role
  const [proposalsRes, projectsRes, tasksRes, myTasksRes] = await Promise.all([
    // Proposal stats
    supabase.from("proposals").select("id, status, amount, won_at", { count: "exact" }),
    // Project stats
    supabase.from("projects").select("id, status, progress, end_date", { count: "exact" }),
    // All tasks for project progress
    supabase.from("tasks").select("id, status, due_date, project_id", { count: "exact" }),
    // My tasks
    supabase
      .from("tasks")
      .select("id, title, status, due_date, priority, project_id, projects(name)")
      .eq("assignee_id", user.id)
      .neq("status", "done")
      .order("due_date", { ascending: true })
      .limit(10),
  ]);

  const proposals = proposalsRes.data || [];
  const projects = projectsRes.data || [];
  const allTasks = tasksRes.data || [];
  const myTasks = myTasksRes.data || [];

  // Calculate stats
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const stats = {
    // Proposal stats
    totalProposals: proposals.length,
    wonProposals: proposals.filter((p) => p.status === "won").length,
    winRate: proposals.length > 0
      ? Math.round((proposals.filter((p) => p.status === "won").length / proposals.length) * 100)
      : 0,
    monthlyRevenue: proposals
      .filter((p) => p.status === "won" && p.won_at && p.won_at >= monthStart)
      .reduce((sum, p) => sum + (p.amount || 0), 0),

    // Project stats
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.status === "in_progress").length,
    delayedProjects: projects.filter(
      (p) => p.status === "delayed" || (p.end_date && new Date(p.end_date) < now && !["completed", "closed"].includes(p.status))
    ).length,
    completedProjects: projects.filter((p) => ["completed", "closed"].includes(p.status)).length,

    // Task stats
    totalTasks: allTasks.length,
    completedTasks: allTasks.filter((t) => t.status === "done").length,
    overdueTasks: allTasks.filter(
      (t) => t.due_date && new Date(t.due_date) < now && t.status !== "done"
    ).length,
    upcomingTasks: allTasks.filter((t) => {
      if (!t.due_date || t.status === "done") return false;
      const due = new Date(t.due_date);
      const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      return due >= now && due <= threeDays;
    }).length,
  };

  // Proposal status distribution
  const proposalsByStatus = proposals.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  // Project status distribution
  const projectsByStatus = projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardContent
      role={role}
      stats={stats}
      proposalsByStatus={proposalsByStatus}
      projectsByStatus={projectsByStatus}
      myTasks={myTasks as any}
    />
  );
}
