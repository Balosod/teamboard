import { User } from "./user";
export interface ProjectMembersProps {
  projectId: string;
  isOwner: boolean;
  members: User[];
  owner: User;
  onMemberChange: () => void;
}
