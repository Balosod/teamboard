export interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => Promise<void>;
  project: { _id: string; name: string; description?: string } | null;
  isSaving: boolean;
}
