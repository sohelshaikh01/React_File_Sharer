import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import useAuth from "../context/useAuth.js";

const ForgetPassword = () => {
  const navigate = useNavigate();

  // ✅ use context
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔹 Validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return toast.error("Invalid email");
    }

    try {
      setLoading(true);

      // ✅ call context
      await forgotPassword({ email });

      toast.success("Email sent");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow">

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">⚡ FileShare</h1>
          <p className="text-gray-500 text-sm">
            Reset your password
          </p>
        </div>

        <h2 className="text-xl font-semibold mb-4">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="text-sm">Email</label>
            <input
              type="email"
              className="w-full border p-2 rounded mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-black text-white p-2 rounded"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Email"}
          </button>

        </form>

        {/* Redirect */}
        <p className="text-sm text-center mt-4">
          Remember your password?{" "}
          <span
            className="text-blue-500 cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default ForgetPassword;