import 'server-only';
import { money, monthLabel } from '@/lib/format';

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

type PaymentEmailStatus = 'due' | 'paid';

export type PaymentEmailPayload = {
  to: string | null | undefined;
  workerName: string | null | undefined;
  status: PaymentEmailStatus;
  amountCents: number;
  paymentMonth: string;
};

const statusCopy: Record<
  TaskEmailStatus,
  { subject: string; heading: string; intro: string; badge: string; badgeBg: string; badgeText: string }
> = {
  assigned: {
    subject: 'New task assigned',
    heading: 'You have a new task',
    intro: 'A new task has been assigned to you in TaskRoom.',
    badge: 'Assigned',
    badgeBg: '#e7f3ed',
    badgeText: '#11664b',
  },
  under_review: {
    subject: 'Task moved to review',
    heading: 'Your task is under review',
    intro: 'Your completed task has been moved to admin review.',
    badge: 'Under review',
    badgeBg: '#eaf0fc',
    badgeText: '#34568d',
  },
  approved: {
    subject: 'Task approved',
    heading: 'Your task was approved',
    intro: 'Great work. Your task has been approved and the fee has been added to your earnings.',
    badge: 'Approved',
    badgeBg: '#e7f3ed',
    badgeText: '#11664b',
  },
  rework: {
    subject: 'Task needs rework',
    heading: 'Your task needs rework',
    intro: 'Admin reviewed your task and requested some changes before approval.',
    badge: 'Rework needed',
    badgeBg: '#fff3df',
    badgeText: '#a56308',
  },
  rejected: {
    subject: 'Task rejected',
    heading: 'Your task was rejected',
    intro: 'Admin reviewed your task and marked it as rejected.',
    badge: 'Rejected',
    badgeBg: '#fde9e9',
    badgeText: '#ae3939',
  },
};

const paymentStatusCopy: Record<
  PaymentEmailStatus,
  { subject: string; heading: string; badge: string; badgeBg: string; badgeText: string }
