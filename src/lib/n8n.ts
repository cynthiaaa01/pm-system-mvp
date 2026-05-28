const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;

async function sendToN8n(payload: any) {
  if (!N8N_WEBHOOK_URL) {
    console.log("n8n Webhook URL not configured. Skipping webhook:", payload.event);
    return false;
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(N8N_API_KEY ? { "Authorization": `Bearer ${N8N_API_KEY}` } : {})
      },
      body: JSON.stringify(payload),
      // Don't await the full connection to keep UI fast
      signal: AbortSignal.timeout(3000)
    });
    
    return response.ok;
  } catch (error) {
    console.error("Failed to trigger n8n webhook:", error);
    return false;
  }
}

export function triggerProposalWon(proposal: any, project: any, operationsProfile?: any) {
  return sendToN8n({
    event: "proposal.won",
    timestamp: new Date().toISOString(),
    data: {
      proposalId: proposal.id,
      proposalTitle: proposal.title,
      projectId: project.id,
      projectName: project.name,
      projectNumber: project.project_number,
      clientName: proposal.clients?.name,
      operationsSlackId: operationsProfile?.slack_id || null,
      message: `🎉 *提案已成交：${proposal.title}*\n客戶：${proposal.clients?.name}\n已自動建立專案：${project.project_number}`
    }
  });
}

export function triggerTaskReminder(task: any, project: any, assigneeProfile?: any) {
  return sendToN8n({
    event: "task.reminder",
    timestamp: new Date().toISOString(),
    data: {
      taskId: task.id,
      taskName: task.name,
      projectId: project.id,
      projectName: project.name,
      dueDate: task.due_date,
      assigneeSlackId: assigneeProfile?.slack_id || null,
      message: `⏰ *任務提醒*\n\n任務：${task.name}\n專案：${project.name}\n負責人：<@${assigneeProfile?.slack_id || "這裡"}>\n截止日：${task.due_date}\n狀態：${task.status}\n\n請盡快處理！`
    }
  });
}

export function triggerProjectCompleted(project: any) {
  return sendToN8n({
    event: "project.completed",
    timestamp: new Date().toISOString(),
    data: {
      projectId: project.id,
      projectName: project.name,
      projectNumber: project.project_number,
      message: `✅ *專案已結案*\n\n專案：${project.name} (${project.project_number})\n辛苦所有參與的團隊成員！`
    }
  });
}
