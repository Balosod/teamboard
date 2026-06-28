import { ProjectStatus } from "../types/project";

export const getStatusBadge = (status: ProjectStatus) => {
  const styles = {
    "on-hold": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "in-progress": "bg-blue-100 text-blue-800 border-blue-300",
    done: "bg-green-100 text-green-800 border-green-300",
  };
  const labels = {
    "on-hold": "⏸ On Hold",
    "in-progress": "🔄 In Progress",
    done: "✅ Done",
  };
  return (
    <span
      className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};
