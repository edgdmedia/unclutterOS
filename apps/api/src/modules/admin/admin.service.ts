import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [tenants, activeTenants, staffCount, clientCount, bookings, forms, users] =
      await Promise.all([
        this.prisma.tenant.count(),
        this.prisma.tenant.count({ where: { isActive: true } }),
        this.prisma.profile.count({
          where: { role: { in: ['OWNER', 'ADMIN', 'RECEPTIONIST', 'THERAPIST'] } },
        }),
        this.prisma.profile.count({ where: { role: 'CLIENT' } }),
        this.prisma.consultBooking.count(),
        this.prisma.universalForm.count(),
        this.prisma.user.count(),
      ]);

    const bookingRows = await this.prisma.consultBooking.findMany({
      select: { status: true, service: { select: { priceKobo: true } } },
    });
    const revenueKobo = bookingRows.reduce(
      (acc, row) => acc + (row.service?.priceKobo ?? 0n),
      0n,
    );

    return {
      tenants,
      activeTenants,
      staffCount,
      clientCount,
      bookings,
      forms,
      users,
      revenueKobo: Number(revenueKobo),
    };
  }

  async listTenants() {
    const tenants = await this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            profiles: { where: { role: 'CLIENT' } },
            bookings: true,
            services: true,
          },
        },
      },
    });

    const bookingRows = await this.prisma.consultBooking.findMany({
      select: { tenantId: true, service: { select: { priceKobo: true } } },
    });
    const revenueByTenant = new Map<string, number>();
    for (const row of bookingRows) {
      const key = row.tenantId.toString();
      revenueByTenant.set(
        key,
        (revenueByTenant.get(key) ?? 0) + Number(row.service?.priceKobo ?? 0n),
      );
    }

    return tenants.map((t) => ({
      id: t.id.toString(),
      name: t.name,
      slug: t.slug,
      customDomain: t.customDomain,
      category: t.category,
      city: t.city,
      subscriptionTier: t.subscriptionTier,
      isActive: t.isActive,
      primaryColor: t.primaryColor,
      secondaryColor: t.secondaryColor,
      createdAt: t.createdAt.toISOString(),
      clients: t._count.profiles,
      bookings: t._count.bookings,
      services: t._count.services,
      revenueKobo: revenueByTenant.get(t.id.toString()) ?? 0,
    }));
  }

  async getTenantDetail(id: bigint) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            profiles: { where: { role: 'CLIENT' } },
            bookings: true,
            services: true,
          },
        },
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const [staff, recentBookings, recentClients] = await Promise.all([
      this.prisma.profile.findMany({
        where: { tenantId: id, role: { in: ['OWNER', 'ADMIN', 'RECEPTIONIST', 'THERAPIST'] } },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          avatarUrl: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.consultBooking.findMany({
        where: { tenantId: id },
        include: {
          client: { select: { firstName: true, lastName: true, email: true } },
          service: true,
          availability: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.profile.findMany({
        where: { tenantId: id, role: 'CLIENT' },
        select: { id: true, email: true, firstName: true, lastName: true, status: true },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    return {
      id: tenant.id.toString(),
      name: tenant.name,
      slug: tenant.slug,
      customDomain: tenant.customDomain,
      category: tenant.category,
      city: tenant.city,
      address: tenant.address,
      publicEmail: tenant.publicEmail,
      publicPhone: tenant.publicPhone,
      subscriptionTier: tenant.subscriptionTier,
      isActive: tenant.isActive,
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
      createdAt: tenant.createdAt.toISOString(),
      clients: tenant._count.profiles,
      bookings: tenant._count.bookings,
      services: tenant._count.services,
      staff: staff.map((s) => ({
        id: s.id.toString(),
        email: s.email,
        name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.email,
        role: s.role,
        status: s.status,
        avatarUrl: s.avatarUrl,
      })),
      recentClients: recentClients.map((c) => ({
        id: c.id.toString(),
        email: c.email,
        name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email,
        status: c.status,
      })),
      recentBookings: recentBookings.map((b) => ({
        id: b.id.toString(),
        status: b.status,
        client: `${b.client.firstName || ''} ${b.client.lastName || ''}`.trim() || b.client.email,
        service: b.service?.title || 'Session',
        startsAt: b.availability?.startsAt?.toISOString() ?? null,
      })),
    };
  }

  async updateTenant(
    id: bigint,
    dto: { isActive?: boolean; subscriptionTier?: 'STARTER' | 'PRO' | 'CLINIC' },
  ) {
    const tenant = await this.prisma.tenant.update({
      where: { id },
      data: {
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.subscriptionTier ? { subscriptionTier: dto.subscriptionTier } : {}),
      },
    });
    return { id: tenant.id.toString(), isActive: tenant.isActive, subscriptionTier: tenant.subscriptionTier };
  }
}
