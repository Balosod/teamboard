export interface IProject {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}
