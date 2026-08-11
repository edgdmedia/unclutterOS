import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  ChannelKey,
  ChannelRecipient,
  ChannelPayload,
  DeliveryResult,
  NotificationChannel,
} from './notification.channel';

/**
 * In-app channel: persists a Notification row for the recipient's notification
 * bell. Always available — no external provider to wire.
 */
@Injectable()
export class InAppChannel implements NotificationChannel {
  readonly key: ChannelKey = 'in_app';

  constructor(private readonly prisma: PrismaService) {}

  isWired(): boolean {
    return true;
  }

  async send(recipient: ChannelRecipient, payload: ChannelPayload): Promise<DeliveryResult> {
    const notification = await this.prisma.notification.create({
      data: {
        tenantId: recipient.tenantId,
        profileId: recipient.profileId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        link: payload.link,
        actionLabel: payload.actionLabel,
        data: (payload.data as Prisma.InputJsonValue) ?? undefined,
      },
    });
    return { success: true, providerId: notification.id.toString() };
  }
}
