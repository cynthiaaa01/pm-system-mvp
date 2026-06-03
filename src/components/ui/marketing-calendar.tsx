"use client";

import { useState } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { zhTW } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = {
  "zh-TW": zhTW,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface MarketingCalendarProps {
  tasks: any[];
}

export function MarketingCalendar({ tasks }: MarketingCalendarProps) {
  const [view, setView] = useState<View>("month");

  // 過濾出行銷類別的任務 (例如以 "行銷" 或 "社群" 關鍵字分類的)
  // 或全部任務都顯示，因為這可能是專為行銷看整體進度的日曆
  const marketingEvents = tasks
    .filter((t) => t.start_date || t.due_date)
    .map((t) => {
      return {
        id: t.id,
        title: t.title,
        start: t.start_date ? new Date(t.start_date) : new Date(t.due_date),
        end: t.due_date ? new Date(t.due_date) : new Date(t.start_date),
        allDay: true,
        resource: t,
      };
    });

  const eventStyleGetter = (event: any) => {
    let backgroundColor = "var(--bg-tertiary)";
    let borderColor = "var(--border)";
    let color = "var(--text-primary)";

    if (event.resource.status === "done") {
      backgroundColor = "rgba(46, 213, 115, 0.15)";
      borderColor = "var(--accent-green)";
      color = "var(--accent-green-light)";
    } else if (event.resource.status === "in_progress") {
      backgroundColor = "rgba(255, 165, 2, 0.15)";
      borderColor = "var(--accent-orange)";
      color = "var(--accent-orange-light)";
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.9,
        color,
        border: `1px solid ${borderColor}`,
        display: "block",
        fontSize: "12px",
        padding: "2px 4px",
      },
    };
  };

  return (
    <div className="glass-card" style={{ padding: "24px", height: "800px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ margin: 0, fontSize: "18px", color: "var(--text-primary)" }}>行銷檔期日曆</h3>
      </div>
      
      {/* 注入自訂 CSS 以覆寫 react-big-calendar 的預設樣式為毛玻璃風格 */}
      <style dangerouslySetInnerHTML={{__html: `
        .rbc-calendar { font-family: inherit; color: var(--text-primary); }
        .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border-color: var(--border); border-radius: var(--radius-md); overflow: hidden; }
        .rbc-header { border-bottom: 1px solid var(--border) !important; border-left: 1px solid var(--border) !important; padding: 10px 0; background: var(--bg-tertiary); color: var(--text-secondary); font-weight: 500; }
        .rbc-day-bg { border-left: 1px solid var(--border) !important; }
        .rbc-month-row { border-top: 1px solid var(--border) !important; }
        .rbc-off-range-bg { background: rgba(0, 0, 0, 0.2); }
        .rbc-today { background: rgba(108, 92, 231, 0.05); }
        .rbc-btn-group button { color: var(--text-primary); border-color: var(--border); background: var(--bg-tertiary); }
        .rbc-btn-group button:hover { background: var(--bg-secondary); }
        .rbc-btn-group button.rbc-active { background: var(--accent-purple); color: white; border-color: var(--accent-purple); }
        .rbc-toolbar button { font-size: 13px; }
      `}} />

      <Calendar
        localizer={localizer}
        events={marketingEvents}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={setView}
        views={["month", "week", "day", "agenda"]}
        eventPropGetter={eventStyleGetter}
        culture="zh-TW"
        style={{ height: "calc(100% - 50px)" }}
      />
    </div>
  );
}
