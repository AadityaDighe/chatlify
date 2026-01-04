// import { createContext, useContext, useEffect, useState } from "react";
// import api from "../lib/axios";
// import toast from "react-hot-toast";
// import { io } from "socket.io-client";
// import { Socket } from "socket.io-client";

// interface User {
//     _id: string;
//     fullName: string;
//     profilePic?: string;
//     bio?: string;
// }

// interface AuthContextType {
//     authUser: User | null;
//     onlineUser: string[];
//     socket: Socket | null;
//     login: (state: "login" | "signup", credentials: any) => Promise<void>;
//     logout: () => void;
//     updateProfile: (profileData: any) => Promise<void>;
//     loading: boolean;
// }

// const backendURL = import.meta.env.VITE_BACKEND_URL;

// export const AuthContext = createContext<AuthContextType | null>(null);


// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//     const [token, setToken] = useState(localStorage.getItem("token") || null);
//     const [authUser, setAuthUser] = useState<User | null>(null);
//     const [onlineUser, setOnlineUser] = useState<string[]>([]);
//     const [socket, setSocket] = useState<Socket | null>(null);

//     const [loading, setLoading] = useState(true);



//     // check if user is authenticated and if so set the userData and connect socket  

//     const checkAuth = async () => {
//         try {
//             const { data } = await api.get("/api/auth/check")
//             if (data.success) {
//                 setAuthUser(data.user);
//                 connectSocket(data.user);
//             }
//         } catch (error: any) {
//             toast.error(error?.response?.data?.message || error.message || "Something went wrong");
//             console.log("Error checking auth:", error);
//         } finally {
//             setLoading(false);
//         }
//     };


//     // Login function to handle user authentication and socket connection
//     const login = async (
//         state: "login" | "signup",
//         credentials: Record<string, any>
//     ) => {
//         try {
//             const { data } = await api.post(`/api/auth/${state}`, credentials);
//             if (data.success) {
//                 setAuthUser(data.user);
//                 connectSocket(data.user);
//                 localStorage.setItem("token", data.token);
//                 setToken(data.token);
//                 toast.success(data.message);
//             }
//         } catch (error: any) {
//             toast.error(error?.response?.data?.message || error.message || "Something went wrong");
//             console.log("Error during login:", error);
//         }
//     };


//     // Logout function to handle user logout and socket disconnection
//     const logout = () => {
//         localStorage.removeItem("token");
//         setToken(null);
//         setAuthUser(null);
//         setOnlineUser([]);
//         toast.success("Logged out successfully");
//         if (socket) {
//             socket.disconnect();
//             setSocket(null);
//         }
//     };

//     // update profile function to handle user profile updates
//     const updateProfile = async (profileData: FormData | Record<string, any>) => {
//         try {
//             const { data } = await api.put("/api/auth/update-profile", profileData);
//             if (data.success) {
//                 setAuthUser(data.user);
//                 toast.success("Profile updated successfully");
//             }
//         } catch (error: any) {
//             toast.error(error?.response?.data?.message || error.message || "Something went wrong");
//         }
//     };

//     // connect socket function to handle socket connection and online users update
//     const connectSocket = (userData: any) => {
//         if (!userData || socket?.connected) return;
//         const newSocket = io(backendURL, {
//             query: {
//                 userId: userData._id
//             }
//         });

//         newSocket.connect()
//         setSocket(newSocket);
//         newSocket.on("getOnlineUsers", (userIds: any) => {
//             setOnlineUser(userIds);
//         });
//     };

//     useEffect(() => {
//         if (token) {
//             checkAuth();
//         } else {
//             setLoading(false);
//         }
//     }, [token]);

//     const value = {
//         authUser,
//         onlineUser,
//         socket,
//         login,
//         logout,
//         updateProfile,
//         loading
//     };
//     return (
//         <AuthContext.Provider value={value}>
//             {children}
//         </AuthContext.Provider>
//     )
// };

// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (!context) {
//         throw new Error("useAuth must be used within an AuthProvider");
//     }
//     return context;
// };








import { createContext, useContext, useEffect, useState, useRef } from "react";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";


// Types



interface User {
    _id: string;
    fullName: string;
    profilePic?: string;
    bio?: string;
}


interface LoginCredentials {
    email: string;
    password: string;
}

interface SignupCredentials extends LoginCredentials {
    fullName: string;
    bio?: string
}


interface AuthContextType {
    authUser: User | null;
    onlineUser: string[];
    socket: Socket | null;
    loading: boolean;
    login: (
        type: "login" | "signup",
        credentials: LoginCredentials | SignupCredentials
    ) => Promise<void>;
    logout: () => void;
    updateProfile: (data: FormData | Partial<User>) => Promise<void>;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const AuthContext = createContext<AuthContextType | null>(null);


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [authUser, setAuthUser] = useState<User | null>(null);
    const [onlineUser, setOnlineUser] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const socketRef = useRef<Socket | null>(null);
    const token = localStorage.getItem("token");


    // connect socket function to handle socket connection and online users update
    const connectSocket = (userId: string) => {
        if (socketRef.current) return;

        const socket = io(BACKEND_URL, {
            query: { userId },
        });

        socket.on("getOnlineUsers", (users: string[]) => {
            setOnlineUser(users);
        });

        socketRef.current = socket;
    };


    const disconnectSocket = () => {
        socketRef.current?.disconnect();
        socketRef.current = null;
        setOnlineUser([]);
    };



    // check if user is authenticated and if so set the userData and connect socket  

    const checkAuth = async () => {
        try {
            const { data } = await api.get("/api/auth/check")
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user._id);
            }
        } catch {
            setAuthUser(null);
            localStorage.removeItem("token");
        } finally {
            setLoading(false);
        }
    };


    // Login function to handle user authentication and socket connection
    const login = async (
        type: "login" | "signup",
        credentials: LoginCredentials | SignupCredentials
    ) => {
        try {
            const { data } = await api.post(`/api/auth/${type}`, credentials);
            if (data.success) {
                localStorage.setItem("token", data.token);
                setAuthUser(data.user);
                connectSocket(data.user._id);
                toast.success(data.message);
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Authentication failed");
        }
    };


    // Logout function to handle user logout and socket disconnection
    const logout = () => {
        localStorage.removeItem("token");
        setAuthUser(null);
        disconnectSocket();
        toast.success("Logged out successfully");
    };

    // update profile function to handle user profile updates
    const updateProfile = async (formData: FormData | Partial<User>) => {
        try {
            const { data } = await api.put("/api/auth/update-profile", formData);
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Profile update failed");
        }
    };


    useEffect(() => {
        if (token) {
            checkAuth();
        } else {
            setLoading(false);
        }

        return () => {
            disconnectSocket();
        };
    }, [token]);

    const value = {
        authUser,
        onlineUser,
        socket: socketRef.current,
        loading,
        login,
        logout,
        updateProfile,
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
