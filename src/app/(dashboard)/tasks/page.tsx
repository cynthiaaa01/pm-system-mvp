import { getMyTasks } from "@/actions/tasks";
import TaskListClient from "./task-list-client";

export default async function TasksPage() {
  const tasks = await getMyTasks();

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "600", color: "var(--text-primary)" }}>我的任務</h1>
        <p style={{ color: "var(--text-muted)", margin: "4px 0 0 0", fontSize: "14px" }}>您被指派的所有進行中任務</p>
      </div>

      <TaskListClient initialTasks={tasks} />
    </div>
  );
}
