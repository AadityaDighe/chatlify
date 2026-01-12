import assets from "../../assets/assets";
import { useChatStore } from "../../store/chat.store";
import { useSocketStore } from "../../store/socket.store";

interface ChatHeaderProps {
    setShowRightSidebar: (show: boolean) => void;
    showRightSidebar: boolean
}

export const ChatHeader = ({ setShowRightSidebar, showRightSidebar }: ChatHeaderProps) => {
    const selectedUser = useChatStore((s) => s.selectedUser);
    const clearSelectedUser = useChatStore((s) => s.clearSelectedUser);
    const onlineUsers = useSocketStore((s) => s.onlineUsers);

    if (!selectedUser) return null;

    return (
        <div
            onClick={() => setShowRightSidebar(!showRightSidebar)}
            className="flex items-center gap-3 py-3 px-4 border-b border-stone-500 cursor-pointer hover:bg-white/5 transition-colors"
        >
            <img
                src={selectedUser.profilePic || assets.avatar_icon}
                className="w-8 rounded-full object-cover"
                alt="avatar"
            />
            <p className="flex-1 text-lg font-medium text-white truncate flex items-center gap-2">
                {selectedUser.fullName}
                {onlineUsers.includes(selectedUser._id) && (
                    <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                )}
            </p>

            <img
                onClick={(e) => {
                    e.stopPropagation();
                    clearSelectedUser();
                }}
                src={assets.arrow_icon}
                className="w-7 cursor-pointer md:hidden"
                alt="back to chats"
            />
        </div>
    );
};