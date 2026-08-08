import { ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Injectable()
export class PlatformAdminGuard extends JwtAuthGuard {
  handleRequest(err: any, user: any) {
    const authenticated = super.handleRequest(err, user);
    if (authenticated?.type !== 'platform_admin') {
      throw new ForbiddenException('Platform admin access required');
    }
    return authenticated;
  }
}
