import { Controller, Get, Post, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { authenticatedProfileId, authenticatedTenantId } from '../../common/authenticated-tenant';

@ApiTags('Notes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@Controller('v1/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Save or update SOAP session clinical notes (Therapist)' })
  saveNote(@Req() req: any, @Body() dto: any) {
    return this.notesService.saveSOAPNote(
      authenticatedTenantId(req),
      authenticatedProfileId(req),
      dto,
    );
  }

  @Get('client/:clientProfileId')
  @ApiOperation({ summary: 'Get client historical clinical case notes' })
  getClientNotes(@Req() req: any, @Param('clientProfileId') clientProfileId: string) {
    return this.notesService.getClientNotes(
      authenticatedTenantId(req),
      BigInt(clientProfileId),
    );
  }

  @Patch(':id/lock')
  @ApiOperation({ summary: 'Lock clinical note from further editing' })
  lockNote(@Req() req: any, @Param('id') noteId: string) {
    return this.notesService.lockNote(
      authenticatedTenantId(req),
      BigInt(noteId),
    );
  }
}
