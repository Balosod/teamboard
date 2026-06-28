import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const userEmail = searchParams.get("email");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // If auth is still loading, wait
    if (authLoading) return;

    if (!token) {
      setLoading(false);
      toast.error("Invalid invitation link");
      return;
    }

    // If user is not logged in, redirect to signup with the token
    if (!user) {
      navigate(`/signup?token=${token}&email=${userEmail}`);
      return;
    }

    // User is logged in, accept the invitation
    const acceptInvite = async () => {
      try {
        await api.post("/invitations/accept", { token });
        setSuccess(true);
        toast.success("Invitation accepted! 🎉");
        setTimeout(() => navigate("/"), 2000);
      } catch (err: any) {
        toast.error(
          err.response?.data?.message || "Failed to accept invitation",
        );
        setLoading(false);
      }
    };

    acceptInvite();
  }, [token, user, authLoading, navigate]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Processing your invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        {success ? (
          <>
            <div className="text-green-500 text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900">
              Invitation Accepted!
            </h2>
            <p className="text-gray-500 mt-2">
              You have been added to the project.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
            >
              Go to Dashboard
            </button>
          </>
        ) : (
          <>
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900">
              Invalid or Expired Link
            </h2>
            <p className="text-gray-500 mt-2">
              The invitation link may have expired or been used.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
            >
              Go Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
