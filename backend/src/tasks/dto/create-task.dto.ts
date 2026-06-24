import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TaskStatus } from '../task.schema';

export class CreateTaskDto {
  @IsString() title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(TaskStatus) status?: TaskStatus;
}
