import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { google } from 'googleapis';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);
  private oauth2Client;

  constructor(private readonly prisma: PrismaService) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NODE_ENV === 'production' 
        ? 'https://api.unclutterdesk.com/v1/calendar/google/callback'
        : 'http://localhost:3001/v1/calendar/google/callback'
    );
  }

  generateAuthUrl(tenantId: string, profileId: string): string {
    const scopes = ['https://www.googleapis.com/auth/calendar.events'];
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent', // Force to get refresh token
      scope: scopes,
      state: `${tenantId}_${profileId}`,
    });
  }

  async handleCallback(code: string, state: string) {
    if (!state) throw new BadRequestException('State missing from callback');
    const [tenantIdStr, profileIdStr] = state.split('_');
    const tenantId = BigInt(tenantIdStr);
    const profileId = BigInt(profileIdStr);

    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      if (tokens.refresh_token) {
        await this.prisma.consultTherapistProfile.update({
          where: { profileId },
          data: { googleRefreshToken: tokens.refresh_token },
        });
        this.logger.log(`Google Calendar connected for therapist ${profileId}`);
      }
    } catch (error) {
      this.logger.error('Failed to get Google OAuth tokens', error);
      throw new BadRequestException('Failed to authenticate with Google');
    }
  }

  private getVideoRoomLink(videoRoomName: string | null): string {
    if (!videoRoomName) return '';
    return videoRoomName.startsWith('http') ? videoRoomName : `https://meet.jit.si/${videoRoomName}`;
  }

  async pushBookingToGoogle(bookingId: bigint) {
    const booking = await this.prisma.consultBooking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        client: true,
        availability: {
          include: {
            therapist: true,
          }
        }
      }
    });

    if (!booking || booking.status !== 'CONFIRMED') return;
    const refreshToken = booking.availability.therapist.googleRefreshToken;
    if (!refreshToken) return;

    try {
      this.oauth2Client.setCredentials({ refresh_token: refreshToken });
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

      const clientName = `${booking.client.firstName || ''} ${booking.client.lastName || ''}`.trim() || booking.client.email;

      const isGoogleMeet = booking.availability.therapist.videoProvider === 'GOOGLE_MEET';
      const videoLink = this.getVideoRoomLink(booking.videoRoomName);

      const res = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: isGoogleMeet ? 1 : 0,
        requestBody: {
          summary: `${booking.service.title} with ${clientName}`,
          description: `Booking ID: ${booking.id}\nClient: ${clientName}\nEmail: ${booking.client.email}\nPhone: ${booking.client.phone || 'N/A'}\n\nVideo Room: ${videoLink}`,
          start: {
            dateTime: booking.availability.startsAt.toISOString(),
          },
          end: {
            dateTime: booking.availability.endsAt.toISOString(),
          },
          attendees: [
            { email: booking.client.email }
          ],
          ...(isGoogleMeet ? {
            conferenceData: {
              createRequest: {
                requestId: `booking-${booking.id}-${Date.now()}`,
                conferenceSolutionKey: { type: 'hangoutsMeet' },
              },
            },
          } : {}),
        },
      });

      this.logger.log(`Pushed booking ${booking.id} to Google Calendar`);

      const hangoutLink = res.data.hangoutLink;
      if (hangoutLink && hangoutLink !== booking.videoRoomName) {
        // Update the booking to use the new Google Meet link
        await this.prisma.consultBooking.update({
          where: { id: bookingId },
          data: { videoRoomName: hangoutLink },
        });

        // Also update the description to reflect the new link
        await calendar.events.patch({
          calendarId: 'primary',
          eventId: res.data.id!,
          requestBody: {
            description: `Booking ID: ${booking.id}\nClient: ${clientName}\nEmail: ${booking.client.email}\nPhone: ${booking.client.phone || 'N/A'}\n\nVideo Room: ${hangoutLink}`,
          }
        });
        
        this.logger.log(`Generated Google Meet link for booking ${booking.id}`);
      }

    } catch (error) {
      this.logger.error(`Failed to push booking ${booking.id} to Google`, error);
    }
  }

  async generateIcal(bookingId: bigint): Promise<string> {
    const booking = await this.prisma.consultBooking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        client: true,
        availability: {
          include: {
            therapist: {
              include: { profile: true }
            },
          }
        }
      }
    });

    if (!booking) throw new NotFoundException('Booking not found');

    const dtStart = this.formatIcalDate(booking.availability.startsAt);
    const dtEnd = this.formatIcalDate(booking.availability.endsAt);
    const dtStamp = this.formatIcalDate(new Date());

    const therapistName = `${booking.availability.therapist.profile.firstName || ''} ${booking.availability.therapist.profile.lastName || ''}`.trim();
    const clientName = `${booking.client.firstName || ''} ${booking.client.lastName || ''}`.trim() || booking.client.email;

    const videoLink = this.getVideoRoomLink(booking.videoRoomName);

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Unclutter OS//Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:booking-${booking.id}@unclutter.os`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${booking.service.title} with ${therapistName}`,
      `DESCRIPTION:Therapy session with ${therapistName}.\\nClient: ${clientName}\\n\\nJoin Video Session: ${videoLink}`,
      `LOCATION:${videoLink}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
  }

  private formatIcalDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
}
