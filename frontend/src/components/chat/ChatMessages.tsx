import { memo } from "react";
import assets from "../../assets/assets";
import type { Message } from "../../store/chat.store";

import { formatMessageTime, getDateLabel, isSameDay } from "../../lib/utils";

interface ChatUser {
    _id: string;
    fullName: string;
    profilePic?: string;
}

interface Props {
    messages: Message[];
    authUser: ChatUser | null;
    selectedUser: ChatUser | null;
    onImageClick: (url: string) => void;
    scrollEndRef: React.RefObject<HTMLDivElement | null>;
    handleDelete: (messageId: string) => void;
    typingUsers: Set<string>;
    setReplyToMessage: (msg: Message | null) => void;
}

const ChatMessages = memo(({
    messages,
    authUser,
    selectedUser,
    onImageClick,
    scrollEndRef,
    handleDelete,
    typingUsers,
    setReplyToMessage
}: Props) => {

    const isTyping = selectedUser && typingUsers.has(selectedUser._id);

    return (
        <div className="flex-1 overflow-y-auto p-3 pb-6">
            {messages.map((message, index) => {
                const date = new Date(message.createdAt);
                const prev = messages[index - 1];
                const showDate = !prev || !isSameDay(new Date(prev.createdAt), date);

                return (
                    <div key={message._id}
                        id={`message-${message._id}`}>
                        {showDate && (
                            <div className="flex justify-center my-4">
                                <span className="px-4 py-1 text-xs text-gray-300 bg-white/10 rounded-full">
                                    {getDateLabel(date)}
                                </span>
                            </div>
                        )}

                        <div
                            className={`flex items-end gap-2 mt-5 ${message.senderId === authUser?._id
                                ? "justify-end"
                                : "flex-row-reverse justify-end"
                                }`}
                        >

                            {message.replyTo && (
                                <div className="mb-2 p-2 bg-black/40 rounded-lg border-l-4 border-violet-500 cursor-pointer hover:bg-black/60 transition"
                                    onClick={() => {
                                        const originalMsgElement = document.getElementById(`message-${message.replyTo?._id}`);
                                        if (originalMsgElement) {
                                            originalMsgElement.scrollIntoView({ behavior: "smooth", block: "center" });
                                            originalMsgElement.classList.add("highlight-reply");
                                            setTimeout(() => originalMsgElement.classList.remove("highlight-reply"), 2000);
                                        }
                                    }}
                                >
                                    <p className="text-xs text-gray-400">Replying to:</p>
                                    {message.replyTo.image ? (
                                        <p className="text-sm text-gray-300">📷 Photo</p>
                                    ) : (
                                        <p className="text-sm text-gray-300 truncate">
                                            {message.replyTo.text || "Empty message"}
                                        </p>
                                    )}
                                </div>
                            )}

                            {message.image ? (
                                <div className="relative group">
                                    <img
                                        src={message.image}
                                        onClick={() => onImageClick(message.image!)}
                                        className="max-w-[230px] rounded-lg cursor-pointer"
                                    />
                                    <button
                                        onClick={() => setReplyToMessage(message)}
                                        className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition bg-black/60 rounded-full p-1 cursor-pointer"
                                    >
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                        </svg>
                                    </button>
                                    {message.senderId === authUser?._id && (
                                        <button
                                            onClick={() => handleDelete(message._id)}
                                            className="absolute top-1 right-1 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                        >
                                            <img src={assets.delete_icon} className="w-4 invert" />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="relative group">
                                    <p className="p-3 max-w-[250px] text-sm bg-violet-500/30 rounded-xl text-white break-words">
                                        {message.text}
                                    </p>
                                    <button
                                        onClick={() => setReplyToMessage(message)}
                                        className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition bg-black/60 rounded-full p-1 cursor-pointer"
                                    >
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                        </svg>
                                    </button>
                                    {message.senderId === authUser?._id && (
                                        <button
                                            onClick={() => handleDelete(message._id)}
                                            className="absolute top-1 right-1 bg-black/60 rounded-full p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                                        >
                                            <img src={assets.delete_icon} className="w-4 invert" />
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="text-xs text-center">
                                <img
                                    src={
                                        message.senderId === authUser?._id
                                            ? authUser?.profilePic || assets.avatar_icon
                                            : selectedUser?.profilePic || assets.avatar_icon
                                    }
                                    className="w-7 rounded-full"
                                />
                                <p className="text-gray-500">
                                    {formatMessageTime(message.createdAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}

            {isTyping && (
                <div className="flex items-end gap-2 ">
                    <div className="flex items-center gap-2">
                        <img
                            src={selectedUser?.profilePic || assets.avatar_icon}
                            className="w-7 rounded-full"
                        />
                        <div className="p-3 max-w-[150px] bg-gray-700/80 rounded-xl">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}


            <div ref={scrollEndRef} />
        </div>
    );
});


export default ChatMessages;