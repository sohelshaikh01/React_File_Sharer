import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import useAuth from "../context/useAuth.js";

const Register = () => {
  const navigate = useNavigate();

  // ✅ use context
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    // 🔹 Validation
    if (!username) return toast.error("Username required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return toast.error("Invalid email");
    if (password.length < 6)
      return toast.error("Password must be 6+ characters");
    if (password !== confirmPassword)
      return toast.error("Passwords do not match");

    try {
      setLoading(true);

      // ✅ Call context (API handled there)
      await register({
        fullName: username, // map to backend field
        email,
        password,
      });

      toast.success("Account created");

      setTimeout(() => {
        navigate("/");
      }, 800);

    } catch (err) {
      toast.error(err.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-green-50">
      <div className="w-full shadow py-10 px-14 flex flex-row gap-10 items-center">

        <div className="w-3/5">
          <p className="font-bold text-4xl mt-10 mb-4">Architecture for the <span className="block text-blue-600"> Next Generation</span> of Sharing.</p>

          <p className="text-gray-500 tracking-wide">Secure architectural transfer protocol designed for</p>
          <p className="text-gray-500 tracking-wide">high-performance teams. Join 10,000+</p>
          <p className="text-gray-500 tracking-wide mb-6">moving data weightlessly.</p>

          <div className="flex flex-row w-full items-center gap-4">
            <div className="w-2/5 bg-slate-200/45 rounded-2xl p-6 flex flex-col gap-2">
              <p className="text-xl">🛡️</p>
              <p className="font-semibold">End-to-End</p>
              <p className="text-gray-500">Military grade encryption for every single packet.</p>
            </div>

            <div className="w-2/5 bg-slate-200/45 rounded-2xl p-6 flex flex-col gap-2">
              <p className="text-xl">🚀</p>
              <p className="font-semibold">Sero Latency</p>
              <p className="text-gray-500">Global edge network ensures lightning fast transfers.</p>
            </div>
          </div>
        </div>

        <div className="w-2/5 rounded-2xl bg-white p-8">
          <div className="mb-6">
            <p className="text-2xl font-bold text-blue-700">🚀 SyncShare</p>
            <h1 className="font-bold text-2xl">Register Yourself</h1>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">

            {/* Username */}
            <div>
              <label className="text-sm text-gray-600 font-semibold">Username</label>
              <input
                type="text"
                placeholder="Alex Sterling"
                className="w-full border-none outline-none rounded-[18px] p-3 px-5 bg-slate-200/45 mt-1 text-gray-500 "
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm text-gray-600 font-semibold">Email</label>
              <input
                type="email"
                placeholder="✉️ name@company.com"
                className="w-full border-none outline-none rounded-[18px] p-3 px-5 bg-slate-200/45 mt-1 text-gray-500 "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-600 font-semibold">Password</label>
              <input
                type="password"
                placeholder="🔒 ••••••••"
                className="w-full border-none outline-none rounded-[18px] p-3 px-5 bg-slate-200/45 mt-1 text-gray-500 "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm text-gray-600 font-semibold">Confirm Password</label>
              <input
                type="password"
                placeholder="🔒 ••••••••"
                className="w-full border-none outline-none rounded-[18px] p-3 px-5 bg-slate-200/45 mt-1 text-gray-500 "
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-linear-to-r from-blue-700 to-blue-600/70 px-5 py-3 rounded-[18px] text-white mt-2"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          {/* Redirect */}
          <p className="text-sm text-center mt-6 mb-2 text-gray-600 font-semibold">
            Already have an account?{" "}
            <span
              className="text-blue-500 cursor-pointer font-bold"
              onClick={() => navigate("/login")}
            >
              Log in
            </span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;