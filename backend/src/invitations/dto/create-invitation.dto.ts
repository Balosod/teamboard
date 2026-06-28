import { IsEmail, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateInvitationDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsMongoId()
  @IsNotEmpty()
  projectId: string;
}
