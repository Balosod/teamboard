import { User } from "./user";
export interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    title: string,
    description: string,
    assignedTo: string,
  ) => Promise<void>;
  task: {
    _id: string;
    title: string;
    description?: string;
    assignedTo?: string | User;
  } | null;
  isSaving: boolean;
  members?: User[]; // Array of project members (including owner)
  isOwner: boolean;
}
