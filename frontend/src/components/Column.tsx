// Droppable Column
import type { Task } from "../interface/task";
import { useSortable } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";
export default function Column({
  status,
  label,
  color,
  tasks,
  onDelete,
  onUpdate,
  onEdit,
  isDeleting,
  isUpdating,
}: any) {
  const { setNodeRef } = useSortable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`${color} p-4 rounded-xl min-h-[300px] border border-gray-200`}
    >
      <h3 className="font-semibold text-gray-700 mb-4">{label}</h3>
      <div className="space-y-3">
        {tasks
          .filter((t: Task) => t.status === status)
          .map((task: Task) => (
            <TaskCard
              key={task._id}
              task={task}
              onDelete={onDelete}
              onUpdate={onUpdate}
              onEdit={onEdit}
              isDeleting={isDeleting}
              isUpdating={isUpdating}
            />
          ))}
        {tasks.filter((t: Task) => t.status === status).length === 0 && (
          <p className="text-center text-gray-400 text-sm py-6 italic">Empty</p>
        )}
      </div>
    </div>
  );
}
