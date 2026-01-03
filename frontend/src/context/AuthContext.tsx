import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { Socket } from "socket.io-client";

interface User {
    _id: string;
    fullName: string;
    profilePic?: string;
    bio?: string;
}

interface AuthContextType {
    authUser: User | null;
    onlineUser: string[];
    socket: Socket | null;
    login: (state: "login" | "signup", credentials: any) => Promise<void>;
    logout: () => void;
    updateProfile: (profileData: any) => Promise<void>;
    loading: boolean;
}

const backendURL = import.meta.env.VITE_BACKEND_URL;

export const AuthContext = createContext<AuthContextType | null>(null);


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const [authUser, setAuthUser] = useState<User | null>(null);
    const [onlineUser, setOnlineUser] = useState<string[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);

    const [loading, setLoading] = useState(true);



    // check if user is authenticated and if so set the userData and connect socket  

    const checkAuth = async () => {
        try {
            const { data } = await api.get("/api/auth/check")
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message || "Something went wrong");
            console.log("Error checking auth:", error);
        } finally {
            setLoading(false);
        }
    };


    // Login function to handle user authentication and socket connection
    const login = async (
        state: "login" | "signup",
        credentials: Record<string, any>
    ) => {
        try {
            const { data } = await api.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
                localStorage.setItem("token", data.token);
                setToken(data.token);
                toast.success(data.message);
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message || "Something went wrong");
            console.log("Error during login:", error);
        }
    };


    // Logout function to handle user logout and socket disconnection
    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUser([]);
        toast.success("Logged out successfully");
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    };

    // update profile function to handle user profile updates
    const updateProfile = async (profileData: FormData | Record<string, any>) => {
        try {
            const { data } = await api.put("/api/auth/update-profile", profileData);
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message || "Something went wrong");
        }
    };

    // connect socket function to handle socket connection and online users update
    const connectSocket = (userData: any) => {
        if (!userData || socket?.connected) return;
        const newSocket = io(backendURL, {
            query: {
                userId: userData._id
            }
        });

        newSocket.connect()
        setSocket(newSocket);
        newSocket.on("getOnlineUsers", (userIds: any) => {
            setOnlineUser(userIds);
        });
    };

    useEffect(() => {
        if (token) {
            checkAuth();
        } else {
            setLoading(false);
        }
    }, [token]);

    const value = {
        authUser,
        onlineUser,
        socket,
        login,
        logout,
        updateProfile,
        loading
    };
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
