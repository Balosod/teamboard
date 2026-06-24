// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import api from "../services/api";
// import toast from "react-hot-toast";
// import { Task } from "../types/task";

// export default function ProjectDetail() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [isAdding, setIsAdding] = useState(false);
//   const [updatingId, setUpdatingId] = useState<string | null>(null);
//   const [deletingId, setDeletingId] = useState<string | null>(null);

//   const fetchTasks = async () => {
//     try {
//       const res = await api.get(`/tasks/project/${id}`);
//       setTasks(res.data);
//     } catch (err) {
//       toast.error("Failed to load tasks");
//     }
//   };

//   useEffect(() => {
//     if (id) fetchTasks();
//   }, [id]);

//   const addTask = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!title.trim()) return toast.error("Task title is required");

//     setIsAdding(true);
//     try {
//       await api.post(`/tasks/project/${id}`, { title, description });
//       toast.success("Task added! ✅");
//       setTitle("");
//       setDescription("");
//       fetchTasks();
//     } catch (err) {
//       toast.error("Failed to add task");
//     } finally {
//       setIsAdding(false);
//     }
//   };

//   const updateStatus = async (taskId: string, newStatus: string) => {
//     setUpdatingId(taskId);
//     try {
//       await api.put(`/tasks/${taskId}`, { status: newStatus });
//       toast.success("Status updated");
//       fetchTasks();
//     } catch (err) {
//       toast.error("Failed to update status");
//     } finally {
//       setUpdatingId(null);
//     }
//   };

//   const deleteTask = async (taskId: string) => {
//     if (!confirm("Delete this task?")) return;

//     setDeletingId(taskId);
//     try {
//       await api.delete(`/tasks/${taskId}`);
//       toast.success("Task deleted");
//       fetchTasks();
//     } catch (err) {
//       toast.error("Failed to delete task");
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const columns = [
//     { status: "todo", label: "📝 To Do", color: "bg-gray-100" },
//     { status: "in-progress", label: "🔄 In Progress", color: "bg-blue-50" },
//     { status: "done", label: "✅ Done", color: "bg-green-50" },
//   ];

//   return (
//     <div>
//       <button
//         onClick={() => navigate("/")}
//         className="text-indigo-600 hover:underline mb-4 inline-block"
//       >
//         ← Back to Projects
//       </button>
//       <h1 className="text-2xl font-bold text-gray-800 mb-6">📋 Task Board</h1>

//       {/* Add Task Form */}
//       <form
//         onSubmit={addTask}
//         className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-wrap gap-3"
//       >
//         <input
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           placeholder="Task Title *"
//           className="flex-1 min-w-[150px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500"
//           required
//         />
//         <input
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           placeholder="Description"
//           className="flex-1 min-w-[150px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500"
//         />
//         <button
//           type="submit"
//           className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
//         >
//           Add Task
//         </button>
//       </form>

//       {/* Kanban Columns */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {columns.map((col) => (
//           <div
//             key={col.status}
//             className={`${col.color} p-4 rounded-xl min-h-[300px] border border-gray-200`}
//           >
//             <h3 className="font-semibold text-gray-700 mb-4">{col.label}</h3>
//             <div className="space-y-3">
//               {tasks
//                 .filter((t) => t.status === col.status)
//                 .map((task) => (
//                   <div
//                     key={task._id}
//                     className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition"
//                   >
//                     <h4 className="font-medium text-gray-800">{task.title}</h4>
//                     <p className="text-sm text-gray-500 mb-3">
//                       {task.description || "No description"}
//                     </p>
//                     <div className="flex justify-between items-center">
//                       <select
//                         disabled={updatingId === task._id}
//                         value={task.status}
//                         onChange={(e) => updateStatus(task._id, e.target.value)}
//                         className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:ring-indigo-500"
//                       >
//                         <option value="todo">To Do</option>
//                         <option value="in-progress">In Progress</option>
//                         <option value="done">Done</option>
//                       </select>
//                       <button
//                         disabled={deletingId === task._id}
//                         onClick={() => deleteTask(task._id)}
//                         className="text-red-400 hover:text-red-600 text-sm"
//                       >
//                         ✕
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               {tasks.filter((t) => t.status === col.status).length === 0 && (
//                 <p className="text-center text-gray-400 text-sm py-6 italic">
//                   Empty
//                 </p>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import type { Task } from "../types/task";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks/project/${id}`);
      setTasks(res.data);
    } catch (err) {
      toast.error("Failed to load tasks");
    }
  };

  useEffect(() => {
    if (id) fetchTasks();
  }, [id]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Task title is required");

    setIsAdding(true);
    try {
      await api.post(`/tasks/project/${id}`, { title, description });
      toast.success("Task added! ✅");
      setTitle("");
      setDescription("");
      fetchTasks();
    } catch (err) {
      toast.error("Failed to add task");
    } finally {
      setIsAdding(false);
    }
  };

  const updateStatus = async (taskId: string, newStatus: string) => {
    setUpdatingId(taskId);
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success("Status updated");
      fetchTasks();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Open delete confirmation modal
  const confirmDelete = (taskId: string) => {
    setTaskToDelete(taskId);
    setShowDeleteModal(true);
  };

  // Close modal without deleting
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
  };

  // Execute delete
  const handleDelete = async () => {
    if (!taskToDelete) return;

    setDeletingId(taskToDelete);
    try {
      await api.delete(`/tasks/${taskToDelete}`);
      toast.success("Task deleted");
      fetchTasks();
      closeDeleteModal();
    } catch (err) {
      toast.error("Failed to delete task");
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    { status: "todo", label: "📝 To Do", color: "bg-gray-100" },
    { status: "in-progress", label: "🔄 In Progress", color: "bg-blue-50" },
    { status: "done", label: "✅ Done", color: "bg-green-50" },
  ];

  return (
    <div>
      <button
        onClick={() => navigate("/")}
        className="text-indigo-600 hover:underline mb-4 inline-block"
      >
        ← Back to Projects
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📋 Task Board</h1>

      {/* Add Task Form */}
      <form
        onSubmit={addTask}
        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-wrap gap-3"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task Title *"
          className="flex-1 min-w-[150px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          required
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="flex-1 min-w-[150px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
        <button
          type="submit"
          disabled={isAdding}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-6 py-2 rounded-lg transition flex items-center justify-center"
        >
          {isAdding ? (
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            "Add Task"
          )}
        </button>
      </form>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div
            key={col.status}
            className={`${col.color} p-4 rounded-xl min-h-[300px] border border-gray-200`}
          >
            <h3 className="font-semibold text-gray-700 mb-4">{col.label}</h3>
            <div className="space-y-3">
              {tasks
                .filter((t) => t.status === col.status)
                .map((task) => (
                  <div
                    key={task._id}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition"
                  >
                    <h4 className="font-medium text-gray-800">{task.title}</h4>
                    <p className="text-sm text-gray-500 mb-3">
                      {task.description || "No description"}
                    </p>
                    <div className="flex justify-between items-center">
                      <select
                        disabled={updatingId === task._id}
                        value={task.status}
                        onChange={(e) => updateStatus(task._id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:ring-indigo-500"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                      <button
                        disabled={deletingId === task._id}
                        onClick={() => confirmDelete(task._id)}
                        className="text-red-400 hover:text-red-600 text-sm disabled:opacity-50"
                      >
                        {deletingId === task._id ? (
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                        ) : (
                          "✕"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              {tasks.filter((t) => t.status === col.status).length === 0 && (
                <p className="text-center text-gray-400 text-sm py-6 italic">
                  Empty
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        isDeleting={deletingId !== null}
      />
    </div>
  );
}
