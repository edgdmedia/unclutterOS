import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const MAIL_HOST = process.env.MAIL_HOST || '';
const MAIL_PORT = Number(process.env.MAIL_PORT || 587);
const MAIL_SECURE = process.env.MAIL_SECURE === 'true';
const MAIL_USER = process.env.MAIL_USER || '';
const MAIL_PASS = process.env.MAIL_PASS || '';
const MAIL_FROM = process.env.MAIL_FROM || 'UnclutterOS <no-reply@unclutter.com.ng>';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;

  constructor() {
    if (MAIL_HOST) {
      this.transporter = nodemailer.createTransport({
        host: MAIL_HOST,
        port: MAIL_PORT,
        secure: MAIL_SECURE,
        auth: MAIL_USER && MAIL_PASS ? { user: MAIL_USER, pass: MAIL_PASS } : undefined,
      });
      this.logger.log(`SMTP configured via ${MAIL_HOST}:${MAIL_PORT}`);
    } else {
      this.transporter = null;
      this.logger.warn(
        'MAIL_HOST is not set — mail is running in PREVIEW mode and will be logged to the console. Set MAIL_HOST/MAIL_PORT/MAIL_USER/MAIL_PASS to send real email.',
      );
    }
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      this.logger.log(
        `\n[MAIL-PREVIEW] To: ${to}\nSubject: ${subject}\n\n${html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}\n`,
      );
      return;
    }
    await this.transporter.sendMail({
      from: MAIL_FROM,
      to,
      subject,
      html,
    });
    this.logger.log(`Email sent to ${to}: "${subject}"`);
  }

  sendVerificationEmail(to: string, verifyLink: string): Promise<void> {
    const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px;">
    <div style="background:#0F3A53;border-radius:20px;padding:28px;color:#FFFFFF;">
      <div style="font-size:18px;font-weight:700;">UnclutterOS</div>
      <div style="margin-top:20px;font-size:24px;font-weight:700;">Verify your email address</div>
      <p style="margin-top:8px;font-size:14px;line-height:1.6;color:#CBD5E1;">
        Welcome! Confirm this email to activate your practice account and get started.
      </p>
      <a href="${verifyLink}" style="display:inline-block;margin-top:22px;padding:14px 28px;border-radius:12px;background:#E3B341;color:#0F172A;font-weight:700;text-decoration:none;">
        Verify email address
      </a>
      <p style="margin-top:24px;font-size:12px;line-height:1.6;color:#94A3B8;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <span style="word-break:break-all;color:#CBD5E1;">${verifyLink}</span>
      </p>
      <p style="margin-top:20px;font-size:11px;color:#64748B;">
        This link expires in 24 hours. If you didn't create this account you can ignore this email.
      </p>
    </div>
  </div>
</body>
</html>`;
    return this.sendMail(to, 'Verify your UnclutterOS email', html);
  }
}
