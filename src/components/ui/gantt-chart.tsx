"use client";

import { useState, useRef, useEffect } from "react";
import { Gantt, Task as GanttTask, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { TASK_STATUS_LABELS } from "@/lib/constants";

interface ProjectGanttProps {
  tasks: any[];
  projectName: string;
}

export function ProjectGantt({ tasks, projectName }: ProjectGanttProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);
  const ganttRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const ganttTasks: GanttTask[] = tasks
    .filter(t => t.start_date && t.due_date) // 只顯示有日期的任務
    .map(t => {
      // 狀態轉進度
      let progress = 0;
      if (t.status === 'done') progress = 100;
      else if (t.status === 'in_progress' || t.status === 'in_review') progress = 50;

      return {
        start: new Date(t.start_date),
        end: new Date(t.due_date),
        name: t.title,
        id: t.id,
        type: "task",
        progress,
        isDisabled: true, // 不允許直接拖曳以避免錯誤，如果客戶要求拖曳需解開並處理 onDateChange
        styles: { 
          progressColor: "var(--accent-purple)", 
          progressSelectedColor: "var(--accent-purple-light)",
          backgroundColor: "var(--bg-glass)",
          backgroundSelectedColor: "var(--bg-tertiary)"
        }
      };
    });

  // 如果沒有有效的任務，加入一個虛擬任務以免畫面報錯
  if (ganttTasks.length === 0) {
    ganttTasks.push({
      start: new Date(),
      end: new Date(new Date().setDate(new Date().getDate() + 1)),
      name: "暫無已設定日期的任務",
      id: "dummy",
      type: "task",
      progress: 0,
      isDisabled: true
    });
  }

  const handleExportExcel = () => {
    const exportData = tasks.map(t => ({
      "任務名稱": t.title,
      "類別": t.task_category,
      "來源項目": t.source_item,
      "負責人": t.assigned_users?.full_name || "未指派",
      "狀態": TASK_STATUS_LABELS[t.status as keyof typeof TASK_STATUS_LABELS] || t.status,
      "開始日期": t.start_date,
      "截止日期": t.due_date,
      "預估天數": t.duration_days
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
    XLSX.writeFile(workbook, `${projectName}_專案排程.xlsx`);
  };

  const handleExportPDF = async () => {
    if (!ganttRef.current) return;
    
    // 為了截圖完整，可能需要暫時展開
    const canvas = await html2canvas(ganttRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    
    const pdf = new jsPDF("l", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${projectName}_專案排程.pdf`);
  };

  if (!isClient) return <div>載入甘特圖中...</div>;

  return (
    <div className="glass-card" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ margin: 0, fontSize: "16px", color: "var(--text-primary)" }}>專案排程甘特圖</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <select 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            style={{ padding: "6px 12px", background: "var(--bg-tertiary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", outline: "none" }}
          >
            <option value={ViewMode.Day}>日視圖</option>
            <option value={ViewMode.Week}>週視圖</option>
            <option value={ViewMode.Month}>月視圖</option>
          </select>
          <button onClick={handleExportExcel} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "13px" }}>匯出 Excel</button>
          <button onClick={handleExportPDF} className="btn-primary" style={{ padding: "6px 12px", fontSize: "13px" }}>匯出 PDF</button>
        </div>
      </div>

      {/* 覆蓋 gantt-task-react 的預設樣式以符合毛玻璃風格 */}
      <style dangerouslySetInnerHTML={{__html: `
        .gantt-container {
          border-radius: var(--radius-md) !important;
          overflow: hidden !important;
          border: 1px solid var(--border) !important;
        }
        .gantt .grid-row { fill: transparent !important; }
        .gantt .grid-row:nth-child(even) { fill: rgba(255,255,255,0.02) !important; }
        .gantt .grid-header { fill: var(--bg-tertiary) !important; stroke: var(--border) !important; }
        .gantt .grid-line { stroke: var(--border) !important; }
        .gantt .tick text { fill: var(--text-secondary) !important; font-size: 11px !important; }
        .gantt .task-list-header { background: var(--bg-tertiary) !important; color: var(--text-secondary) !important; }
        .gantt .task-list-row { border-bottom: 1px solid var(--border) !important; }
        .gantt .task-list-cell { color: var(--text-primary) !important; }
      `}} />

      <div ref={ganttRef} style={{ width: "100%", overflowX: "auto" }}>
        <Gantt
          tasks={ganttTasks}
          viewMode={viewMode}
          listCellWidth="155px"
          columnWidth={60}
          fontFamily="inherit"
        />
      </div>
    </div>
  );
}
