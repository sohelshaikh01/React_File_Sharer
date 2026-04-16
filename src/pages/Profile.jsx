import React from "react";
import useAuth from "../context/useAuth.js";

const Profile = () => {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!user) return <p className="text-red-500">Not logged in</p>;

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-blue-50 to-green-50 flex justify-center items-start py-10 px-4">
      
      <div className="w-full max-w-4xl">

        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Profile Settings
        </h1>

        <p className="text-sm text-gray-500 mb-6">
          Manage your personal identity and security preferences.
        </p>

        {/* Top Card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_5px_rgba(0,0,0,0.1)] p-6 flex items-center gap-5 mb-6">
          
          {/* Avatar Placeholder */}
          <div className="w-24 h-24 flex items-center justify-center bg-slate-100 rounded-full text-3xl">
            👤
          </div>

          {/* Info */}
          <div>
            <p className="text-lg font-semibold text-gray-800">
              {user.fullName
              .split(" ")
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>

            {/* Tags */}
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                PREMIUM PLAN
              </span>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full">
                ✅ VERIFIED
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Account Details */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_5px_5px_rgba(0,0,0,0.1)]">
            <h2 className="font-semibold text-gray-800 mb-4">
              Account Details
            </h2>

            <div className="space-y-4">

              <div>
                <p className="text-xs text-gray-400 mb-1">USERNAME</p>
                <div className="bg-gray-100 px-4 py-3 rounded-lg text-gray-700">
                  {user.email}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">EMAIL</p>
                <div className="bg-gray-100 px-4 py-3 rounded-lg flex justify-between">
                  <span>{user.email}</span>
                  <span className="text-green-600 text-sm">Verified</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">ACCOUNT CREATED</p>
                <div className="bg-gray-100 px-4 py-3 rounded-lg text-gray-700">
                  {new Date(user.createdAt).toDateString()}
                </div>
              </div>

            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_5px_5px_rgba(0,0,0,0.1)]">
            <h2 className="font-semibold text-gray-800 mb-4">
              Preferences
            </h2>

            <div className="space-y-5">

              {/* Notifications */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Notifications
                  </p>
                  <p className="text-xs text-gray-400">
                    Get alerts for shared files and activity
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="toggle" />
              </div>

              {/* 2FA */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Two-Factor Auth
                  </p>
                  <p className="text-xs text-gray-400">
                    Enhance your account security
                  </p>
                </div>
                <input type="checkbox" className="toggle" />
              </div>

              {/* Update Password */}
              <button className="text-blue-600 text-sm font-medium hover:underline">
                Update Password
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;