import { useEffect, useState } from "react";
import assets from "../assets/assets";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

interface Props {
    mobile?: boolean;
    onClose?: () => void;
}

const RightSidebar = ({ mobile, onClose }: Props) => {
    const { selectedUser, messages } = useChat();
    const { logout, onlineUser } = useAuth();
    const [msgImages, setMsgImages] = useState<string[]>([]);

    useEffect(() => {
        setMsgImages(messages.filter((m: any) => m.image).map((m: any) => m.image));
    }, [messages]);

    if (!selectedUser) return null;

    return (
        <div
            className={`
        bg-[#8185B2]/10 text-white
        ${mobile
                    ? "absolute inset-0 z-50"
                    : "relative w-full"}
        overflow-y-auto
        flex flex-col h-full
      `}
        >
            {/* Header */}
            <div className="flex-1">
                <div className="flex items-center justify-between p-4">
                    <h2 className="text-lg font-semibold">Profile</h2>
                    <button onClick={onClose}>
                        <img src={assets.arrow_icon} className="w-6 md:hidden" />
                    </button>
                </div>

                <div className="flex flex-col items-center gap-2 px-6">
                    <img
                        src={selectedUser.profilePic || assets.avatar_icon}
                        className="w-20 rounded-full"
                    />
                    <p className="text-lg flex items-center gap-2">
                        {onlineUser.includes(selectedUser._id) && (
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        )}
                        {selectedUser.fullName}
                    </p>
                    <p className="text-sm text-center opacity-80">{selectedUser.bio}</p>
                </div>

                <hr className="my-4 border-white/20" />

                <div className="px-4">
                    <p className="text-xs mb-2">Media</p>
                    <div className="grid grid-cols-3 gap-2 overflow-y-auto">
                        {msgImages.map((img, i) => (
                            <img key={i} src={img} className="rounded-md cursor-pointer" />
                        ))}
                    </div>
                </div>
            </div>

            <button
                onClick={logout}
                className=" mt-auto mb-6 mx-auto block bg-violet-600 px-10 py-2 rounded-full text-sm"
            >
                Logout
            </button>

        </div>
    );
};

export default RightSidebar;