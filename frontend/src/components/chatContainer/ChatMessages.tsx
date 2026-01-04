import { memo } from "react";
import assets from "../../assets/assets";
import type { Message } from "../../context/ChatContext";

import {
    formatMessageTime,
    getDateLabel,
    isSameDay,
} from "../../lib/utils";

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
}

const ChatMessages = ({
    messages,
    authUser,
    selectedUser,
    onImageClick,
    scrollEndRef,
}: Props) => {
    return (
        <div className="flex-1 overflow-y-auto p-3 pb-6">
            {messages.map((message, index) => {
                const date = new Date(message.createdAt);
                const prev = messages[index - 1];

                const showDate =
                    !prev || !isSameDay(new Date(prev.createdAt), date);

                return (
                    <div key={index}>
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
                            {message.image ? (
                                <img
                                    src={message.image}
                                    onClick={() => onImageClick(message.image!)}
                                    className="max-w-[230px] rounded-lg cursor-pointer"
                                />
                            ) : (
                                <p className="p-2 max-w-[200px] text-sm bg-violet-500/30 rounded-lg text-white">
                                    {message.text}
                                </p>
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
            <div ref={scrollEndRef} />
        </div>
    );
};

export default memo(ChatMessages);
