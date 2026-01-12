import { create } from "zustand";
import toast from "react-hot-toast";
import api from "../lib/axios";
import { useSocketStore } from "./socket.store";
import { useChatStore } from "./chat.store";
import { persist } from "zustand/middleware";

export interface User {
    _id: string;
    fullName: string;
    profilePic?: string;
    bio?: string;
}

interface AuthStore {
    authUser: User | null;
    loading: boolean;

    checkAuth: () => Promise<void>;
    login: (type: "login" | "signup", creds: unknown) => Promise<void>;
    logout: () => void;
    updateProfile: (data: FormData | Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            authUser: null,
            loading: true,

            checkAuth: async () => {

                const token = localStorage.getItem("token");
                if (!token) {
                    set({ loading: false });
                    return;
                }

                try {
                    const { data } = await api.get("/api/auth/check");

                    if (data.success) {
                        set({ authUser: data.user });
                        useSocketStore.getState().connect();

                        await new Promise(resolve => setTimeout(resolve, 500));

                        const chatStore = useChatStore.getState();
                        await chatStore.getRecentConversations();

                        await chatStore.getUsers();
                    }
                }
                finally {
                    set({ loading: false });
                }
            },

            login: async (type, creds) => {
                try {
                    const { data } = await api.post(`/api/auth/${type}`, creds);

                    if (data.success) {
                        localStorage.setItem("token", data.token);
                        set({ authUser: data.user });
                        useSocketStore.getState().connect();
                        toast.success(data.message || (type === "login" ? "Logged in successfully" : "Account created!"));


                        await new Promise(resolve => setTimeout(resolve, 500));

                        const chatStore = useChatStore.getState();
                        await chatStore.getRecentConversations();
                        await chatStore.getUsers();
                    } else {
                        throw new Error(data.message || "Login failed");
                    }
                } catch (err: any) {
                    toast.error(err?.response?.data?.message || "Invalid credentials");
                }
            },

            logout: () => {
                localStorage.removeItem("token");
                useSocketStore.getState().disconnect();
                useChatStore.getState().reset();
                set({ authUser: null });
                toast.success("Logged out successfully");
            },

            updateProfile: async (payload) => {
                try {
                    const { data } = await api.put("/api/auth/update-profile", payload);

                    if (data.success) {
                        set({ authUser: data.user });
                        toast.success("Profile updated successfully");
                    } else {
                        throw new Error(data.message || "Update failed");
                    }
                } catch (err: any) {
                    const errorMessage = err?.response?.data?.message;

                    if (errorMessage) {
                        toast.error(errorMessage, { duration: 5000 });
                    } else {
                        toast.error("Failed to update profile. Please try again.");
                    }

                    console.error("Update profile error:", err);
                }
            },
        }),
        {
            name: "auth-store",
            partialize: (state) => ({
                authUser: state.authUser,
            }),
        }
    )
);