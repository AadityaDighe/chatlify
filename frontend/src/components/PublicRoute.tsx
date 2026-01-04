import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = () => {
    const { authUser } = useAuth();

    if (authUser) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PublicRoute;
