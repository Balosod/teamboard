import { IsString, IsOptional, MinLength, IsEnum } from 'class-validator';
import { ProjectStatus } from '../project.schema';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}
