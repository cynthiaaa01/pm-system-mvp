import { getAllTasks } from "@/actions/tasks";
import { MarketingCalendar } from "@/components/ui/marketing-calendar";

export default async function CalendarPage() {
  const tasks = await getAllTasks();

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "8px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "600", color: "var(--text-primary)", margin: "0 0 8px 0" }}>全域行銷檔期</h1>
          <p style={{ color: "var(--text-secondary)", margin: 0, fontSize: "14px" }}>
            總覽所有專案的行銷活動與發布時程。
          </p>
        </div>
      </div>

      <MarketingCalendar tasks={tasks} />
    </div>
  );
}
