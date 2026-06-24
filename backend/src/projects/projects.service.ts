import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project } from './project.schema';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  async create(userId: string, dto: CreateProjectDto) {
    const project = new this.projectModel({
      ...dto,
      owner: new Types.ObjectId(userId),
    });
    return project.save();
  }

  async findAll(userId: string) {
    return this.projectModel.find({ owner: new Types.ObjectId(userId) }).exec();
  }

  async findOne(userId: string, id: string) {
    const project = await this.projectModel.findOne({ _id: id, owner: userId });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(userId: string, id: string, dto: Partial<CreateProjectDto>) {
    const project = await this.findOne(userId, id);
    Object.assign(project, dto);
    return project.save();
  }

  async delete(userId: string, id: string) {
    const result = await this.projectModel.deleteOne({
      _id: new Types.ObjectId(id),
      owner: new Types.ObjectId(userId),
    });
    console.log('result', result);
    if (result.deletedCount === 0)
      throw new NotFoundException('Project not found');
  }
}
