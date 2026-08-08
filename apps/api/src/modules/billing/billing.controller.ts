import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantRequest } from '../../common/middleware/tenant.middleware';

@ApiTags('Billing')
@Controller('v1/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('bank-subaccount')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get saved Paystack bank subaccount status' })
  getSubaccount(@Req() req: any) {
    return this.billingService.getBankSubaccount(
      BigInt(req.user.tenantId || req.tenantId),
    );
  }

  @Get('subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current subscription tier summary' })
  getSubscription(@Req() req: any) {
    return this.billingService.getSubscription(
      BigInt(req.user.tenantId || req.tenantId),
    );
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get combined billing summary + derived history' })
  getSummary(@Req() req: any) {
    return this.billingService.getBillingSummary(
      BigInt(req.user.tenantId || req.tenantId),
    );
  }

  @Post('bank-subaccount')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Save bank subaccount details for split payouts' })
  saveSubaccount(@Req() req: any, @Body() dto: any) {
    return this.billingService.saveBankSubaccount(
      BigInt(req.user.tenantId || req.tenantId),
      dto,
    );
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Upgrade practice SaaS subscription plan (Admin/Owner)' })
  subscribe(@Req() req: any, @Body() dto: { plan: 'STARTER' | 'PRO' | 'CLINIC' }) {
    return this.billingService.updateSubscriptionPlan(
      BigInt(req.user.tenantId || req.tenantId),
      dto.plan,
    );
  }
}
