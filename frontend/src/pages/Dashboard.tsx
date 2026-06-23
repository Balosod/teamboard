import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

interface Project {
  _id: string;
  name: string;
  description: string;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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

  const deleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    setDeletingId(id);
    try {
      await api.delete(`/projects/${id}`);
      toast.success("Project deleted");
      fetchProjects();
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button type="submit" disabled={isCreating} className="...">
            {isCreating ? "Creating..." : "+ Create Project"}
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
                <button onClick={() => deleteProject(p._id)} className="...">
                  {deletingId === p._id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
