import { UnauthorizedException } from '@nestjs/common';

export function authenticatedTenantId(req: any): bigint {
  const tenantId = req?.user?.tenantId;
  if (!tenantId) {
    throw new UnauthorizedException('Authenticated tenant context is missing');
  }
  return BigInt(tenantId);
}

export function authenticatedProfileId(req: any): bigint {
  const profileId = req?.user?.profileId;
  if (!profileId) {
    throw new UnauthorizedException('Authenticated profile context is missing');
  }
  return BigInt(profileId);
}
