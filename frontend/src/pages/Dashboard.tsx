import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

import type { IProject } from "../types/project";

export default function Dashboard() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (err) {
      toast.error("Failed to load projects");
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Project name is required");

    setIsCreating(true);
    try {
      await api.post("/projects", { name, description });
      toast.success("Project created successfully! 🎉");
      setName("");
      setDescription("");
      fetchProjects();
    } catch (err) {
      toast.error("Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  // Open the delete confirmation modal
  const confirmDelete = (id: string) => {
    console.log("id", id);
    setProjectToDelete(id);
    setShowDeleteModal(true);
  };

  // Close the modal without deleting
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  // Execute the actual delete
  const handleDelete = async () => {
    if (!projectToDelete) return;

    setDeletingId(projectToDelete);
    try {
      await api.delete(`/projects/${projectToDelete}`);
      toast.success("Project deleted");
      fetchProjects();
      closeDeleteModal();
    } catch (err) {
      toast.error("Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📁 Your Projects</h1>
      </div>

      {/* Create Project Card */}
      <form
        onSubmit={createProject}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      {projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">
            No projects yet. Create your first one above!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p._id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition hover:border-indigo-300"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-1">
                {p.name}
              </h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                {p.description || "No description"}
              </p>
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
    </div>
  );
}
