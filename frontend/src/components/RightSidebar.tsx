// import { useEffect, useState } from "react";
// import assets from "../assets/assets";
// import { useAuth } from "../context/AuthContext";
// import { useChat } from "../context/ChatContext";

// interface Props {
//     mobile?: boolean;
//     onClose?: () => void;
// }

// const RightSidebar = ({ mobile, onClose }: Props) => {
//     const { selectedUser, messages } = useChat();
//     const { logout, onlineUser } = useAuth();
//     const [msgImages, setMsgImages] = useState<string[]>([]);

//     useEffect(() => {
//         setMsgImages(messages.filter((m: any) => m.image).map((m: any) => m.image));
//     }, [messages]);

//     if (!selectedUser) return null;

//     return (
//         <div
//             className={`
//         bg-[#8185B2]/10 text-white
//         ${mobile
//                     ? "absolute inset-0 z-50"
//                     : "relative w-full"}
//         overflow-y-auto
//         flex flex-col h-full
//       `}
//         >
//             {/* Header */}
//             <div className="flex-1">
//                 <div className="flex items-center justify-between p-4">
//                     <h2 className="text-lg font-semibold">Profile</h2>
//                     <button onClick={onClose}>
//                         <img src={assets.arrow_icon} className="w-6 md:hidden" />
//                     </button>
//                 </div>

//                 <div className="flex flex-col items-center gap-2 px-6">
//                     <img
//                         src={selectedUser.profilePic || assets.avatar_icon}
//                         className="w-20 rounded-full"
//                     />
//                     <p className="text-lg flex items-center gap-2">
//                         {onlineUser.includes(selectedUser._id) && (
//                             <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                         )}
//                         {selectedUser.fullName}
//                     </p>
//                     <p className="text-sm text-center opacity-80">{selectedUser.bio}</p>
//                 </div>

//                 <hr className="my-4 border-white/20" />

//                 <div className="px-4">
//                     <p className="text-xs mb-2">Media</p>
//                     <div className="grid grid-cols-3 gap-2 overflow-y-auto">
//                         {msgImages.map((img, i) => (
//                             <img key={i} src={img} className="rounded-md cursor-pointer" />
//                         ))}
//                     </div>
//                 </div>
//             </div>

//             <button
//                 onClick={logout}
//                 className=" mt-auto mb-6 mx-auto block bg-violet-600 px-10 py-2 rounded-full text-sm"
//             >
//                 Logout
//             </button>

//         </div>
//     );
// };

// export default RightSidebar;

















import { useEffect, useMemo, useState } from "react";
import assets from "../assets/assets";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import type { Message } from "../context/ChatContext";

interface RightSidebarProps {
    mobile?: boolean;
    onClose?: () => void;
}

const RightSidebar = ({ mobile = false, onClose }: RightSidebarProps) => {
    const { selectedUser, messages } = useChat();
    const { logout, onlineUser } = useAuth();

    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        if (!previewImage) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setPreviewImage(null);
        };

        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [previewImage]);

    const mediaImages = useMemo<string[]>(() => {
        return messages
            .filter((m): m is Message & { image: string } => typeof m.image === "string")
            .map((m) => m.image);
    }, [messages]);


    if (!selectedUser) return null;


    return (
        <aside
            className={`bg-[#8185B2]/10 text-white flex flex-col h-full overflow-y-auto
            ${mobile ? "absolute inset-0 z-50" : "relative w-full"}`}
        >

            <header className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold">Profile</h2>
                {mobile && (
                    <button onClick={onClose} aria-label="Close">
                        <img src={assets.arrow_icon} className="w-6" />
                    </button>
                )}
            </header>

            <section className="flex flex-col items-center gap-2 px-6 py-6">
                <img
                    src={selectedUser.profilePic || assets.avatar_icon}
                    alt={selectedUser.fullName}
                    className="w-20 h-20 rounded-full object-cover"
                />

                <p className="flex items-center gap-2 text-lg font-medium">
                    {onlineUser.includes(selectedUser._id) && (
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                    {selectedUser.fullName}
                </p>

                {selectedUser.bio && (
                    <p className="text-sm text-center opacity-80">
                        {selectedUser.bio}
                    </p>
                )}
            </section>

            <hr className="border-white/10 mx-4" />

            <section className="px-4 py-4">
                <p className="text-xs mb-2 uppercase tracking-wide opacity-70">
                    Media
                </p>

                {mediaImages.length === 0 ? (
                    <p className="text-xs opacity-50">No media shared</p>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {mediaImages.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt="media"
                                className="rounded-md cursor-pointer object-cover aspect-square hover:opacity-80"
                                onClick={() => setPreviewImage(img)}
                            />
                        ))}
                    </div>
                )}
            </section>

            <footer className="mt-auto py-6 flex justify-center border-t border-white/10">
                <button
                    onClick={logout}
                    className="bg-violet-600 hover:bg-violet-700 transition px-10 py-2 rounded-full text-sm font-medium"
                >
                    Logout
                </button>
            </footer>

            {/* IMAGE PREVIEW MODAL  */}
            {previewImage && (
                <div className="absolute inset-0 z-50 bg-black/90 flex flex-col">
                    <div className="flex items-center gap-2 p-4">
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="flex items-center gap-2 text-white cursor-pointer"
                        >
                            <img src={assets.arrow_icon} className="w-6" />
                            Back
                        </button>
                    </div>

                    <div className="flex-1 flex items-center justify-center">
                        <img
                            src={previewImage}
                            alt="preview"
                            className="max-h-[85%] max-w-[95%] object-contain rounded-lg"
                        />
                    </div>
                </div>
            )}
        </aside>
    );
};

export default RightSidebar;