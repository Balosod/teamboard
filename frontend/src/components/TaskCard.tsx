// Draggable Task Card
import { format } from "date-fns";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function TaskCard({
  task,
  onDelete,
  onUpdate,
  onEdit,
  isDeleting,
  isUpdating,
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (date: string) => {
    if (!date) return "";
    return format(new Date(date), "MMM d, yyyy h:mm a");
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-gray-800 flex-1">{task.title}</h4>
        {/* Edit Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onEdit(task);
          }}
          onPointerDown={(e) => e.stopPropagation()} // <-- PREVENT DRAG
          className="text-gray-400 hover:text-indigo-600 text-sm ml-2 p-1 rounded hover:bg-gray-100 transition"
          title="Edit task"
        >
          ✎
        </button>
      </div>

      {task.description && (
        <p className="text-sm text-gray-500 mb-2">{task.description}</p>
      )}
      <div className="text-xs text-gray-500 mb-2">
        {task.assignedTo ? (
          typeof task.assignedTo === "object" ? (
            <span>
              👤 Assigned to: {task.assignedTo.name} ({task.assignedTo.email})
            </span>
          ) : (
            <span>👤 Assigned</span>
          )
        ) : (
          <span className="text-gray-400">Unassigned</span>
        )}
      </div>
      {/* Dates */}
      <div className="text-xs text-gray-400 mb-3 space-y-0.5">
        {task.createdAt && <div>Created: {formatDate(task.createdAt)}</div>}
        {task.updatedAt && task.updatedAt !== task.createdAt && (
          <div>Updated: {formatDate(task.updatedAt)}</div>
        )}
      </div>

      <div className="flex justify-between items-center">
        {/* Status Select */}
        <select
          disabled={isUpdating === task._id}
          value={task.status}
          onChange={(e) => {
            e.stopPropagation();
            onUpdate(task._id, e.target.value);
          }}
          onPointerDown={(e) => e.stopPropagation()} // <-- PREVENT DRAG
          className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:ring-indigo-500"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        {/* Delete Button */}
        <button
          disabled={isDeleting === task._id}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onDelete(task._id);
          }}
          onPointerDown={(e) => e.stopPropagation()} // <-- PREVENT DRAG
          className="text-red-400 hover:text-red-600 text-sm disabled:opacity-50 p-1 rounded hover:bg-red-50 transition"
        >
          {isDeleting === task._id ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
          ) : (
            "✕"
          )}
        </button>
      </div>
    </div>
  );
}
