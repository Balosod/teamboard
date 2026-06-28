import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { ProjectMembersProps } from "../interface/ProjectMembersProps";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

export default function ProjectMembers({
  projectId,
  isOwner,
  members,
  owner,
  onMemberChange,
}: ProjectMembersProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  // Open the confirmation modal
  const openRemoveModal = (memberId: string) => {
    setMemberToRemove(memberId);
    setShowRemoveModal(true);
  };

  // Close the modal without removing
  const closeRemoveModal = () => {
    setShowRemoveModal(false);
    setMemberToRemove(null);
  };

  // Actually remove the member
  const handleRemoveConfirm = async () => {
    if (!memberToRemove) return;

    setRemovingId(memberToRemove);
    try {
      await api.delete(`/projects/${projectId}/members/${memberToRemove}`);
      toast.success("Member removed");
      onMemberChange();
      closeRemoveModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove member");
    } finally {
      setRemovingId(null);
    }
  };
  // Filter out the owner from members list
  const regularMembers = members.filter((member) => member._id !== owner._id);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <h3 className="font-semibold text-gray-700 mb-3">👥 Project Members</h3>

      {/* Owner */}
      <div className="flex items-center justify-between py-1 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800">
            {owner.name}
          </span>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
            Owner
          </span>
        </div>
        <span className="text-xs text-gray-400">{owner.email}</span>
      </div>

      {/* Members */}
      {regularMembers.map((member) => (
        <div
          key={member._id}
          className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0"
        >
          <span className="text-sm text-gray-700">{member.name}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{member.email}</span>
            {isOwner && (
              <button
                onClick={() => openRemoveModal(member._id)}
                disabled={removingId === member._id}
                className="text-red-400 hover:text-red-600 text-xs disabled:opacity-50"
              >
                {removingId === member._id ? "..." : "✕"}
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Remove Member Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showRemoveModal}
        onClose={closeRemoveModal}
        onConfirm={handleRemoveConfirm}
        title="Remove Member"
        message={`Are you sure you want to remove this member from the project? They will lose access to all tasks and project data.`}
        isDeleting={removingId !== null}
      />
    </div>
  );
}
