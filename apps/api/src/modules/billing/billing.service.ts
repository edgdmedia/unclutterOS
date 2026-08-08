import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async getBankSubaccount(tenantId: bigint) {
    const subaccount = await this.prisma.bankSubaccount.findUnique({
      where: { tenantId },
    });

    if (!subaccount) return null;

    return {
      id: subaccount.id.toString(),
      bankCode: subaccount.bankCode,
      bankName: subaccount.bankName,
      accountNumber: subaccount.accountNumber,
      accountName: subaccount.accountName,
      paystackCode: subaccount.paystackCode,
      isVerified: subaccount.isVerified,
    };
  }

  async getSubscription(tenantId: bigint) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Practice tenant not found');

    const tier = (tenant.subscriptionTier || 'STARTER').toUpperCase();
    const amounts: Record<string, string> = {
      STARTER: '₦0',
      PRO: '₦25,000',
      CLINIC: '₦75,000',
    };

    return {
      subscriptionTier: tier,
      nextChargeAmount: amounts[tier] || '₦0',
      nextBillingDate: '01 Sep 2026',
    };
  }

  async saveBankSubaccount(tenantId: bigint, dto: {
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
  }) {
    if (!dto.accountNumber || !dto.bankCode || !dto.accountName) {
      throw new BadRequestException('Complete bank account details are required');
    }

    const paystackCode = `ACCT_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const subaccount = await this.prisma.bankSubaccount.upsert({
      where: { tenantId },
      create: {
        tenantId,
        bankCode: dto.bankCode,
        bankName: dto.bankName,
        accountNumber: dto.accountNumber.trim(),
        accountName: dto.accountName.trim(),
        paystackCode,
        isVerified: true,
      },
      update: {
        bankCode: dto.bankCode,
        bankName: dto.bankName,
        accountNumber: dto.accountNumber.trim(),
        accountName: dto.accountName.trim(),
        paystackCode,
        isVerified: true,
      },
    });

    return {
      id: subaccount.id.toString(),
      bankName: subaccount.bankName,
      accountNumber: subaccount.accountNumber,
      accountName: subaccount.accountName,
      paystackCode: subaccount.paystackCode,
      isVerified: subaccount.isVerified,
    };
  }

  async updateSubscriptionPlan(tenantId: bigint, plan: 'STARTER' | 'PRO' | 'CLINIC') {
    const validPlans = ['STARTER', 'PRO', 'CLINIC'];
    if (!validPlans.includes(plan)) {
      throw new BadRequestException('Invalid subscription plan tier');
    }

    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { subscriptionTier: plan },
    });

    return {
      tenantId: tenant.id.toString(),
      subscriptionTier: tenant.subscriptionTier,
    };
  }

  async calculateSplitPayout(tenantId: bigint, amountKobo: bigint) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { bankSubaccount: true },
    });

    const tier = (tenant?.subscriptionTier || 'STARTER').toUpperCase();
    
    // Fee Structure: STARTER = 5% platform fee; PRO & CLINIC = 0% platform fee
    const platformPercentage = tier === 'STARTER' ? 0.05 : 0;
    const platformFeeKobo = BigInt(Math.round(Number(amountKobo) * platformPercentage));
    const therapistPayoutKobo = amountKobo - platformFeeKobo;

    return {
      amountKobo: amountKobo.toString(),
      platformFeeKobo: platformFeeKobo.toString(),
      therapistPayoutKobo: therapistPayoutKobo.toString(),
      paystackSubaccountCode: tenant?.bankSubaccount?.paystackCode || null,
      tier,
    };
  }
}
