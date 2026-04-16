import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../context/useAuth.js";
import { useEffect } from "react";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
  }, [user]);

  // ⏳ wait until auth is loaded
  if (loading) {
    return <p className="text-center mt-10 text-gray-400">Loading...</p>;
  }

  // 🔐 check auth
  return user ? <Outlet /> : <Navigate to="/login" replace />;
  
};

export default ProtectedRoute;