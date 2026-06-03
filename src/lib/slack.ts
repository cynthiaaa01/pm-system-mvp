// ============================================================
// PM System - Slack Integration
// ============================================================

export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
    emoji?: boolean;
  };
  fields?: {
    type: string;
    text: string;
    emoji?: boolean;
  }[];
  elements?: any[];
  accessory?: any;
}

/**
 * Sends a message to the configured Slack Webhook.
 */
export async function sendSlackNotification(params: {
  text: string;
  blocks?: SlackBlock[];
}): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('Slack Webhook URL is not configured. Skipping notification.');
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: params.text,
        blocks: params.blocks,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to send Slack notification: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error('Error sending Slack notification:', error);
  }
}

/**
 * Formats a task due reminder into Slack blocks.
 */
export function formatTaskDueMessage(
  task: any,
  project: any,
  assigneeName: string,
  daysUntilDue: number,
  isOverdue: boolean
): SlackBlock[] {
  const statusEmoji = isOverdue ? '🚨' : (daysUntilDue === 0 ? '⚠️' : '🔔');
  const urgencyText = isOverdue 
    ? `已逾期 ${Math.abs(daysUntilDue)} 天！` 
    : (daysUntilDue === 0 ? '今天到期！' : `將於 ${daysUntilDue} 個工作天後到期`);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const taskUrl = `${baseUrl}/dashboard/projects/${project.id}?taskId=${task.id}`;

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${statusEmoji} 任務提醒: ${task.title}`,
        emoji: true
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*專案:* ${project.name}\n*負責人:* ${assigneeName}\n*狀態:* ${urgencyText}`
      }
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `📅 到期日: ${task.due_date || '未設定'}`
        }
      ]
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '查看任務',
            emoji: true
          },
          url: taskUrl,
          action_id: 'view_task_button'
        }
      ]
    }
  ];
}
