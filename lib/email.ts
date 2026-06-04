import 'server-only';
import { money } from '@/lib/format';

type TaskEmailStatus = 'assigned' | 'under_review' | 'approved' | 'rework' | 'rejected';

export type TaskEmailPayload = {
  to: string | null | undefined;
  workerName: string | null | undefined;
  taskId: string;
  status: TaskEmailStatus;
  language: string;
  stepRange: string;
  feeCents: number;
  comment?: string | null;
};

const statusCopy: Record<TaskEmailStatus, { subject: string; heading: string; intro: string }> = {
  assigned: {
    subject: 'New task assigned',
    heading: 'You have a new task',
    intro: 'A new task has been assigned to you in TaskRoom.',
  },
  under_review: {
    subject: 'Task moved to review',
    heading: 'Your task is under review',
    intro: 'Your completed task has been moved to admin review.',
  },
  approved: {
    subject: 'Task approved',
    heading: 'Your task was approved',
    intro: 'Great work. Your task has been approved and the fee has been added to your earnings.',
  },
  rework: {
    subject: 'Task needs rework',
    heading: 'Your task needs rework',
    intro: 'Admin reviewed your task and requested some changes before approval.',
  },
  rejected: {
    subject: 'Task rejected',
    heading: 'Your task was rejected',
    intro: 'Admin reviewed your task and marked it as rejected.',
  },
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function taskUrl() {
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://taskroom1.netlify.app';
  return `${appUrl.replace(/\/$/, '')}/tasks`;
}

function renderTaskEmail(payload: TaskEmailPayload) {
  const copy = statusCopy[payload.status];
  const worker = payload.workerName?.trim() || 'there';
  const comment = payload.comment?.trim();

  return `
    <div style="margin:0;background:#f6fbf6;padding:32px;font-family:Inter,Arial,sans-serif;color:#16221d">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e2e8e3;border-radius:24px;overflow:hidden;box-shadow:0 20px 55px rgba(22,34,29,.08)">
        <div style="background:linear-gradient(135deg,#11664b,#163228);padding:28px;color:#ffffff">
          <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.14em;color:rgba(255,255,255,.72)">TaskRoom</p>
          <h1 style="margin:0;font-size:28px;line-height:1.15">${escapeHtml(copy.heading)}</h1>
        </div>
        <div style="padding:28px">
          <p style="margin:0 0 18px;font-size:16px;line-height:1.7">Hi ${escapeHtml(worker)},</p>
          <p style="margin:0 0 22px;font-size:16px;line-height:1.7;color:#405247">${escapeHtml(copy.intro)}</p>
          <div style="border:1px solid #edf1ee;border-radius:18px;padding:18px;background:#f8fbf7">
            <p style="margin:0 0 10px"><strong>Task ID:</strong> ${escapeHtml(payload.taskId)}</p>
            <p style="margin:0 0 10px"><strong>Language:</strong> ${escapeHtml(payload.language)}</p>
            <p style="margin:0 0 10px"><strong>Expected steps:</strong> ${escapeHtml(payload.stepRange)}</p>
            <p style="margin:0"><strong>Fee:</strong> ${escapeHtml(money(payload.feeCents))}</p>
          </div>
          ${
            comment
              ? `<div style="margin-top:18px;border-left:4px solid #a56308;background:#fff8ea;padding:14px 16px;color:#5e4826"><strong>Admin comment</strong><br>${escapeHtml(comment)}</div>`
              : ''
          }
          <a href="${taskUrl()}" style="display:inline-block;margin-top:24px;background:#11664b;color:#ffffff;text-decoration:none;border-radius:12px;padding:13px 18px;font-weight:700">Open TaskRoom</a>
        </div>
      </div>
    </div>
  `;
}

export async function sendTaskEmail(payload: TaskEmailPayload) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME ?? 'TaskRoom';

  if (!payload.to || !apiKey || !senderEmail) {
    console.warn('Task email skipped: missing recipient or Brevo configuration.');
    return;
  }

  const copy = statusCopy[payload.status];
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: payload.to, name: payload.workerName || undefined }],
      subject: `${copy.subject}: ${payload.taskId}`,
      htmlContent: renderTaskEmail(payload),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Brevo email failed (${response.status}): ${body}`);
  }
}
