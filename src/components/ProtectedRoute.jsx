import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../context/useAuth.js";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // ⏳ wait until auth is loaded
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          
          {/* Spinner */}
          <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>

          {/* Text */}
          <p className="text-gray-400 text-sm tracking-wide">
            Checking authentication...
          </p>

        </div>
      </div>
    );
  }

  // 🔐 check auth
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;