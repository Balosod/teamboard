import { User } from "./user";

export interface IProject {
  id: string;
  name: string;
  description?: string;
  owner: string | User;
  createdAt: Date;
  updatedAt: Date;
}
