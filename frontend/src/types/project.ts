import { User } from "./user";

export interface IProject {
  _id: string;
  name: string;
  description?: string;
  owner: string | User;
  createdAt: Date;
  updatedAt: Date;
}
