import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { authenticatedTenantId } from '../../common/authenticated-tenant';

@ApiTags('Billing')
@Controller('v1/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('bank-subaccount')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get saved Paystack bank subaccount status' })
  getSubaccount(@Req() req: any) {
    return this.billingService.getBankSubaccount(authenticatedTenantId(req));
  }

  @Get('subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get current subscription tier summary' })
  getSubscription(@Req() req: any) {
    return this.billingService.getSubscription(authenticatedTenantId(req));
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get combined billing summary + derived history' })
  getSummary(@Req() req: any) {
    return this.billingService.getBillingSummary(authenticatedTenantId(req));
  }

  @Post('bank-subaccount')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Save bank subaccount details for split payouts' })
  saveSubaccount(@Req() req: any, @Body() dto: any) {
    return this.billingService.saveBankSubaccount(authenticatedTenantId(req), dto);
  }

  @Post('subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Upgrade practice SaaS subscription plan (Admin/Owner)' })
  subscribe(@Req() req: any, @Body() dto: { plan: 'STARTER' | 'PRO' | 'CLINIC' }) {
    return this.billingService.updateSubscriptionPlan(
      authenticatedTenantId(req),
      dto.plan,
    );
  }
}
