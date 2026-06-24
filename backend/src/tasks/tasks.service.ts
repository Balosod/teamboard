import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskStatus } from './task.schema';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async create(projectId: string, dto: CreateTaskDto) {
    const task = new this.taskModel({
      ...dto,
      projectId: new Types.ObjectId(projectId),
      status: dto.status || TaskStatus.TODO,
    });
    return task.save();
  }

  async findAllByProject(projectId: string) {
    return this.taskModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .exec();
  }

  async update(userId: string, taskId: string, dto: Partial<CreateTaskDto>) {
    const task = await this.taskModel.findById(taskId);
    if (!task) throw new NotFoundException('Task not found');
    Object.assign(task, dto);
    return task.save();
  }

  async delete(userId: string, taskId: string) {
    const result = await this.taskModel.deleteOne({ _id: taskId });
    if (result.deletedCount === 0)
      throw new NotFoundException('Task not found');
  }
}
