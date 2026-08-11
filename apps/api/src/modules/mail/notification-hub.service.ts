import { Injectable, Logger } from '@nestjs/common';
import { MailService } from './mail.service';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface BookingDetailsNotification {
  clientName: string;
  clientEmail: string;
  therapistName: string;
  serviceName: string;
  startTime: Date | string;
  endTime?: Date | string;
  joinUrl: string;
  practiceName: string;
  practiceLogoUrl?: string;
  primaryColor?: string;
  publicPhone?: string;
}

@Injectable()
export class NotificationHubService {
  private readonly logger = new Logger(NotificationHubService.name);

  constructor(
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Render tenant-branded responsive HTML container
   */
  private wrapTenantTemplate(
    contentHtml: string,
    brand: {
      practiceName: string;
      primaryColor?: string;
      logoUrl?: string;
      publicPhone?: string;
    },
  ): string {
    const primaryColor = brand.primaryColor || '#0F3A53';
    const logoHeader = brand.logoUrl
      ? `<img src="${brand.logoUrl}" alt="${brand.practiceName}" style="height:38px;border-radius:8px;vertical-align:middle;" />`
      : `<div style="font-size:20px;font-weight:800;color:#FFFFFF;letter-spacing:-0.02em;">${brand.practiceName}</div>`;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F172A;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F8FAFC;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:540px;background-color:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.06);border:1px solid #E2E8F0;">
          <!-- Tenant Header -->
          <tr>
            <td style="background-color:${primaryColor};padding:24px 28px;text-align:left;">
              ${logoHeader}
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding:32px 28px;">
              ${contentHtml}
            </td>
          </tr>
          <!-- Tenant Footer -->
          <tr>
            <td style="background-color:#F1F5F9;padding:20px 28px;border-top:1px solid #E2E8F0;font-size:12px;color:#64748B;line-height:1.6;">
              <div><strong>${brand.practiceName}</strong></div>
              ${brand.publicPhone ? `<div>Contact: ${brand.publicPhone}</div>` : ''}
              <div style="margin-top:8px;font-size:11px;color:#94A3B8;">Powered by UnclutterOS · Secure NDPR-compliant practice management</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /**
   * Send Client Booking Confirmation Email
   */
  async sendBookingConfirmation(details: BookingDetailsNotification): Promise<void> {
    const formattedDate = new Date(details.startTime).toLocaleString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const content = `
      <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#0F172A;">Appointment Confirmed</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.6;">
        Hello <strong>${details.clientName}</strong>, your upcoming telehealth session with <strong>${details.therapistName}</strong> has been confirmed.
      </p>
      
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#F8FAFC;border-radius:14px;padding:18px;margin-bottom:24px;border:1px solid #E2E8F0;">
        <tr>
          <td style="font-size:13px;color:#64748B;padding-bottom:6px;">Service:</td>
          <td style="font-size:13.5px;font-weight:700;color:#0F172A;text-align:right;padding-bottom:6px;">${details.serviceName}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#64748B;padding-bottom:6px;">Date & Time:</td>
          <td style="font-size:13.5px;font-weight:700;color:#0F172A;text-align:right;padding-bottom:6px;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="font-size:13px;color:#64748B;">Practitioner:</td>
          <td style="font-size:13.5px;font-weight:700;color:#0F172A;text-align:right;">${details.therapistName}</td>
        </tr>
      </table>

      <div style="text-align:center;margin-top:28px;">
        <a href="${details.joinUrl}" style="display:inline-block;padding:14px 28px;border-radius:14px;background-color:${details.primaryColor || '#0F3A53'};color:#FFFFFF;font-weight:700;font-size:14px;text-decoration:none;">
          Join Video Room
        </a>
      </div>
      <p style="margin-top:16px;font-size:12px;color:#94A3B8;text-align:center;">
        Room link: <span style="word-break:break-all;color:#0F3A53;">${details.joinUrl}</span>
      </p>
    `;

    const html = this.wrapTenantTemplate(content, details);
    await this.mailService.sendMail(
      details.clientEmail,
      `Booking Confirmed: ${details.serviceName} with ${details.therapistName}`,
      html,
    );
  }

  /**
   * Send 24-Hour or 1-Hour Session Reminder Email
   */
  async sendSessionReminder(
    details: BookingDetailsNotification,
    reminderType: '24h' | '1h',
  ): Promise<void> {
    const timeLabel = reminderType === '24h' ? 'tomorrow' : 'in 1 hour';
    const formattedDate = new Date(details.startTime).toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    const content = `
      <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#0F172A;">Session Reminder</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.6;">
        Reminder: Your session with <strong>${details.therapistName}</strong> is scheduled for <strong>${timeLabel}</strong> (${formattedDate}).
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="${details.joinUrl}" style="display:inline-block;padding:14px 28px;border-radius:14px;background-color:#E3B341;color:#0F172A;font-weight:800;font-size:14px;text-decoration:none;">
          Join Session Room Now
        </a>
      </div>
    `;

    const html = this.wrapTenantTemplate(content, details);
    await this.mailService.sendMail(
      details.clientEmail,
      `Reminder: Session with ${details.therapistName} (${timeLabel})`,
      html,
    );
  }

  /**
   * Send Pre-Session Intake & PHQ-9 Questionnaire Request Email
   */
  async sendIntakeRequest(
    clientEmail: string,
    clientName: string,
    formTitle: string,
    formUrl: string,
    brand: { practiceName: string; primaryColor?: string; logoUrl?: string },
  ): Promise<void> {
    const content = `
      <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#0F172A;">Pre-Session Questionnaire</h2>
      <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.6;">
        Hello <strong>${clientName}</strong>, please complete your pre-session assessment (<strong>${formTitle}</strong>) before your upcoming consultation.
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="${formUrl}" style="display:inline-block;padding:14px 28px;border-radius:14px;background-color:${brand.primaryColor || '#0F3A53'};color:#FFFFFF;font-weight:700;font-size:14px;text-decoration:none;">
          Complete Questionnaire
        </a>
      </div>
    `;

    const html = this.wrapTenantTemplate(content, brand);
    await this.mailService.sendMail(
      clientEmail,
      `Action Required: Complete ${formTitle} for ${brand.practiceName}`,
      html,
    );
  }
}
