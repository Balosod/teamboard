import { IsString, IsOptional, IsEnum, IsMongoId } from 'class-validator';
import { TaskStatus } from '../task.schema';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsMongoId()
  assignedTo?: string;
}
