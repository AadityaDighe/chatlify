import { create } from "zustand";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./auth.store";

export interface ChatUser {
    _id: string;
    fullName: string;
    profilePic?: string;
    bio?: string;
}

export interface Message {
    _id: string;
    conversationId: string;
    senderId: string;
    receiverId: string;
    text?: string;
    image?: string;
    seen: boolean;
    isDeleted?: boolean;
    createdAt: string;
    replyTo?: {
        _id: string;
        text?: string;
        image?: string;
        senderId: string;
        createdAt: string;
    } | null;
}

interface ChatStore {
    users: ChatUser[];
    selectedUser: ChatUser | null;

    messagesByConversation: Record<string, Message[]>;
    selectedConversationId: string | null;
    unseenMessages: Record<string, number>;

    getUsers: () => Promise<void>;
    getMessages: (conversationId: string) => Promise<void>;
    getRecentConversations: () => Promise<void>;
    sendMessage: (payload: { text?: string; image?: string, replyTo?: string; }) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    onMessageDeleted: (messageId: string) => void;

    setSelectedUser: (user: ChatUser | null) => void;
    clearSelectedUser: () => void;
    onSocketMessage: (message: Message) => void;
    reset: () => void;

    showRightSidebar: boolean;
    setShowRightSidebar: (show: boolean) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    users: [],
    selectedUser: null,
    selectedConversationId: null,
    messagesByConversation: {},
    unseenMessages: {},

    showRightSidebar: false,

    setShowRightSidebar: (show) => set({ showRightSidebar: show }),

    setSelectedUser: (user) => {
        set((state) => ({
            selectedUser: user,
            selectedConversationId: user?._id ?? null,
            unseenMessages: user
                ? { ...state.unseenMessages, [user._id]: 0 }
                : state.unseenMessages,
            showRightSidebar: false,
        }));

        if (user) {
            get().getMessages(user._id);
        }
    },


    clearSelectedUser: () =>
        set({
            selectedUser: null,
            selectedConversationId: null,
            showRightSidebar: false,
        }),

    getUsers: async () => {
        const { data } = await api.get("/api/messages/users");
        if (data.success) {
            set({
                users: data.users,
                unseenMessages: data.unseenMessages || {},
            });
        }
    },

    getMessages: async (conversationId) => {
        // ✅ Only fetch if messages not already in store
        // if (get().messagesByConversation[conversationId]) return;

        const { data } = await api.get(`/api/messages/${conversationId}`);
        if (data.success) {
            set((state) => ({
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [conversationId]: data.messages,
                },
            }));
        }
    },


    sendMessage: async (payload) => {
        const conversationId = get().selectedConversationId;
        if (!conversationId) return;

        await api.post(`/api/messages/send/${conversationId}`, payload);
    },


    deleteMessage: async (messageId: string) => {
        const conversationId = get().selectedConversationId;
        if (!conversationId) return;

        try {
            set((state) => ({
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [conversationId]: state.messagesByConversation[conversationId]?.filter(
                        (m) => m._id !== messageId
                    ) || [],
                },
            }));

            await api.delete(`/api/messages/delete/${messageId}`);
        } catch (err) {
            toast.error("Failed to delete message");

            get().getMessages(conversationId);
        }
    },

    onMessageDeleted: (messageId: string) => {
        set((state) => {
            const updated = { ...state.messagesByConversation };
            Object.keys(updated).forEach((convoId) => {
                updated[convoId] = updated[convoId].filter((m) => m._id !== messageId);
            });
            return { messagesByConversation: updated };
        });
    },


    onSocketMessage: (message) => {
        const { authUser } = useAuthStore.getState();
        if (!authUser) return;

        const convoId = message.senderId === authUser._id
            ? message.receiverId
            : message.senderId;

        set((state) => {
            const existingMessages = state.messagesByConversation[convoId] || [];

            //  Prevent duplicates
            const messageExists = existingMessages.some(m => m._id === message._id);
            if (messageExists) {
                return state;
            }

            return {
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [convoId]: [...existingMessages, message],
                },
                unseenMessages:
                    state.selectedConversationId === convoId
                        ? state.unseenMessages
                        : {
                            ...state.unseenMessages,
                            [convoId]: (state.unseenMessages[convoId] || 0) + 1,
                        },
            };
        });
    },

    getRecentConversations: async () => {
        try {
            const { data } = await api.get("/api/messages/recent");

            if (data.success && Array.isArray(data.conversations)) {
                const messagesMap: Record<string, Message[]> = {};
                const unseenMap: Record<string, number> = {};

                data.conversations.forEach((convo: any) => {
                    const convoId = convo._id.toString();

                    unseenMap[convoId] = convo.unseen || 0;

                    if (convo.lastMessage) {
                        messagesMap[convoId] = [convo.lastMessage];
                    }
                });

                set({
                    messagesByConversation: messagesMap,
                    unseenMessages: unseenMap,
                });
            }
        } catch (err) {
            toast.error("Failed to load recent chats");
        }
    },

    reset: () =>
        set({
            users: [],
            selectedUser: null,
            selectedConversationId: null,
            messagesByConversation: {},
            unseenMessages: {},
        }),
}));