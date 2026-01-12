import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "./auth.store";
import { useChatStore } from "./chat.store";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface SocketStore {
    socket: Socket | null;
    onlineUsers: string[];
    connect: () => void;
    disconnect: () => void;
    bindSocketEvents: () => void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
    socket: null,
    onlineUsers: [],

    connect: () => {
        if (get().socket) return;

        const userId = useAuthStore.getState().authUser?._id;
        if (!userId) return;

        const socket = io(BACKEND_URL, {
            query: { userId },
            withCredentials: true,
            transports: ["websocket", "polling"],
        });

        set({ socket });
        get().bindSocketEvents();
    },

    disconnect: () => {
        get().socket?.disconnect();
        set({ socket: null });
    },

    bindSocketEvents: () => {
        const socket = get().socket;
        if (!socket) return;

        socket.off();

        socket.on("newMessage", (message) => {
            useChatStore.getState().onSocketMessage(message);
        });

        socket.on("getOnlineUsers", (users: string[]) => {
            set({ onlineUsers: users });
        });

        socket.on("messageDeleted", (messageId: string) => {
            useChatStore.getState().onMessageDeleted(messageId);
        });
    },
}));
