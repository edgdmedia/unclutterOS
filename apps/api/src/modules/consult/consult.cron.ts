import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ConsultCron {
  private readonly logger = new Logger(ConsultCron.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleBookingExpiry() {
    this.logger.log('Running BookingExpiryCron job...');
    
    // Find all bookings that are PENDING_PAYMENT and older than 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const expiredBookings = await this.prisma.consultBooking.findMany({
      where: {
        status: 'PENDING_PAYMENT',
        createdAt: { lt: thirtyMinutesAgo },
      },
      include: {
        availability: true,
      },
    });

    if (expiredBookings.length === 0) {
      this.logger.log('No expired bookings found.');
      return;
    }

    this.logger.log(`Found ${expiredBookings.length} expired bookings. Cancelling...`);

    let cancelledCount = 0;
    
    for (const booking of expiredBookings) {
      try {
        await this.prisma.$transaction(async (tx) => {
          // Cancel the booking
          await tx.consultBooking.update({
            where: { id: booking.id },
            data: { status: 'CANCELLED' },
          });

          // Free up the slot
          if (booking.availability) {
            await tx.consultAvailability.update({
              where: { id: booking.availability.id },
              data: { isActive: true },
            });
          }
        });
        cancelledCount++;
      } catch (error) {
        this.logger.error(`Failed to expire booking ${booking.id}:`, error);
      }
    }

    this.logger.log(`Successfully cancelled ${cancelledCount} expired bookings.`);
  }
}
