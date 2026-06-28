import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Clickable Logo - Redirects to Dashboard */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
              title="Go to Dashboard"
            >
              <span className="text-2xl font-bold text-indigo-600">
                📋 TeamBoard
              </span>
              <span className="text-sm text-gray-400 hidden sm:inline">
                | Work Management
              </span>
            </button>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                👋 {user?.name || "User"}
              </span>
              <button
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-indigo-600 text-sm font-medium px-3 py-1 rounded-md hover:bg-gray-100"
              >
                Projects
              </button>
              <button
                onClick={logout}
                className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-md text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
