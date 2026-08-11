import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { NotificationHubService } from './notification-hub.service';

@Global()
@Module({
  providers: [MailService, NotificationHubService],
  exports: [MailService, NotificationHubService],
})
export class MailModule {}
