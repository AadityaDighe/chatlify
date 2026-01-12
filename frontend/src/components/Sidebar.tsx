import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

import assets from "../assets/assets";
import { useAuthStore } from "../store/auth.store";
import { useChatStore } from "../store/chat.store";
import { useSocketStore } from "../store/socket.store";

import { formatMessageTime } from "../lib/utils";

const Sidebar = () => {
    const navigate = useNavigate();

    // 🔐 Auth
    const logout = useAuthStore((s) => s.logout);

    //  Chat
    const { users, selectedUser, unseenMessages, getUsers, setSelectedUser, messagesByConversation } =
        useChatStore();

    // 🔌 Socket
    const onlineUsers = useSocketStore((s) => s.onlineUsers);

    const authUser = useAuthStore((s) => s.authUser)

    // UI state
    const [openMenu, setOpenMenu] = useState(false);
    const [input, setInput] = useState("");
    const menuRef = useRef<HTMLDivElement | null>(null);


    const recentOrder = useMemo<string[]>(() => {
        return users
            .map(user => {
                const messages = messagesByConversation[user._id] || [];
                const lastMessage = messages[messages.length - 1];
                return {
                    userId: user._id,
                    timestamp: lastMessage ? new Date(lastMessage.createdAt).getTime() : 0
                };
            })
            .sort((a, b) => b.timestamp - a.timestamp)
            .map(item => item.userId);
    }, [users, messagesByConversation]);

    const sortedUsers = useMemo(() => {
        return users.sort((a, b) => {
            const indexA = recentOrder.indexOf(a._id);
            const indexB = recentOrder.indexOf(b._id);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }, [users, recentOrder]);



    useEffect(() => {
        if (authUser) {
            // Load everything when user is authenticated
            getUsers();
            useChatStore.getState().getRecentConversations();
        }
    }, [authUser, getUsers]);


    // Close menu on outside click
    useEffect(() => {
        if (!openMenu) return;

        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenu(false);
            }
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [openMenu]);

    // Search filter
    const filteredUsers = useMemo(() => {
        if (!input) return users;
        return sortedUsers.filter((u) =>
            u.fullName.toLowerCase().includes(input.toLowerCase())
        );
    }, [sortedUsers, input]);

    const handleSelectUser = (user: typeof users[number]) => {
        setSelectedUser(user);
        setInput(""); // clear search
    };

    return (
        <div
            className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-auto text-white ${selectedUser ? "max-md:hidden" : ""
                }`}
        >
            {/* Header */}
            <div className="pb-5">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                        <img src={assets.logo_icon} alt="logo" className="w-8" />
                        <p>Chatlify</p>
                    </div>

                    <div className="relative">
                        <img
                            src={assets.menu_icon}
                            alt="Menu"
                            className="max-h-5 cursor-pointer"
                            onClick={() => setOpenMenu((p) => !p)}
                        />

                        {openMenu && (
                            <div
                                ref={menuRef}
                                className="absolute right-0 mt-2 z-50 w-36 p-4 rounded-md bg-[#282142] border border-gray-600 shadow-lg"
                            >
                                <p
                                    className="cursor-pointer text-sm hover:text-violet-400"
                                    onClick={() => {
                                        navigate("/profile");
                                        setOpenMenu(false);
                                    }}
                                >
                                    Edit Profile
                                </p>

                                <hr className="my-2 border-gray-500" />

                                <p
                                    className="cursor-pointer text-sm hover:text-red-400"
                                    onClick={logout}
                                >
                                    Logout
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Search */}
                <div className="bg-[#282142] rounded-full flex items-center gap-2 px-4 py-3 mt-5">
                    <img src={assets.search_icon} alt="Search" className="w-3" />
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="bg-transparent outline-none text-xs flex-1 text-white"
                        placeholder="Search User..."
                    />
                </div>
            </div>

            {/* Users */}
            <div className="flex flex-col">
                {filteredUsers.map((user) => {
                    const unseen = unseenMessages[user._id] || 0;
                    const isOnline = onlineUsers.includes(user._id);

                    // Get last message for preview
                    const convoMessages = messagesByConversation[user._id] || [];
                    const lastMessage = convoMessages[convoMessages.length - 1];

                    const previewText = lastMessage
                        ? lastMessage.image
                            ? "📷 Photo"
                            : lastMessage.text || ""
                        : "Start Chatting";

                    const timeText = lastMessage ? formatMessageTime(lastMessage.createdAt) : "";

                    return (
                        <div
                            key={user._id}
                            onClick={() => handleSelectUser(user)}
                            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer ${selectedUser?._id === user._id ? "bg-[#282142]/50" : ""
                                }`}
                        >
                            <div className="relative">
                                <img
                                    src={user.profilePic || assets.avatar_icon}
                                    className="w-[35px] rounded-full"
                                />
                                {isOnline && (
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#8185B2]/10" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <p className="font-medium truncate">{user.fullName}</p>
                                    {timeText && <p className="text-xs text-gray-400">{timeText}</p>}
                                </div>
                                <p className="text-xs text-gray-400 truncate mt-1">
                                    {previewText || "Start chatting!"}
                                </p>
                            </div>

                            {unseen > 0 && (
                                <span className="absolute top-4 right-4 text-xs h-5 w-5 flex items-center justify-center rounded-full bg-violet-500/50">
                                    {unseen > 99 ? "99+" : unseen}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Sidebar;
