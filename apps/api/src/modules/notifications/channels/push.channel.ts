import { Injectable } from '@nestjs/common';
import * as webpush from 'web-push';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  ChannelKey,
  ChannelRecipient,
  ChannelPayload,
  DeliveryResult,
  NotificationChannel,
} from './notification.channel';

/**
 * Web Push channel. Wired only when VAPID_* env vars are set (and the frontend
 * has registered a service worker + subscription). Subscriptions live in
 * WebPushSubscription; dead subscriptions (404/410) are deactivated.
 */
@Injectable()
export class PushChannel implements NotificationChannel {
  readonly key: ChannelKey = 'push';

  constructor(private readonly prisma: PrismaService) {
    const subject = process.env.VAPID_SUBJECT;
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    if (subject && publicKey && privateKey) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
    }
  }

  isWired(): boolean {
    return !!(
      process.env.VAPID_SUBJECT &&
      process.env.VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY
    );
  }

  getPublicKey(): string | null {
    return process.env.VAPID_PUBLIC_KEY || null;
  }

  async send(recipient: ChannelRecipient, payload: ChannelPayload): Promise<DeliveryResult> {
    if (!this.isWired()) return { success: false, error: 'Push not wired (VAPID keys missing)' };

    const subs = await this.prisma.webPushSubscription.findMany({
      where: { profileId: recipient.profileId, tenantId: recipient.tenantId, isActive: true },
    });
    if (subs.length === 0) return { success: true, skipped: true, error: 'No push subscriptions' };

    let sent = 0;
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({
            title: payload.title,
            message: payload.message,
            link: payload.link ?? null,
            actionLabel: payload.actionLabel ?? null,
            data: payload.data ?? {},
            timestamp: Date.now(),
          }),
        );
        sent += 1;
        await this.prisma.webPushSubscription.update({
          where: { id: sub.id },
          data: { lastSentAt: new Date(), lastError: null },
        });
      } catch (e: any) {
        const code = e?.statusCode;
        if (code === 404 || code === 410) {
          await this.prisma.webPushSubscription.update({
            where: { id: sub.id },
            data: { isActive: false, lastError: 'Subscription no longer valid' },
          });
        } else {
          await this.prisma.webPushSubscription.update({
            where: { id: sub.id },
            data: { lastError: e?.message ?? 'Push delivery failed' },
          });
        }
      }
    }
    return sent > 0 ? { success: true } : { success: false, error: 'Push delivery failed' };
  }
}
