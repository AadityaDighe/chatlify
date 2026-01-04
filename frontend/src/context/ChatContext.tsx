// import { createContext, useContext, useEffect, useState } from "react";
// import { useAuth } from "./AuthContext";
// import { toast } from "react-hot-toast";
// import api from "../lib/axios";


// interface UserType {
//     _id: string;
//     fullName: string;
//     profilePic?: string;
// }

// interface MessageType {
//     _id: string;
//     senderId: string;
//     receiverId: string;
//     text?: string;
//     image?: string;
//     seen: boolean;
//     createdAt: string;
// }


// export const ChatContext = createContext<any>({
//     messages: [],
//     users: [],
//     selectedUser: null,
//     unseenMessages: {},
// })



// export const ChatProvider = ({ children }: { children: React.ReactNode }) => {

//     const [messages, setMessages] = useState<MessageType[]>([]);
//     const [users, setUsers] = useState<UserType[]>([]);
//     const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
//     const [unseenMessages, setUnseenMessages] = useState<Record<string, number>>({});

//     const { authUser } = useAuth();

//     const { socket } = useAuth();

//     // get all users and messages for sidebar

//     const getUsers = async () => {
//         try {
//             const { data } = await api.get("/api/messages/users");
//             if (data.success) {
//                 setUsers(data.users);
//                 setUnseenMessages(data.unseenMessages);
//             }
//         } catch (error: any) {
//             toast.error(error?.response?.data?.message || error.message || "Something went wrong");
//             console.log("Error fetching users:", error);
//         }
//     };


//     // get selected user messages

//     const getMessages = async (userId: string) => {
//         try {
//             const { data } = await api.get(`/api/messages/${userId}`);
//             if (data.success) {
//                 setMessages(data.messages);
//             }
//         } catch (error: any) {
//             toast.error(error?.response?.data?.message || error.message || "Something went wrong");
//             console.log("Error fetching messages:", error);
//         }
//     };


//     // send message to selected user

//     const sendMessage = async (messageData: {
//         text?: string;
//         image?: string;
//     }) => {
//         try {
//             const { data } = await api.post(`/api/messages/send/${selectedUser?._id}`, messageData);
//             if (data.success) {
//                 setMessages((prevMessages) => [...prevMessages, data.newMessage]);
//             } else {
//                 toast.error(data.message || "Failed to send message");
//             }
//         } catch (error: any) {
//             toast.error(error?.response?.data?.message || error.message || "Something went wrong");
//             console.log("Error sending message:", error);
//         }
//     };


//     // subscribe to messages for selected user

//     const subscribeToMessages = () => {

//         if (!socket) return;

//         socket?.on("newMessage", (newMessage: MessageType) => {
//             if (selectedUser && newMessage.senderId === selectedUser?._id) {
//                 newMessage.seen = true;
//                 setMessages((prevMessages) => [...prevMessages, newMessage]);
//                 api.put(`/api/messages/mark/${newMessage._id}`)
//             } else {
//                 setUnseenMessages((prev) => ({
//                     ...prev,
//                     [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
//                 }));
//             }
//         });
//     }


//     // function to unsubscribe from messages

//     const unsubscribeFromMessages = () => {
//         if (!socket) return;
//         socket.off("newMessage");
//     }

//     useEffect(() => {
//         if (!authUser) {
//             setUsers([]);
//             setMessages([]);
//             setSelectedUser(null);
//             setUnseenMessages({});
//         }
//     }, [authUser]);

//     useEffect(() => {
//         subscribeToMessages();
//         return () => {
//             unsubscribeFromMessages();
//         }
//     }, [selectedUser, socket]);

//     const value = {
//         messages,
//         users,
//         selectedUser,
//         getUsers,
//         setMessages,
//         sendMessage,
//         setSelectedUser,
//         unseenMessages,
//         getMessages,
//         setUnseenMessages,
//     };

//     return (
//         <ChatContext.Provider value={value}>
//             {children}
//         </ChatContext.Provider>
//     );
// }


// export const useChat = () => {
//     const context = useContext(ChatContext);
//     if (!context) {
//         throw new Error("useChat must be used within a ChatProvider");
//     }
//     return context;
// };
















import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "../lib/axios";
import { toast } from "react-hot-toast";
import { useAuth } from "./AuthContext";



// Types 


export interface ChatUser {
    _id: string;
    fullName: string;
    profilePic?: string;
    bio?: string
}


export interface Message {
    _id: string;
    senderId: string;
    receiverId: string;
    text?: string;
    image?: string;
    seen: boolean;
    createdAt: string;
}

interface ChatContextType {
    users: ChatUser[];
    messages: Message[];
    selectedUser: ChatUser | null;
    unseenMessages: Record<string, number>;
    setUnseenMessages: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    getUsers: () => Promise<void>;
    getMessages: (userId: string) => Promise<void>;
    sendMessage: (data: { text?: string; image?: string }) => Promise<void>;
    setSelectedUser: (user: ChatUser | null) => void;
}


const ChatContext = createContext<ChatContextType | null>(null);



export const ChatProvider = ({ children }: { children: ReactNode }) => {

    const { socket, authUser } = useAuth();

    const [users, setUsers] = useState<ChatUser[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
    const [unseenMessages, setUnseenMessages] = useState<Record<string, number>>({});

    // get all users and messages for sidebar

    const getUsers = async () => {
        try {
            const { data } = await api.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages || {});
            }
        } catch {
            toast.error("Failed to load users");
        }
    };


    // get selected user messages

    const getMessages = async (userId: string) => {
        try {
            const { data } = await api.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
            }
        } catch {
            toast.error("Failed to load messages");
        }
    };


    // send message to selected user

    const sendMessage = async (messageData: {
        text?: string;
        image?: string;
    }) => {
        try {
            const { data } = await api.post(`/api/messages/send/${selectedUser?._id}`, messageData);
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.newMessage]);
            }
        } catch {
            toast.error("Failed to send message");
        }
    };


    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message: Message) => {
            if (selectedUser && message.senderId === selectedUser._id) {
                setMessages((prev) => [...prev, { ...message, seen: true }]);
                api.put(`/api/messages/mark/${message._id}`);
            } else {
                setUnseenMessages((prev) => ({
                    ...prev,
                    [message.senderId]: (prev[message.senderId] || 0) + 1,
                }));
            }
        };

        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [socket, selectedUser]);



    useEffect(() => {
        if (!authUser) {
            setUsers([]);
            setMessages([]);
            setSelectedUser(null);
            setUnseenMessages({});
        }
    }, [authUser]);

    const value: ChatContextType = {
        users,
        messages,
        selectedUser,
        unseenMessages,
        getUsers,
        getMessages,
        sendMessage,
        setSelectedUser,
        setUnseenMessages
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}


export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};
