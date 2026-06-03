"use server";

import { createClient } from "@/lib/supabase/server";
import { startOfWeek, endOfWeek, subWeeks, format } from "date-fns";
import * as XLSX from "xlsx";
import { uploadToOneDrive } from "@/lib/onedrive";

export async function generateWeeklyReport() {
  const supabase = await createClient();
  
  // 取得上週的開始與結束時間
  const now = new Date();
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }); // 週一開始
  const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

  // 1. 撈取上週的所有 task_updates
  const { data: updates, error } = await supabase
    .from("task_updates")
    .select("*, tasks(title, task_category), projects(name), profiles:author_id(full_name, role)")
    .gte("created_at", lastWeekStart.toISOString())
    .lte("created_at", lastWeekEnd.toISOString())
    .order("created_at", { ascending: true });

  if (error || !updates) {
    console.error("Error fetching updates for report:", error);
    return { error: "Failed to fetch updates" };
  }

  // 2. 依照 人員 (Author) -> 專案 (Project) 進行分群
  const userReports: Record<string, any> = {};

  updates.forEach(update => {
    const userName = update.profiles?.full_name || "Unknown User";
    const role = update.profiles?.role || "other";
    const projectName = update.projects?.name || "無專案/行政";
    const taskTitle = update.tasks?.title || "一般更新";
    const content = update.content;
    const dateStr = format(new Date(update.created_at), "yyyy-MM-dd HH:mm");

    if (!userReports[userName]) {
      userReports[userName] = {
        role,
        projects: {}
      };
    }

    if (!userReports[userName].projects[projectName]) {
      userReports[userName].projects[projectName] = [];
    }

    userReports[userName].projects[projectName].push({
      taskTitle,
      content,
      dateStr,
      type: update.update_type
    });
  });

  // 3. 產生 Excel Workbook
  const workbook = XLSX.utils.book_new();

  // 建立彙總表 (依照角色)
  const opSummary: any[] = [];
  const mkSummary: any[] = [];

  Object.entries(userReports).forEach(([userName, data]: [string, any]) => {
    // 建立個人的 Sheet
    const personalRows: any[] = [];
    let bulletPointsForSummary = "";

    Object.entries(data.projects).forEach(([projectName, items]: [string, any]) => {
      personalRows.push({ "專案名稱": `🔹 ${projectName}`, "內容": "" });
      bulletPointsForSummary += `🔹 ${projectName}\n`;
      
      items.forEach((item: any) => {
        personalRows.push({ "專案名稱": "", "內容": `- ${item.taskTitle}: ${item.content} (${item.dateStr})` });
        bulletPointsForSummary += `- ${item.taskTitle}: ${item.content}\n`;
      });
      personalRows.push({ "專案名稱": "", "內容": "" }); // 留白
      bulletPointsForSummary += "\n";
    });

    const worksheet = XLSX.utils.json_to_sheet(personalRows);
    
    // 設定欄寬
    worksheet["!cols"] = [{ wch: 30 }, { wch: 80 }];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, `${userName.substring(0, 10)}-週報`);

    // 塞入彙總表
    const summaryRow = {
      "人員": userName,
      "本週執行事項": bulletPointsForSummary.trim()
    };

    if (data.role === 'operations_manager' || data.role === 'operations') {
      opSummary.push(summaryRow);
    } else if (data.role === 'marketing_manager' || data.role === 'marketing') {
      mkSummary.push(summaryRow);
    } else {
      // 其他角色放 OP 或視情況
      opSummary.push(summaryRow);
    }
  });

  if (opSummary.length > 0) {
    const wsOp = XLSX.utils.json_to_sheet(opSummary);
    wsOp["!cols"] = [{ wch: 15 }, { wch: 100 }];
    XLSX.utils.book_append_sheet(workbook, wsOp, "OP-週報彙總");
  }

  if (mkSummary.length > 0) {
    const wsMk = XLSX.utils.json_to_sheet(mkSummary);
    wsMk["!cols"] = [{ wch: 15 }, { wch: 100 }];
    XLSX.utils.book_append_sheet(workbook, wsMk, "MK-週報彙總");
  }

  // 如果沒有資料，給一個空的 sheet 避免報錯
  if (Object.keys(userReports).length === 0) {
    const wsEmpty = XLSX.utils.json_to_sheet([{ "訊息": "本週無更新紀錄" }]);
    XLSX.utils.book_append_sheet(workbook, wsEmpty, "本週無紀錄");
  }

  // 4. 寫入 Buffer 並上傳 OneDrive
  const dateSuffix = format(lastWeekStart, "MMdd") + "-" + format(lastWeekEnd, "MMdd");
  const fileName = `Weekly_Report_${dateSuffix}.xlsx`;
  
  // Node.js 中 xlsx 可以寫成 buffer
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  try {
    const fileUrl = await uploadToOneDrive(buffer, fileName);
    return { success: true, url: fileUrl };
  } catch (err: any) {
    console.error("Failed to upload weekly report to OneDrive:", err);
    return { error: `Upload failed: ${err.message}` };
  }
}
