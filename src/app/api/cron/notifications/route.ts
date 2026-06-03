import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { countBusinessDays } from "@/lib/business-days";
import { sendSlackNotification, formatTaskDueMessage } from "@/lib/slack";

// 僅供 cron 執行的 endpoint
export async function GET(request: Request) {
  // 檢查授權 (Vercel Cron 發送的請求會有 authorization header)
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 使用 service_role key 以繞過 RLS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // 為了 demo，若沒有 service role key 則使用 anon
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. 取得今年的假日資料
    const currentYear = new Date().getFullYear();
    const { data: holidaysData } = await supabase
      .from("holidays")
      .select("date")
      .eq("year", currentYear);
      
    const holidays = (holidaysData || []).map(h => new Date(h.date));

    // 2. 取得未完成且有設定到期日的任務
    const { data: tasks } = await supabase
      .from("tasks")
      .select("*, project:projects(id, name), assignee:profiles(id, full_name)")
      .not("due_date", "is", null)
      .not("status", "eq", "done")
      .not("assignee_id", "is", null);

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ message: "No pending tasks found" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const notificationsToInsert = [];

    // 3. 處理每個任務
    for (const task of tasks) {
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);

      // 計算從今天到到期日還有幾個工作天
      const daysUntilDue = countBusinessDays(today, dueDate, holidays);

      // 檢查是否逾期（由於 countBusinessDays 的邏輯，如果 today > dueDate，回傳負數）
      const isOverdue = daysUntilDue < 0;

      // 根據工作天決定是否通知 (例如：提前 3 個工作天、明天到期、或已逾期)
      let shouldNotify = false;
      let notificationType = null;
      let title = "";
      let message = "";

      if (isOverdue) {
        shouldNotify = true;
        notificationType = "task_overdue";
        title = `任務已逾期: ${task.title}`;
        message = `專案 "${task.project.name}" 的任務 "${task.title}" 已逾期 ${Math.abs(daysUntilDue)} 個工作天！`;
      } else if (daysUntilDue === 1) {
        shouldNotify = true;
        notificationType = "task_due_soon";
        title = `任務明天到期: ${task.title}`;
        message = `專案 "${task.project.name}" 的任務 "${task.title}" 明天即將到期。`;
      } else if (daysUntilDue === 3) {
        shouldNotify = true;
        notificationType = "task_due_soon";
        title = `任務即將到期: ${task.title}`;
        message = `專案 "${task.project.name}" 的任務 "${task.title}" 將在 3 個工作天後到期。`;
      }

      if (shouldNotify) {
        // 準備推播應用內通知
        notificationsToInsert.push({
          recipient_id: task.assignee_id,
          type: notificationType,
          title,
          message,
          reference_type: 'task',
          reference_id: task.id,
        });

        // 準備發送 Slack 訊息 (這裡可以直接發送)
        const slackBlocks = formatTaskDueMessage(
          task, 
          task.project, 
          task.assignee?.full_name || '未指派',
          daysUntilDue,
          isOverdue
        );
        
        await sendSlackNotification({
          text: title,
          blocks: slackBlocks
        });
      }
    }

    // 4. 批次新增應用內通知
    if (notificationsToInsert.length > 0) {
      const { error } = await supabase
        .from("notifications")
        .insert(notificationsToInsert);
        
      if (error) {
        console.error("Failed to insert notifications:", error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: tasks.length,
      notified: notificationsToInsert.length 
    });

  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
