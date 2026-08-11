import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { ACCESS_COOKIE, REFRESH_COOKIE, CSRF_COOKIE } from '../../common/auth.config';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const path = req.path || req.url || '';

    const EXEMPT_PATTERNS = [
      '/auth/',
      '/login',
      '/register',
      '/forgot-password',
      '/reset-password',
      '/verify-email',
      '/invite',
    ];

    // Safe HTTP methods and authentication entry points are exempt from CSRF validation
    if (SAFE_METHODS.has(req.method) || EXEMPT_PATTERNS.some((p) => path.includes(p))) {
      return true;
    }

    if (process.env.DISABLE_CSRF === 'true') {
      return true;
    }

    const hasSession = req.cookies?.[ACCESS_COOKIE] || req.cookies?.[REFRESH_COOKIE];
    if (!hasSession) return true;

    const headerToken = req.headers['x-csrf-token'];
    const cookieToken = req.cookies?.[CSRF_COOKIE];

    if (headerToken && cookieToken && headerToken === cookieToken) return true;

    throw new ForbiddenException('Invalid CSRF token');
  }
}
