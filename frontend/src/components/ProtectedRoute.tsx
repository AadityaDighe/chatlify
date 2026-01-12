import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

const ProtectedRoute = () => {
    const authUser = useAuthStore((s) => s.authUser);
    const loading = useAuthStore((s) => s.loading);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center text-white">
                Loading...
            </div>
        );
    }

    if (!authUser) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