> = {
  due: {
    subject: 'Payment due',
    heading: 'You have a payment due',
    badge: 'Due',
    badgeBg: '#fff3df',
    badgeText: '#a56308',
  },
  paid: {
    subject: 'Payment sent',
    heading: 'Your payment has been sent',
    badge: 'Paid',
    badgeBg: '#e7f3ed',
    badgeText: '#11664b',
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

function appUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://taskroom1.netlify.app').replace(/\/$/, '');
}

function taskUrl() {
  return `${appUrl()}/tasks`;
}

function earningsUrl() {
  return `${appUrl()}/earnings`;
}

function logoUrl() {
  return `${appUrl()}/email-logo.png`;
}

function emailShell(options: {
  heading: string;
  badge: string;
  badgeBg: string;
  badgeText: string;
  body: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return `
    <div style="margin:0;background:#eef4ef;padding:32px 16px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#16221d">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 24px 60px rgba(22,34,29,.1)">
        <div style="background:linear-gradient(135deg,#0e523c,#163228);padding:32px 32px 26px">
          <div style="display:flex;align-items:center;gap:12px">
            <img src="${logoUrl()}" width="40" height="40" alt="TaskRoom" style="display:inline-block;vertical-align:middle;border-radius:10px" />
            <span style="display:inline-block;vertical-align:middle;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:rgba(255,255,255,.78)">TaskRoom</span>
          </div>
          <h1 style="margin:20px 0 0;font-size:26px;line-height:1.25;color:#ffffff;font-weight:700">${escapeHtml(options.heading)}</h1>
        </div>
        <div style="padding:32px">
          <span style="display:inline-block;margin-bottom:18px;padding:6px 14px;border-radius:999px;font-size:12px;font-weight:700;background:${options.badgeBg};color:${options.badgeText}">${escapeHtml(options.badge)}</span>
          ${options.body}
          <a href="${options.ctaHref}" style="display:inline-block;margin-top:28px;background:#11664b;color:#ffffff;text-decoration:none;border-radius:12px;padding:14px 22px;font-weight:700;font-size:15px">${escapeHtml(options.ctaLabel)}</a>
        </div>
        <div style="padding:18px 32px;border-top:1px solid #edf1ee;background:#fbfdfb">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#8a988f">This is an automated notification from TaskRoom. Please do not reply to this email.</p>
        </div>
      </div>
    </div>
  `;
}

function renderTaskEmail(payload: TaskEmailPayload) {
  const copy = statusCopy[payload.status];
  const worker = payload.workerName?.trim() || 'there';
  const comment = payload.comment?.trim();

  const body = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.7">Hi ${escapeHtml(worker)},</p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#405247">${escapeHtml(copy.intro)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #edf1ee;border-radius:16px;background:#f8fbf7">
      <tr>
        <td style="padding:18px 20px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.9">
            <tr>
              <td style="color:#68766e;padding:4px 0">Task ID</td>
              <td style="text-align:right;font-weight:700;padding:4px 0">${escapeHtml(payload.taskId)}</td>
            </tr>
            <tr>
              <td style="color:#68766e;padding:4px 0">Language</td>
              <td style="text-align:right;font-weight:700;padding:4px 0">${escapeHtml(payload.language)}</td>
            </tr>
            <tr>
              <td style="color:#68766e;padding:4px 0">Expected steps</td>
              <td style="text-align:right;font-weight:700;padding:4px 0">${escapeHtml(payload.stepRange)}</td>
            </tr>
            <tr>
              <td style="color:#68766e;padding:4px 0">Fee</td>
              <td style="text-align:right;font-weight:700;color:#11664b;padding:4px 0">${escapeHtml(money(payload.feeCents))}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    ${
      comment
        ? `<div style="margin-top:18px;border-left:4px solid #a56308;background:#fff8ea;padding:14px 16px;border-radius:0 12px 12px 0;color:#5e4826"><strong>Admin comment</strong><br>${escapeHtml(comment)}</div>`
        : ''
    }
  `;

  return emailShell({
    heading: copy.heading,
    badge: copy.badge,
    badgeBg: copy.badgeBg,
    badgeText: copy.badgeText,
    body,
    ctaHref: taskUrl(),
    ctaLabel: 'Open TaskRoom',
  });
}

function renderPaymentEmail(payload: PaymentEmailPayload) {
  const copy = paymentStatusCopy[payload.status];
  const worker = payload.workerName?.trim() || 'there';
  const amount = money(payload.amountCents);
  const month = monthLabel(payload.paymentMonth);

  const intro =
    payload.status === 'due'
      ? `You have payment due for the month of ${escapeHtml(month)}. Amount: <strong>${escapeHtml(amount)}</strong>. You will receive your payment in your added bank account details within the next 10 days.`
      : `Payment of <strong>${escapeHtml(amount)}</strong> for the month of ${escapeHtml(month)} has been paid to your account. It may take a while to reflect depending on your bank network. If it hasn't reflected after 10 days, please reach out to us so we can look into it.`;

  const body = `
    <p style="margin:0 0 16px;font-size:16px;line-height:1.7">Hi ${escapeHtml(worker)},</p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#405247">${intro}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #edf1ee;border-radius:16px;background:#f8fbf7">
      <tr>
        <td style="padding:18px 20px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.9">
            <tr>
              <td style="color:#68766e;padding:4px 0">Month</td>
              <td style="text-align:right;font-weight:700;padding:4px 0">${escapeHtml(month)}</td>
            </tr>
            <tr>
              <td style="color:#68766e;padding:4px 0">Amount</td>
              <td style="text-align:right;font-weight:700;color:#11664b;padding:4px 0">${escapeHtml(amount)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  return emailShell({
    heading: copy.heading,
    badge: copy.badge,
    badgeBg: copy.badgeBg,
    badgeText: copy.badgeText,
    body,
    ctaHref: earningsUrl(),
    ctaLabel: 'View earnings',
  });
}

async function sendBrevoEmail(options: {
  to: string | null | undefined;
  toName: string | null | undefined;
  subject: string;
  htmlContent: string;
  skipLogMessage: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME ?? 'TaskRoom';

  if (!options.to || !apiKey || !senderEmail) {
    console.warn(options.skipLogMessage);
    return;
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: options.to, name: options.toName || undefined }],
      subject: options.subject,
      htmlContent: options.htmlContent,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Brevo email failed (${response.status}): ${body}`);
  }
}

export async function sendTaskEmail(payload: TaskEmailPayload) {
  const copy = statusCopy[payload.status];
  await sendBrevoEmail({
    to: payload.to,
    toName: payload.workerName,
    subject: `${copy.subject}: ${payload.taskId}`,
    htmlContent: renderTaskEmail(payload),
    skipLogMessage: 'Task email skipped: missing recipient or Brevo configuration.',
  });
}

export async function sendPaymentEmail(payload: PaymentEmailPayload) {
  const copy = paymentStatusCopy[payload.status];
  await sendBrevoEmail({
    to: payload.to,
    toName: payload.workerName,
    subject: `${copy.subject}: ${monthLabel(payload.paymentMonth)}`,
    htmlContent: renderPaymentEmail(payload),
    skipLogMessage: 'Payment email skipped: missing recipient or Brevo configuration.',
  });
}
