import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MailModule } from '../mail/mail.module';
import { EmailChannel } from './channels/email.channel';
import { InAppChannel } from './channels/in-app.channel';
import { PushChannel } from './channels/push.channel';
import { SmsChannel } from './channels/sms.channel';
import { NOTIFICATION_CHANNELS } from './channels/notification.channel';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

/**
 * The notification system. @Global so any module can inject NotificationService
 * and call notify() / queueReminder(). Tenants plug in through:
 *   - Tenant.notificationChannels  (which channels a tenant has at all)
 *   - Tenant brand tokens          (used for branded email rendering)
 *   - Profile NotificationPreference rows (per-recipient opt-outs)
 * New channels implement NotificationChannel and are registered in the
 * NOTIFICATION_CHANNELS factory below.
 */
@Global()
@Module({
  imports: [MailModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    PrismaService,
    EmailChannel,
    InAppChannel,
    PushChannel,
    SmsChannel,
    {
      provide: NOTIFICATION_CHANNELS,
      inject: [EmailChannel, InAppChannel, PushChannel, SmsChannel],
      useFactory: (email: EmailChannel, inApp: InAppChannel, push: PushChannel, sms: SmsChannel) => [
        inApp,
        email,
        push,
        sms,
      ],
    },
  ],
  exports: [NotificationService, PrismaService, EmailChannel, InAppChannel, PushChannel, SmsChannel],
})
export class NotificationsModule {}
