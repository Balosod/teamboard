import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { InvitationsService } from '../invitations/invitations.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private invitationsService: InvitationsService,
  ) {}

  async signup(email: string, password: string, name: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name,
    });

    // After successful signup, check for pending invitations
    // const pendingInvitations =
    //   await this.invitationsService.getPendingInvitations(email);
    // for (const inv of pendingInvitations) {
    //   // Accept the invitation for this user
    //   await this.invitationsService.acceptInvitation(
    //     inv.token,
    //     user._id.toString(),
    //   );
    // }

    return this.generateToken(user);
  }

  async signin(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const payload = { sub: user._id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      id: user._id,
      name: user.name,
    };
  }
}
