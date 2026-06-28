import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import EditProjectModal from "../components/EditProjectModal";
import { formatDate } from "../utils/formatDate";
import type { ProjectStatus } from "../types/project";
import { getStatusBadge } from "../utils/getStatusBadge";

import { IProject } from "../interface/IProject";

export default function Dashboard() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [createStatus, setCreateStatus] =
    useState<ProjectStatus>("in-progress");
  const [isCreating, setIsCreating] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<IProject | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | "all">(
    "all",
  );
  const ITEMS_PER_PAGE = 3;

  const navigate = useNavigate();

  // ---------- API Calls ----------
  const fetchProjects = async (page: number = 1, status: string = "all") => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", ITEMS_PER_PAGE.toString());
      if (status !== "all") {
        params.append("status", status);
      }

      const res = await api.get(`/projects?${params.toString()}`);
      setProjects(res.data.data);
      setTotalItems(res.data.pagination.totalItems);
      setTotalPages(res.data.pagination.totalPages);
      setCurrentPage(res.data.pagination.currentPage);
    } catch (err) {
      toast.error("Failed to load projects");
    }
  };

  // Load projects on mount and when filter changes
  useEffect(() => {
    fetchProjects(1, filterStatus);
  }, [filterStatus]);

  // ---------- Create Project ----------
  const createProject = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Project name is required");

    setIsCreating(true);
    try {
      await api.post("/projects", {
        name,
        description,
        status: createStatus,
      });
      toast.success("Project created successfully! 🎉");
      setName("");
      setDescription("");
      setCreateStatus("in-progress");
      fetchProjects(currentPage, filterStatus);
    } catch (err) {
      toast.error("Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  // ---------- Update Status ----------
  const updateProjectStatus = async (
    projectId: string,
    newStatus: ProjectStatus,
  ) => {
    setUpdatingStatusId(projectId);
    try {
      await api.put(`/projects/${projectId}`, { status: newStatus });
      toast.success("Status updated");
      fetchProjects(currentPage, filterStatus);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // ---------- Edit Project ----------
  const openEditModal = (project: IProject) => {
    setProjectToEdit(project);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setProjectToEdit(null);
    setIsEditing(false);
  };

  const handleEditSave = async (newName: string, newDescription: string) => {
    if (!projectToEdit) return;

    setIsEditing(true);
    try {
      await api.put(`/projects/${projectToEdit._id}`, {
        name: newName,
        description: newDescription,
      });
      toast.success("Project updated! ✅");
      fetchProjects(currentPage, filterStatus);
      closeEditModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update project");
    } finally {
      setIsEditing(false);
    }
  };

  // ---------- Delete ----------
  const confirmDelete = (id: string) => {
    setProjectToDelete(id);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;

    setDeletingId(projectToDelete);
    try {
      await api.delete(`/projects/${projectToDelete}`);
      toast.success("Project deleted");
      fetchProjects(currentPage, filterStatus);
      closeDeleteModal();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  };

  // ---------- Pagination Handlers ----------
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchProjects(page, filterStatus);
  };

  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📁 Your Projects</h1>
        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-medium">Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as ProjectStatus | "all")
            }
            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="on-hold">⏸ On Hold</option>
            <option value="in-progress">🔄 In Progress</option>
            <option value="done">✅ Done</option>
          </select>
        </div>
      </div>

      {/* Create Project Card with Status Dropdown */}
      <form
        onSubmit={createProject}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project Name *"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            required
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
          <select
            value={createStatus}
            onChange={(e) => setCreateStatus(e.target.value as ProjectStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
          >
            <option value="on-hold">⏸ On Hold</option>
            <option value="in-progress">🔄 In Progress</option>
            <option value="done">✅ Done</option>
          </select>
          <button
            type="submit"
            disabled={isCreating}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2 rounded-lg transition flex items-center justify-center"
          >
            {isCreating ? (
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "+ Create Project"
            )}
          </button>
        </div>
      </form>

      {/* Project Grid */}
      {totalItems === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">
            {projects.length === 0
              ? "No projects yet. Create your first one above!"
              : "No projects match the selected filter."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <div
                key={p._id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition hover:border-indigo-300"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {p.name}
                  </h3>
                  <button
                    onClick={() => openEditModal(p)}
                    className="text-gray-400 hover:text-indigo-600 text-sm ml-2 p-1 rounded hover:bg-gray-100 transition"
                    title="Edit project"
                  >
                    ✎
                  </button>
                </div>

                <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                  {p.description || "No description"}
                </p>

                {/* Status Badge + Dropdown */}
                <div className="flex items-center gap-2 mb-3">
                  {getStatusBadge(p.status)}
                  <select
                    value={p.status}
                    onChange={(e) =>
                      updateProjectStatus(
                        p._id,
                        e.target.value as ProjectStatus,
                      )
                    }
                    disabled={updatingStatusId === p._id}
                    className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:ring-indigo-500"
                  >
                    <option value="on-hold">⏸ On Hold</option>
                    <option value="in-progress">🔄 In Progress</option>
                    <option value="done">✅ Done</option>
                  </select>
                </div>

                {/* Dates */}
                <div className="text-xs text-gray-400 mb-4 space-y-0.5">
                  {p.createdAt && <div>Created: {formatDate(p.createdAt)}</div>}
                  {p.updatedAt && p.updatedAt !== p.createdAt && (
                    <div>Updated: {formatDate(p.updatedAt)}</div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => navigate(`/projects/${p._id}`)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View Tasks →
                  </button>
                  <button
                    onClick={() => confirmDelete(p._id)}
                    disabled={deletingId === p._id}
                    className="text-red-400 hover:text-red-600 text-sm font-medium disabled:opacity-50"
                  >
                    {deletingId === p._id ? (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                    ) : (
                      "Delete"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200">
              {/* <div className="text-sm text-gray-500">
                Showing {projects.length} of {totalItems} projects
              </div> */}
              <div className="text-sm text-gray-500">
                Showing {startItem}-{endItem} of {totalItems} projects
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1.5 border rounded-lg text-sm transition ${
                        page === currentPage
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? All tasks inside this project will also be deleted. This action cannot be undone."
        isDeleting={deletingId !== null}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={showEditModal}
        onClose={closeEditModal}
        onSave={handleEditSave}
        project={projectToEdit}
        isSaving={isEditing}
      />
    </div>
  );
}
