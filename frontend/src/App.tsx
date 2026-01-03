import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Profile from "./pages/Profile"
import Login from "./pages/Login"
import Home from "./pages/Home"
import bgImage from "./assets/bgImage.svg"
import { Toaster } from "react-hot-toast"
import { useAuth } from "./context/AuthContext";

const App = () => {

  const { authUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div style={{ backgroundImage: `url(${bgImage})` }}
      className="bg-contain">
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/" element={authUser ? <Home /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={authUser ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/profile" element={authUser ? <Profile /> : <Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App