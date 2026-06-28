import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { Invitation, InvitationStatus } from './invitation.schema';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';
import { generateInviteToken } from '../common/utils/token.util';
import { EmailService } from '../common/services/email.service';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectModel(Invitation.name) private invitationModel: Model<Invitation>,
    private usersService: UsersService,
    private projectsService: ProjectsService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  // Create an invitation
  async createInvitation(
    projectId: string,
    email: string,
    invitedByUserId: string,
  ) {
    // Check if project exists and user is owner
    const project = await this.projectsService.findOne(
      invitedByUserId,
      projectId,
    );

    if (!project) throw new NotFoundException('Project not found');

    // Only the owner can invite members
    if (project.owner._id.toString() !== invitedByUserId) {
      throw new ForbiddenException('Only the project owner can invite members');
    }

    // Check if user is already a member
    const user = await this.usersService.findByEmail(email);
    if (user) {
      // If user exists, check if already member
      const isMember = project.members.some(
        (m: any) => m._id.toString() === user._id.toString(),
      );

      if (isMember || project.owner.toString() === user._id.toString()) {
        throw new BadRequestException('User is already a member');
      }
    }

    // Check for existing pending invitation for this email and project
    const existing = await this.invitationModel.findOne({
      email,
      projectId,
      status: InvitationStatus.PENDING,
    });
    if (existing) {
      throw new BadRequestException('Invitation already sent to this email');
    }

    // Generate token
    const token = generateInviteToken();

    // Create invitation
    const invitation = new this.invitationModel({
      email,
      projectId: new Types.ObjectId(projectId),
      invitedBy: new Types.ObjectId(invitedByUserId),
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await invitation.save();
    // Get inviter name
    const inviter = await this.usersService.findById(invitedByUserId);
    const inviterName = inviter?.name || 'A user';

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const inviteLink = `${frontendUrl}/invite/accept?token=${token}&email=${email}`;
    console.log('inviteLink', inviteLink);
    // Simulate sending email (in production, use nodemailer/SendGrid)
    // console.log(`📧 Invitation sent to ${email}`);
    // console.log(
    //   `🔗 Accept link: http://localhost:5173/invite/accept?token=${token}&email=${email}`,
    // );

    // Send email via Brevo
    try {
      await this.emailService.sendInvitationEmail(
        email,
        email.split('@')[0] || 'there', // Use part before @ as name
        inviterName,
        project.name,
        inviteLink,
        7, // days to expire
      );
    } catch (error) {
      // Even if email fails, the invitation is saved
      console.error('Email sending failed but invitation was created:', error);
    }

    return {
      message: 'Invitation sent successfully',
      inviteLink,
    };
  }

  // Accept an invitation
  async acceptInvitation(token: string, userId: string) {
    const invitation = await this.invitationModel.findOne({
      token,
      status: InvitationStatus.PENDING,
    });
    if (!invitation) {
      throw new NotFoundException('Invalid or expired invitation');
    }

    // Check if expired
    if (invitation.expiresAt < new Date()) {
      invitation.status = InvitationStatus.EXPIRED;
      await invitation.save();
      throw new BadRequestException('Invitation has expired');
    }

    // Check if user exists
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Verify email matches
    if (user.email !== invitation.email) {
      throw new ForbiddenException('This invitation is not for you');
    }

    // Add user to project members
    const project = await this.projectsService.addMemberByUserId(
      invitation.projectId.toString(),
      userId,
    );
    console.log('project', project);
    // Mark invitation as accepted
    invitation.status = InvitationStatus.ACCEPTED;
    await invitation.save();

    return {
      message: 'Invitation accepted successfully',
      projectId: invitation.projectId,
    };
  }

  // Get invitations for a user (pending)
  async getPendingInvitations(email: string) {
    return this.invitationModel
      .find({
        email,
        status: InvitationStatus.PENDING,
      })
      .populate('projectId', 'name')
      .exec();
  }
}
