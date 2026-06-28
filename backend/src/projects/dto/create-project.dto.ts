import { IsString, IsOptional, MinLength, IsEnum } from 'class-validator';
import { ProjectStatus } from '../project.schema';

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

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}
