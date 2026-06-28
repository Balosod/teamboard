import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import EditTaskModal from "../components/EditTaskModal";
import type { Task } from "../interface/task";
import { IProject } from "../interface/IProject";
import { User } from "../interface/user";
import { useAuth } from "../context/AuthContext";
import ProjectMembers from "../components/ProjectMembers";
import InviteMemberModal from "../components/InviteMemberModal";
import Column from "../components/Column";
// DnD Kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<IProject | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [assignedTo, setAssignedTo] = useState("");
  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      console.log("res", res);
      setProject(res.data);
    } catch (err) {
      toast.error("Failed to load project");
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks/project/${id}`);
      setTasks(res.data);
    } catch (err) {
      toast.error("Failed to load tasks");
    }
  };

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchTasks();
    }
  }, [id]);

  const memberOptions = project
    ? [
        {
          _id: project.owner?._id || "",
          name: project.owner?.name || "Owner",
          email: project.owner?.email || "",
        },
        ...(project.members || [])
          .filter((m) => m._id !== project.owner?._id)
          .map((m) => ({
            _id: m._id,
            name: m.name,
            email: m.email,
          })),
      ]
    : [];

  const memberList = project
    ? [
        {
          _id: project.owner?._id || "",
          name: project.owner?.name || "Owner",
          email: project.owner?.email || "",
        },
        ...(project.members || [])
          .filter((m) => m._id !== project.owner?._id)
          .map((m) => ({
            _id: m._id,
            name: m.name,
            email: m.email,
          })),
      ]
    : [];

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Task title is required");

    setIsAdding(true);
    try {
      await api.post(`/tasks/project/${id}`, {
        title,
        description,
        assignedTo: assignedTo || undefined,
      });
      toast.success("Task added!");
      setTitle("");
      setDescription("");
      fetchTasks();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add task");
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

  // ---------- Edit Task Functions ----------
  const openEditModal = (task: Task) => {
    setTaskToEdit(task);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setTaskToEdit(null);
    setIsEditing(false);
  };
  const handleEditSave = async (
    newTitle: string,
    newDescription: string,
    assignedTo: string,
  ) => {
    if (!taskToEdit) return;

    setIsEditing(true);
    try {
      await api.put(`/tasks/${taskToEdit._id}`, {
        title: newTitle,
        description: newDescription,
        assignedTo: assignedTo || null, // send empty string as undefined
      });
      toast.success("Task updated!");
      fetchTasks();
      closeEditModal();
    } catch (err) {
      toast.error("Failed to update task");
    } finally {
      setIsEditing(false);
    }
  };

  // ---------- Delete Functions ----------
  const confirmDelete = (taskId: string) => {
    setTaskToDelete(taskId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;

    setDeletingId(taskToDelete);
    try {
      await api.delete(`/tasks/${taskToDelete}`);
      toast.success("Task deleted");
      fetchTasks();
      closeDeleteModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete task");
    } finally {
      setDeletingId(null);
    }
  };

  // ---------- Drag and Drop Handlers ----------
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const destinationStatus = over.id as string;

    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    const validStatuses = ["todo", "in-progress", "done"];
    if (
      validStatuses.includes(destinationStatus) &&
      destinationStatus !== task.status
    ) {
      updateStatus(taskId, destinationStatus);
    }
  };

  const columns = [
    { status: "todo", label: "📝 To Do", color: "bg-gray-100" },
    { status: "in-progress", label: "🔄 In Progress", color: "bg-blue-50" },
    { status: "done", label: "✅ Done", color: "bg-green-50" },
  ];

  const activeTask = tasks.find((t) => t._id === activeId);
  const isOwner = project?.owner?._id === user?.id;

  return (
    <div>
      <button
        onClick={() => navigate("/")}
        className="text-indigo-600 hover:underline mb-4 inline-block"
      >
        ← {project?.name}
      </button>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📋 Task Board</h1>

      {/* Add Task Form */}
      {isOwner && (
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
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 outline-none bg-white"
          >
            <option value="">Assign to...</option>
            {memberOptions.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.email})
              </option>
            ))}
          </select>
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
      )}

      {/* Members Section */}
      {project && (
        <div className="mb-8">
          <ProjectMembers
            projectId={id!}
            isOwner={true} // Need to determine if current user is owner
            members={project.members as User[]}
            owner={project.owner as User}
            onMemberChange={fetchProject}
          />
        </div>
      )}

      {isOwner && (
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm mb-4"
        >
          + Invite Member
        </button>
      )}

      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        projectId={id!}
        onInviteSent={() => {
          // Refresh project to show new member after they accept
          fetchProject();
        }}
      />

      {/* Kanban Board with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => (
            <SortableContext
              key={col.status}
              items={tasks
                .filter((t) => t.status === col.status)
                .map((t) => t._id)}
              strategy={verticalListSortingStrategy}
            >
              <Column
                status={col.status}
                label={col.label}
                color={col.color}
                tasks={tasks}
                onDelete={confirmDelete}
                onUpdate={updateStatus}
                onEdit={openEditModal}
                isDeleting={deletingId}
                isUpdating={updatingId}
              />
            </SortableContext>
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-indigo-300 cursor-grabbing">
              <h4 className="font-medium text-gray-800">{activeTask.title}</h4>
              <p className="text-sm text-gray-500">
                {activeTask.description || "No description"}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        isDeleting={deletingId !== null}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={showEditModal}
        onClose={closeEditModal}
        onSave={handleEditSave}
        task={taskToEdit}
        isSaving={isEditing}
        members={memberList}
        isOwner={isOwner}
      />
    </div>
  );
}
