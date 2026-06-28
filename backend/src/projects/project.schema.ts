import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ProjectStatus {
  ON_HOLD = 'on-hold',
  IN_PROGRESS = 'in-progress',
  DONE = 'done',
}

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop()
  description!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner!: Types.ObjectId;

  @Prop({ type: String, enum: ProjectStatus, default: ProjectStatus.ON_HOLD })
  status!: ProjectStatus;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  members!: Types.ObjectId[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
