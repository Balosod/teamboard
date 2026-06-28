import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post('project/:projectId')
  create(
    @Request() req,
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(projectId, dto, req.user.userId);
  }

  @Get('project/:projectId')
  findAllByProject(@Request() req, @Param('projectId') projectId: string) {
    return this.tasksService.findAllByProject(projectId, req.user.userId);
  }

  @Get('assigned/me')
  findAssignedToMe(@Request() req) {
    return this.tasksService.findAssignedToUser(req.user.userId);
  }

  @Put(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.tasksService.delete(req.user.userId, id);
  }
}
