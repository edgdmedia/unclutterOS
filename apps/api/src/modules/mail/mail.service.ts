import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Google SMTP (smtp.gmail.com:465 + app password). SMTP_* names match the
// Unclutter suite; MAIL_* is kept as a fallback for existing deployments.
const SMTP_HOST = process.env.SMTP_HOST || process.env.MAIL_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 465);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER || process.env.MAIL_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || process.env.MAIL_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || process.env.MAIL_FROM || 'UnclutterOS <no-reply@unclutter.com.ng>';

export interface MailSendResult {
  sent: boolean;
  log_only?: boolean;
  preview?: boolean;
  messageId?: string | null;
}

export interface SendMailOptions {
  /** Display name of the sender; defaults to SMTP_FROM_NAME / "UnclutterOS". */
  fromName?: string;
  /** Reply-To address (e.g. the practice's public email). Defaults to the sender. */
  replyTo?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;

  constructor() {
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });
      this.logger.log(`SMTP configured via ${SMTP_HOST}:${SMTP_PORT}`);
    } else {
      this.transporter = null;
      this.logger.warn(
        'SMTP_HOST / SMTP_USER / SMTP_PASS are not set — emails run in PREVIEW mode and are logged to the console.',
      );
    }
  }

  // Outside production we always log email contents so verification codes are
  // visible in the dev server without needing real delivery.
  private shouldLog(): boolean {
    return process.env.EMAIL_LOG === 'true' || process.env.NODE_ENV !== 'production';
  }

  isConfigured(): boolean {
    return !!this.transporter;
  }

  private buildSender(fromName?: string): string {
    const raw = SMTP_FROM.trim();
    const name = (fromName || process.env.SMTP_FROM_NAME || 'UnclutterOS').trim().replace(/"/g, '\\"');
    if (raw.includes('<') && raw.includes('>')) {
      const addr = raw.match(/<([^>]+)>/)?.[1] ?? raw;
      return `"${name}" <${addr}>`;
    }
    return `"${name}" <${raw}>`;
  }

  async sendMail(
    to: string,
    subject: string,
    html: string,
    text?: string,
    options: SendMailOptions = {},
  ): Promise<MailSendResult> {
    if (process.env.EMAIL_LOG_ONLY === 'true') {
      return { sent: false, log_only: true };
    }

    if (!this.transporter) {
      const fromLabel = options.fromName || 'UnclutterOS';
      this.logger.log(`[MAIL-PREVIEW] From: "${fromLabel}"${options.replyTo ? ` | Reply-To: ${options.replyTo}` : ''}\nTo: ${to}\nSubject: ${subject}\n${text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`);
      return { sent: false, preview: true };
    }

    const result = await this.transporter.sendMail({
      from: this.buildSender(options.fromName),
      to,
      subject,
      html,
      ...(text ? { text } : {}),
      ...(options.replyTo ? { replyTo: options.replyTo } : {}),
    });
    return { sent: true, messageId: result.messageId ?? null };
  }

  sendVerificationEmail(to: string, code: string): Promise<MailSendResult> {
    if (this.shouldLog()) {
      this.logger.log(`Verification code for ${to}: ${code}`);
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px;">
    <div style="background:#0F3A53;border-radius:20px;padding:28px;color:#FFFFFF;">
      <div style="font-size:18px;font-weight:700;">UnclutterOS</div>
      <div style="margin-top:20px;font-size:24px;font-weight:700;">Verify your email address</div>
      <p style="margin-top:8px;font-size:14px;line-height:1.6;color:#CBD5E1;">
        Welcome! Enter this code in the app to activate your account. It expires in 30 minutes.
      </p>
      <div style="margin:22px 0 4px;padding:20px;border-radius:14px;background:#F8FAFC;text-align:center;">
        <div style="font-size:12px;letter-spacing:0.12em;color:#64748B;">VERIFICATION CODE</div>
        <div style="margin-top:8px;font-size:34px;font-weight:800;letter-spacing:0.16em;color:#0F3A53;">${code}</div>
      </div>
      <p style="margin-top:22px;font-size:11px;color:#64748B;">
        If you didn't create this account you can ignore this email. The code is single-use.
      </p>
    </div>
  </div>
</body>
</html>`;
    return this.sendMail(
      to,
      'Verify your UnclutterOS email',
      html,
      `Your UnclutterOS verification code is ${code}. Enter it in the app to activate your account. The code expires in 30 minutes.`,
    );
  }
}
