import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import useAuth from "../context/useAuth.js";

const Login = () => {
  const navigate = useNavigate();

  // ✅ use context functions
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    // 🔹 Validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return toast.error("Invalid email");
    }
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    try {
      setLoading(true);

      // ✅ Call context (handles API + storage)
      await login({ email, password });

      toast.success("Login successful");

      setTimeout(() => {
        navigate("/");
      }, 800);
      
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="w-full py-10 px-14 bg-linear-to-br from-blue-50 to-green-50 ">

        <div className="w-full mx-auto bg-white rounded-3xl flex flex-row">

          <div className="w-2/5 p-12">

            <div className="mb-6">
              <p className="text-2xl font-bold text-blue-700">🚀 SyncShare</p>
            </div>

            <div className="mb-6">
              <h1 className="font-bold text-3xl mb-4">Welcome back</h1>
              <p className="text-gray-500 tracking-wide">Enter you credential to access your</p>
              <p className="text-gray-500 tracking-wide">secure workspace.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
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

              {/* Button */}
              <button
                type="submit"
                className="w-full bg-linear-to-r from-blue-700 to-blue-600/70 px-5 py-3 rounded-[18px] text-white mt-2"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Redirect */}
            <p className="text-sm text-center mt-8 text-gray-600 font-semibold">
              Don’t have an account?{" "}
              <span
                className="text-blue-500 cursor-pointer font-bold"
                onClick={() => navigate("/register")}
              >
                Sign Up
              </span>
            </p>

            {/* Forget Password */}
            {/* <p className="text-sm text-center mt-2">
              Forgot your <div className="w-full py-10 px-8 h-screen flex flex-col"> password?{" "}
              <span
                className="text-blue-500 cursor-pointer hover:underline"
                onClick={() => navigate("/forget-password")}
              >
                Reset it
              </span>
            </p> */}
          </div>

          <div className="bg-blue-700/80 flex flex-col items-center justify-center rounded-r-3xl w-3/5 px-14 py-16">

              <div className="bg-white/85 rounded-2xl p-10">

                <p className="p-6 inline-block rounded-full bg-linear-to-br text-2xl from-blue-600 to-blue-600/50 mb-4">🛡️</p>

                <h2 className="font-bold text-2xl text-blue-900 mb-4">Architectural Integrity</h2>

                <p className="text-gray-500  tracking-wider">SyncShare utilizes the Secure Architectural Transfer</p>
                <p className="text-gray-500  tracking-wider">Protocla to ensure your files remain encrypted from</p>
                <p className="text-gray-500 mb-5 tracking-wider">origin to destination Every byte is protected.</p>

                <div className="flex flex-row w-full items-center justify-between gap-5">
                  <div className="bg-white/50 w-1/2 p-6 rounded-xl text-gray-500 font-semibold">
                      <p className="text-blue-600 font-bold text-xl">99.9%</p>
                      <p>UPTIME</p>
                  </div>
                  <div className="bg-white/50 w-1/2 p-6 rounded-xl text-gray-500 font-semibold">
                    <p className="text-blue-600 font-bold text-xl">256-bit</p>
                    <p>ENCRYPTION</p>
                  </div>
                </div>

              </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;