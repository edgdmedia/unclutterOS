import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async saveSOAPNote(tenantId: bigint, authorProfileId: bigint, dto: {
    bookingId?: string;
    clientProfileId: string;
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    diagnosisCode?: string;
  }) {
    const clientProfileId = BigInt(dto.clientProfileId);
    const bookingId = dto.bookingId ? BigInt(dto.bookingId) : null;

    // Check if an existing unlocked note exists for this booking
    let note = bookingId
      ? await this.prisma.clinicalNote.findFirst({
          where: { tenantId, bookingId },
        })
      : null;

    if (note && note.isLocked) {
      throw new BadRequestException('This clinical note has been locked and cannot be edited');
    }

    if (note) {
      note = await this.prisma.clinicalNote.update({
        where: { id: note.id },
        data: {
          subjective: dto.subjective,
          objective: dto.objective,
          assessment: dto.assessment,
          plan: dto.plan,
          diagnosisCode: dto.diagnosisCode,
        },
      });
    } else {
      note = await this.prisma.clinicalNote.create({
        data: {
          tenantId,
          bookingId,
          clientProfileId,
          authorProfileId,
          subjective: dto.subjective,
          objective: dto.objective,
          assessment: dto.assessment,
          plan: dto.plan,
          diagnosisCode: dto.diagnosisCode,
        },
      });
    }

    return {
      id: note.id.toString(),
      subjective: note.subjective,
      objective: note.objective,
      assessment: note.assessment,
      plan: note.plan,
      isLocked: note.isLocked,
      updatedAt: note.updatedAt.toISOString(),
    };
  }

  async getClientNotes(tenantId: bigint, clientProfileId: bigint) {
    const notes = await this.prisma.clinicalNote.findMany({
      where: { tenantId, clientProfileId },
      orderBy: { createdAt: 'desc' },
    });

    return notes.map((n) => ({
      id: n.id.toString(),
      bookingId: n.bookingId?.toString(),
      subjective: n.subjective,
      objective: n.objective,
      assessment: n.assessment,
      plan: n.plan,
      diagnosisCode: n.diagnosisCode,
      isLocked: n.isLocked,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    }));
  }

  async lockNote(tenantId: bigint, noteId: bigint) {
    const note = await this.prisma.clinicalNote.update({
      where: { id: noteId },
      data: { isLocked: true },
    });

    return { id: note.id.toString(), isLocked: note.isLocked };
  }
}
