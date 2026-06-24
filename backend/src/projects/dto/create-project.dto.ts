import { IsString, IsOptional, MinLength } from 'class-validator';

interface IProject {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateProjectDto implements Partial<IProject> {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
