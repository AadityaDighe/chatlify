import { useMemo, useState } from "react";
import assets from "../assets/assets";

import { useChatStore } from "../store/chat.store";
import { useAuthStore } from "../store/auth.store";
import { useSocketStore } from "../store/socket.store";

import ImagePreviewModal from "./chat/ImagePreviewModal";
import { ProfilePicPreviewModal } from "./chat/ProfilePicPreviewModal";

interface RightSidebarProps {
    mobile?: boolean;
}

const RightSidebar = ({ mobile = false }: RightSidebarProps) => {
    const selectedUser = useChatStore((s) => s.selectedUser);
    const messagesByConversation = useChatStore((s) => s.messagesByConversation);

    const setShowRightSidebar = useChatStore((s) => s.setShowRightSidebar);

    const logout = useAuthStore((s) => s.logout);
    const onlineUsers = useSocketStore((s) => s.onlineUsers);

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [showAllMedia, setShowAllMedia] = useState(false); // ← new state for full media view

    const messages = useMemo(() => {
        if (!selectedUser) return [];
        return messagesByConversation[selectedUser._id] || [];
    }, [selectedUser, messagesByConversation]);

    const mediaImages = useMemo(() => {
        return messages
            .filter((m) => m.image)
            .map((m) => m.image!);
    }, [messages]);

    // Show only first 6 initially
    const visibleMedia = showAllMedia ? mediaImages : mediaImages.slice(0, 6);
    const hasMore = mediaImages.length > 6;

    if (!selectedUser) return null;

    const profilePicSrc = selectedUser.profilePic || assets.avatar_icon;

    return (
        <aside
            className={`
        bg-[#0f0f1a] text-white flex flex-col h-full overflow-y-auto
        ${mobile ? "absolute inset-0 z-50" : "relative w-full border-l border-gray-700/40"}
      `}
        >
            <header className="flex items-center justify-between p-4 border-b border-white/10 bg-black/30">
                <h2 className="text-lg font-semibold">Profile</h2>
                <button
                    onClick={() => setShowRightSidebar(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                    aria-label="Close profile"
                >
                    <img src={assets.arrow_icon} className="w-6" alt="back" />
                </button>
            </header>

            <section className="flex flex-col items-center gap-3 px-6 py-8">
                <button
                    onClick={() => setProfilePreview(profilePicSrc)}
                    className="focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-full transition-transform hover:scale-105 active:scale-100"
                    aria-label="View profile picture full size"
                >
                    <img
                        src={profilePicSrc}
                        alt={selectedUser.fullName}
                        className="w-24 h-24 rounded-full object-cover border-2 border-violet-500/30 shadow-lg cursor-zoom-in"
                    />
                </button>

                <p className="flex items-center gap-2.5 text-xl font-semibold">
                    {onlineUsers.includes(selectedUser._id) && (
                        <span className="w-3 h-3 bg-green-500 rounded-full ring-2 ring-green-500/40" />
                    )}
                    {selectedUser.fullName}
                </p>

                {selectedUser.bio && (
                    <p className="text-sm text-center text-gray-300 max-w-xs leading-relaxed">
                        {selectedUser.bio}
                    </p>
                )}
            </section>

            <hr className="border-white/10 mx-6" />

            <section className="px-6 py-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs uppercase tracking-wide opacity-70 font-medium">
                        Shared Media ({mediaImages.length})
                    </p>

                    {hasMore && !showAllMedia && (
                        <button
                            onClick={() => setShowAllMedia(true)}
                            className="text-xs text-violet-400 hover:text-violet-300 transition font-medium cursor-pointer"
                        >
                            View All →
                        </button>
                    )}
                </div>

                {mediaImages.length === 0 ? (
                    <p className="text-sm opacity-60 italic text-center py-6">
                        No media shared yet
                    </p>
                ) : (
                    <>
                        {!showAllMedia && (
                            <div className="grid grid-cols-3 gap-3">
                                {visibleMedia.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`Shared media ${idx + 1}`}
                                        className="rounded-lg cursor-pointer object-cover aspect-square hover:opacity-90 transition-all shadow-sm hover:shadow-md hover:scale-[1.02]"
                                        onClick={() => setPreviewImage(img)}
                                    />
                                ))}
                            </div>
                        )}

                        {showAllMedia && (
                            <div className="flex flex-col flex-1 max-h-80">
                                <div className="flex items-center justify-between mb-4 sticky top-0 bg-[#0f0f1a] z-10 py-2">
                                    <p className="text-sm font-medium">All Shared Media</p>
                                    <button
                                        onClick={() => setShowAllMedia(false)}
                                        className="text-sm text-violet-400 hover:text-violet-300 transition cursor-pointer"
                                    >
                                        Back to overview
                                    </button>
                                </div>

                                <div className="grid grid-cols-3 gap-3 overflow-y-auto flex-1 pr-2">
                                    {mediaImages.map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`Shared media ${idx + 1}`}
                                            className="rounded-lg cursor-pointer object-cover aspect-square hover:opacity-90 transition-all shadow-sm hover:shadow-md hover:scale-[1.02]"
                                            onClick={() => setPreviewImage(img)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </section>

            <footer className="mt-auto py-6 flex justify-center border-t border-white/10 bg-black/20">
                <button
                    onClick={logout}
                    className="bg-violet-600 hover:bg-violet-700 transition px-10 py-2.5 rounded-full text-sm font-medium cursor-pointer shadow-md"
                >
                    Logout
                </button>
            </footer>

            {profilePreview && (
                <ProfilePicPreviewModal
                    image={profilePreview}
                    onClose={() => setProfilePreview(null)}
                />
            )}

            {previewImage && (
                <ImagePreviewModal
                    image={previewImage}
                    onClose={() => setPreviewImage(null)}
                    onDownload={(url) => window.open(url, "_blank")}
                />
            )}
        </aside>
    );
};

export default RightSidebar;