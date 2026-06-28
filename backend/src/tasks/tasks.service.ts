import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskStatus } from './task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
    private projectsService: ProjectsService,
  ) {}

  private validateObjectId(id: string, fieldName: string = 'ID') {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${fieldName} format`);
    }
    return new Types.ObjectId(id);
  }

  // Helper to add user as project member if assigned
  private async addAssignedUserAsMember(projectId: string, userId: string) {
    if (!userId) return;
    await this.projectsService.addMemberByUserId(projectId, userId);
  }

  async create(projectId: string, dto: CreateTaskDto, userId: string) {
    // Validate projectId
    this.validateObjectId(projectId, 'project ID');

    // Check if user has access to this project (owner or member)
    const project = await this.projectsService.findOne(userId, projectId);
    if (!project) {
      throw new ForbiddenException('You do not have access to this project');
    }

    // Only the owner can create tasks

    if (project.owner._id.toString() !== userId) {
      throw new ForbiddenException('Only the project owner can create tasks');
    }

    // If assignedTo is provided, add that user as a member of the project
    if (dto.assignedTo) {
      this.validateObjectId(dto.assignedTo, 'assigned user ID');
      await this.addAssignedUserAsMember(projectId, dto.assignedTo);
    }

    const task = new this.taskModel({
      ...dto,
      projectId: new Types.ObjectId(projectId),
      status: dto.status || TaskStatus.TODO,
      assignedTo: dto.assignedTo
        ? new Types.ObjectId(dto.assignedTo)
        : undefined,
    });

    return task.save();
  }

  async findAllByProject(projectId: string, userId: string) {
    this.validateObjectId(projectId, 'project ID');

    // Get project and check access (throws if not allowed)
    const project = await this.projectsService.findOne(userId, projectId);

    // Determine if user is the owner
    const isOwner = project.owner._id.toString() === userId;

    // Build the query
    const query: any = { projectId: new Types.ObjectId(projectId) };

    if (!isOwner) {
      // If not owner, only show tasks assigned to this user
      query.assignedTo = new Types.ObjectId(userId);
    }

    return this.taskModel
      .find(query)
      .populate('assignedTo', 'name email')
      .exec();
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    this.validateObjectId(taskId, 'task ID');
    console.log('taskdto', dto);
    const task = await this.taskModel.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');

    // Check if user has access to the project
    await this.projectsService.findOne(userId, task.projectId.toString());

    // If assignedTo is being updated, add that user as a member
    if (dto.assignedTo) {
      this.validateObjectId(dto.assignedTo, 'assigned user ID');
      await this.addAssignedUserAsMember(
        task.projectId.toString(),
        dto.assignedTo,
      );
    }

    Object.assign(task, dto);
    if (dto.assignedTo) {
      task.assignedTo = new Types.ObjectId(dto.assignedTo);
    }
    return task.save();
  }

  async delete(userId: string, taskId: string) {
    this.validateObjectId(taskId, 'task ID');

    const task = await this.taskModel.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');

    // Check if user has access to the project (owner or member)
    let projectExist = await this.projectsService.findOne(
      userId,
      task.projectId.toString(),
    );
    console.log('projectExist', projectExist);
    if (projectExist.owner._id.toString() != userId) {
      throw new ForbiddenException('Only Admin can delete a task');
    }
    const result = await this.taskModel.deleteOne({ _id: taskId });
    if (result.deletedCount === 0)
      throw new NotFoundException('Task not found');
    return { message: 'Task deleted successfully' };
  }

  // Get tasks assigned to a specific user
  async findAssignedToUser(userId: string) {
    this.validateObjectId(userId, 'user ID');
    return this.taskModel
      .find({ assignedTo: new Types.ObjectId(userId) })
      .populate('projectId', 'name')
      .exec();
  }
}
