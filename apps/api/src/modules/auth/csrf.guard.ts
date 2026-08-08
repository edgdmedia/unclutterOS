import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { ACCESS_COOKIE, REFRESH_COOKIE, CSRF_COOKIE } from '../../common/auth.config';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    if (SAFE_METHODS.has(req.method)) return true;

    const hasSession = req.cookies?.[ACCESS_COOKIE] || req.cookies?.[REFRESH_COOKIE];
    if (!hasSession) return true;

    const headerToken = req.headers['x-csrf-token'];
    const cookieToken = req.cookies?.[CSRF_COOKIE];

    if (headerToken && cookieToken && headerToken === cookieToken) return true;

    throw new ForbiddenException('Invalid CSRF token');
  }
}
