import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import AppLayout from "./layouts/AppLayout";

// import bgImage from "./assets/bgImage.png";
import bgImage from "./assets/bgImage.svg";

import { useAuthStore } from "./store/auth.store";
import { useSocketStore } from "./store/socket.store";
import ResetPassword from "./pages/ResetPassword";

const App = () => {

  const loading = useAuthStore((s) => s.loading);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  const { authUser } = useAuthStore();
  const connect = useSocketStore((s) => s.connect);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkAuth();
    } else {
      useAuthStore.setState({ loading: false });
    }
  }, [checkAuth]);

  useEffect(() => {
    if (authUser) connect();
  }, [authUser]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-cover" style={{ backgroundImage: `url(${bgImage})` }} >
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};
export default App;