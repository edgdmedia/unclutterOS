import { Injectable } from '@nestjs/common';
import {
  ChannelKey,
  ChannelRecipient,
  ChannelPayload,
  DeliveryResult,
  NotificationChannel,
} from './notification.channel';

const TERMII_SEND_URL = 'https://api.ng.termii.com/api/sms/send';

/**
 * SMS channel. Wired only when SMS_* env vars are set ("SMS when wired").
 * Ships with a Termii integration (SMS_PROVIDER=termii, the default); adding a
 * provider means handling a new case in `send` here — the rest of the system
 * is unchanged. Not wired => skipped by the hub, logged as SKIPPED.
 */
@Injectable()
export class SmsChannel implements NotificationChannel {
  readonly key: ChannelKey = 'sms';

  isWired(): boolean {
    return !!(process.env.SMS_API_KEY && process.env.SMS_SENDER_ID);
  }

  async send(recipient: ChannelRecipient, payload: ChannelPayload): Promise<DeliveryResult> {
    if (!recipient.phone) return { success: false, error: 'Recipient has no phone number' };
    if (!this.isWired()) return { success: false, error: 'SMS not wired (SMS_API_KEY missing)' };

    const provider = (process.env.SMS_PROVIDER || 'termii').toLowerCase();
    const body = `${payload.title}\n${payload.message}`;

    try {
      if (provider === 'termii') {
        const resp = await fetch(TERMII_SEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: process.env.SMS_API_KEY,
            to: recipient.phone,
            from: process.env.SMS_SENDER_ID,
            sms: body,
            type: 'plain',
            channel: 'generic',
          }),
        });
        const json: any = await resp.json().catch(() => null);
        if (resp.ok && json?.message_id) return { success: true, providerId: json.message_id };
        return { success: false, error: `Termii: ${json?.message || resp.statusText}` };
      }
      return { success: false, error: `SMS provider "${provider}" is not implemented yet` };
    } catch (e: any) {
      return { success: false, error: e?.message ?? 'SMS delivery failed' };
    }
  }
}
