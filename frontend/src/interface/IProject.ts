import { User } from "./user";
export interface IProject {
  _id: string;
  name: string;
  description?: string;
  status: "on-hold" | "in-progress" | "done";
  owner: User;
  members: User[];
  createdAt?: string;
  updatedAt?: string;
}
