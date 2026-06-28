import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@Controller('invitations')
@UseGuards(AuthGuard('jwt'))
export class InvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  @Post()
  createInvitation(@Request() req, @Body() body: CreateInvitationDto) {
    return this.invitationsService.createInvitation(
      body.projectId,
      body.email,
      req.user.userId,
    );
  }

  @Post('accept')
  acceptInvitation(@Request() req, @Body() body: { token: string }) {
    return this.invitationsService.acceptInvitation(
      body.token,
      req.user.userId,
    );
  }

  @Get('pending')
  getPending(@Request() req) {
    return this.invitationsService.getPendingInvitations(req.user.email);
  }
}
