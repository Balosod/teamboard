import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectStatus } from './project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
    private usersService: UsersService,
  ) {}

  private validateObjectId(id: string, fieldName: string = 'ID') {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${fieldName} format`);
    }
    return new Types.ObjectId(id);
  }

  async create(userId: string, dto: CreateProjectDto) {
    const project = new this.projectModel({
      ...dto,
      owner: new Types.ObjectId(userId),
      status: dto.status || ProjectStatus.ON_HOLD,
      members: [new Types.ObjectId(userId)], // Owner is automatically a member
    });
    return project.save();
  }

  async findAllPaginated(
    userId: string,
    page: number,
    limit: number,
    status?: ProjectStatus,
  ) {
    this.validateObjectId(userId, 'user ID');

    // Build the filter
    const filter: any = {
      $or: [
        { owner: new Types.ObjectId(userId) },
        { members: { $in: [new Types.ObjectId(userId)] } },
      ],
    };

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalItems = await this.projectModel.countDocuments(filter);

    const projects = await this.projectModel
      .find(filter)
      .populate('members', 'name email')
      .populate('owner', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }) // newest first
      .exec();

    return {
      data: projects,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        itemsPerPage: limit,
      },
    };
  }

  async findOne(userId: string, id: string) {
    this.validateObjectId(userId, 'user ID');
    this.validateObjectId(id, 'project ID');

    const project = await this.projectModel
      .findOne({
        _id: new Types.ObjectId(id),
      })
      .populate('members', 'name email')
      .populate('owner', 'name email')
      .exec();

    if (!project) throw new NotFoundException('Project not found');

    // Check if user is owner OR member
    const isOwner = project.owner._id.toString() === userId;
    const isMember = project.members.some(
      (m: any) => m._id.toString() === userId,
    );

    if (!isOwner && !isMember) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async update(userId: string, id: string, dto: UpdateProjectDto) {
    this.validateObjectId(userId, 'user ID');
    this.validateObjectId(id, 'project ID');

    // Only owner can update
    const project = await this.projectModel.findOne({
      _id: new Types.ObjectId(id),
      owner: new Types.ObjectId(userId),
    });

    if (!project) {
      throw new ForbiddenException(
        'Only the project owner can update this project',
      );
    }

    const updated = await this.projectModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id) },
        { $set: dto },
        { returnDocument: 'after', runValidators: true },
      )
      .exec();

    return updated;
  }

  async delete(userId: string, id: string) {
    this.validateObjectId(userId, 'user ID');
    this.validateObjectId(id, 'project ID');

    // Only owner can delete
    const result = await this.projectModel.deleteOne({
      _id: new Types.ObjectId(id),
      owner: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new ForbiddenException(
        'Only the project owner can delete this project',
      );
    }
    return { message: 'Project deleted successfully' };
  }

  // Add member by user ID (for task assignment auto-add)
  async addMemberByUserId(projectId: string, userId: string) {
    this.validateObjectId(projectId, 'project ID');
    this.validateObjectId(userId, 'user ID');

    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const project = await this.projectModel.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');

    // Check if already member
    if (project.members.some((m: any) => m._id.toString() === userId)) {
      return project;
    }

    project.members.push(new Types.ObjectId(userId));
    await project.save();
    return project;
  }

  // Add member by email (for invitation flow)
  async addMemberByEmail(projectId: string, email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    return this.addMemberByUserId(projectId, user._id.toString());
  }

  // Get all members of a project (with full user details)
  async getMembers(projectId: string, userId: string) {
    const project = await this.findOne(userId, projectId);
    return {
      owner: project.owner,
      members: project.members,
    };
  }

  // Remove member
  async removeMember(projectId: string, userId: string, memberId: string) {
    this.validateObjectId(projectId, 'project ID');
    this.validateObjectId(userId, 'user ID');
    this.validateObjectId(memberId, 'member ID');

    const project = await this.projectModel.findById(projectId);
    if (!project) throw new NotFoundException('Project not found');

    // Only owner can remove members
    if (project.owner.toString() !== userId) {
      throw new ForbiddenException('Only the project owner can remove members');
    }

    // Cannot remove the owner
    if (project.owner.toString() === memberId) {
      throw new BadRequestException('Cannot remove the project owner');
    }

    // Check if member exists
    if (!project.members.some((m: any) => m.toString() === memberId)) {
      throw new BadRequestException('User is not a member');
    }

    project.members = project.members.filter(
      (m: any) => m.toString() !== memberId,
    );
    await project.save();

    return { message: 'Member removed successfully' };
  }
}
