import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";  
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { AuthProvider } from './context/AuthProvider.jsx'

// Pages
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
// import ForgetPassword from "./pages/ForgetPassword.jsx";

import App from './App.jsx';
import Dashboard from "./pages/Dashboard.jsx";
import Transfer from "./pages/Transfer.jsx"
import Receive from "./pages/Receive.jsx";
import History from "./pages/History.jsx";
import Profile from "./pages/Profile.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from './components/PublicRoute.jsx';

const router = createBrowserRouter([
  
  // 🔓 Public Routes (BLOCK when logged in)
  {
    element: <PublicRoute />,
    children: [
      {
        element: <App />,
        children: [
          { path: "/login", element: <Login /> },
          { path: "/register", element: <Register /> },
        ],
      },
    ],
  },

  // 🔐 Protected Routes (ONLY when logged in)
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <App />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "transfer", element: <Transfer /> },
          { path: "receive", element: <Receive /> },
          { path: "history", element: <History /> },
          { path: "profile", element: <Profile /> },
        ],
      },
    ],
  },
]);


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer style={{zIndex: 999}} position="top-right" autoClose={3000} />
    </AuthProvider>
  </StrictMode>
);