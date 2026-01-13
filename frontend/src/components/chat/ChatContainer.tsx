// import { useEffect, useMemo, useRef, useState } from "react";
// import toast from "react-hot-toast";
// import assets from "../../assets/assets";

// import ChatMessages from "./ChatMessages";
// import ImagePreviewModal from "./ImagePreviewModal";
// import DeleteConfirmationModal from "./DeleteConfirmModal";
// import ImageUploadProgress from "./ImageUploadProgress";

// import { useChatStore, type Message } from "../../store/chat.store";
// import { useAuthStore } from "../../store/auth.store";
// import { useSocketStore } from "../../store/socket.store";

// const ChatContainer = () => {
//     const { getMessages, sendMessage, clearSelectedUser, deleteMessage } = useChatStore();
//     const authUser = useAuthStore((s) => s.authUser);
//     const onlineUsers = useSocketStore((s) => s.onlineUsers);

//     const selectedUser = useChatStore((s) => s.selectedUser);
//     const showRightSidebar = useChatStore((s) => s.showRightSidebar);
//     const setShowRightSidebar = useChatStore((s) => s.setShowRightSidebar);

//     const [input, setInput] = useState("");
//     const [previewImage, setPreviewImage] = useState<string | null>(null);
//     const scrollEnd = useRef<HTMLDivElement | null>(null);

//     const [isUploading, setIsUploading] = useState(false);
//     const [uploadProgress, setUploadProgress] = useState(0);
//     const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
//     const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

//     const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
//     const [messageToDelete, setMessageToDelete] = useState<string | null>(null);


//     const [previewFile, setPreviewFile] = useState<File | null>(null);

//     const messagesByConversation = useChatStore((s) => s.messagesByConversation);

//     useEffect(() => {
//         const socket = useSocketStore.getState().socket;

//         if (!socket) return;

//         socket.on("upload:started", () => {
//             setIsUploading(true);
//             setUploadProgress(0);

//             let progress = 0;
//             const interval = setInterval(() => {
//                 if (progress >= 90) {
//                     clearInterval(interval);
//                     return;
//                 }
//                 progress += Math.random() * 10 + 5;
//                 setUploadProgress(Math.min(progress, 90));
//             }, 300);
//         });

//         socket.on("upload:completed", () => {
//             setUploadProgress(100);
//             setTimeout(() => {
//                 setIsUploading(false);
//                 setUploadProgress(0);
//                 setPreviewFile(null);
//             }, 500);
//         });

//         return () => {
//             socket.off("upload:started");
//             socket.off("upload:completed");
//         };
//     }, []);

//     const handleTyping = () => {
//         if (!selectedUser) return;
//         const socket = useSocketStore.getState().socket;
//         if (socket) {
//             socket.emit("typing", selectedUser._id);
//         }
//     };

//     const handleStopTyping = () => {
//         if (!selectedUser) return;
//         const socket = useSocketStore.getState().socket;
//         if (socket) {
//             socket.emit("stopTyping", selectedUser._id);
//         }
//     };

//     useEffect(() => {
//         if (!input.trim()) {
//             handleStopTyping();
//             return;
//         }

//         handleTyping();

//         const timeout = setTimeout(() => {
//             handleStopTyping();
//         }, 1000); // Stop typing after 1 second of no input

//         return () => clearTimeout(timeout);
//     }, [input, selectedUser]);


//     useEffect(() => {
//         const socket = useSocketStore.getState().socket;
//         if (!socket) return;

//         socket.on("userTyping", (userId: string) => {
//             setTypingUsers((prev) => new Set(prev).add(userId));
//         });

//         socket.on("userStopTyping", (userId: string) => {
//             setTypingUsers((prev) => {
//                 const newSet = new Set(prev);
//                 newSet.delete(userId);
//                 return newSet;
//             });
//         });

//         return () => {
//             socket.off("userTyping");
//             socket.off("userStopTyping");
//         };
//     }, [selectedUser]);



//     const messages = useMemo(() => {
//         if (!selectedUser) return [];
//         return messagesByConversation[selectedUser._id] || [];
//     }, [selectedUser, messagesByConversation]);

//     useEffect(() => {
//         if (selectedUser) {
//             getMessages(selectedUser._id);
//             setShowRightSidebar(false);
//         }
//     }, [selectedUser, getMessages, setShowRightSidebar]);

//     useEffect(() => {
//         scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
//     }, [messages]);


//     const handleDelete = (messageId: string) => {
//         setMessageToDelete(messageId);
//         setDeleteConfirmOpen(true);
//     };

//     const handleSendMessage = async (e?: React.FormEvent) => {
//         e?.preventDefault();
//         if (!input.trim()) return;

//         try {
//             await sendMessage({
//                 text: input.trim(),
//                 replyTo: replyToMessage?._id,
//             });
//             setInput("");
//             setReplyToMessage(null);
//         } catch {
//             toast.error("Failed to send message");
//         }
//     };


//     const handleSendImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (!file) return;

//         if (!file.type.startsWith("image/")) {
//             toast.error("Please select an image file");
//             return;
//         }

//         if (file.size > 5 * 1024 * 1024) {
//             toast.error("Image too large (max 5MB)");
//             return;
//         }

//         setPreviewFile(file);

//         const reader = new FileReader();
//         reader.onloadend = async () => {
//             if (typeof reader.result !== "string") return;

//             setIsUploading(true);

//             try {
//                 await sendMessage({
//                     image: reader.result,
//                     replyTo: replyToMessage?._id,
//                 });
//                 setReplyToMessage(null);
//                 setPreviewFile(null);
//                 toast.success("Image sent!");
//             } catch {
//                 toast.error("Failed to send image");
//                 setPreviewFile(null);
//             } finally {
//                 setIsUploading(false);
//             }
//         };
//         reader.readAsDataURL(file);
//         e.target.value = "";
//     };



//     const removePreview = () => {
//         setPreviewFile(null);
//     };

//     const downloadImage = async (url: string) => {
//         try {
//             const res = await fetch(url);
//             const blob = await res.blob();
//             const blobUrl = URL.createObjectURL(blob);
//             const a = document.createElement("a");
//             a.href = blobUrl;
//             a.download = `image-${Date.now()}.jpg`;
//             a.click();
//             URL.revokeObjectURL(blobUrl);
//         } catch {
//             toast.error("Failed to download image");
//         }
//     };

//     if (!selectedUser) {
//         return (
//             <div className="flex flex-col justify-center items-center gap-2 text-gray-500 bg-white/10 max-md:hidden h-full">
//                 <img src={assets.logo_icon} className="w-16" />
//                 <p className="text-lg font-medium text-white">Chat anytime, anywhere...</p>
//             </div>
//         );
//     }

//     return (
//         <div className="h-full flex flex-col overflow-hidden relative">

//             <div
//                 onClick={() => setShowRightSidebar(!showRightSidebar)}
//                 className="flex items-center gap-3 py-3 px-4 border-b border-stone-500 cursor-pointer"
//             >
//                 <img src={selectedUser.profilePic || assets.avatar_icon} className="w-8 rounded-full" />
//                 <p className="flex-1 text-lg text-white flex items-center gap-2">
//                     {selectedUser.fullName}
//                     {onlineUsers.includes(selectedUser._id) && (
//                         <span className="w-2 h-2 rounded-full bg-green-500" />
//                     )}
//                 </p>
//                 <img
//                     onClick={(e) => {
//                         e.stopPropagation();
//                         clearSelectedUser();
//                     }}
//                     src={assets.arrow_icon}
//                     className="w-7 cursor-pointer md:hidden"
//                     alt="back to chats"
//                 />
//             </div>

//             <ChatMessages
//                 messages={messages}
//                 authUser={authUser}
//                 selectedUser={selectedUser}
//                 onImageClick={setPreviewImage}
//                 scrollEndRef={scrollEnd}
//                 handleDelete={handleDelete}
//                 typingUsers={typingUsers}
//                 setReplyToMessage={setReplyToMessage}
//             />

//             <form onSubmit={handleSendMessage} className="p-3 flex items-center gap-3 border-t border-stone-500 bg-black/40">
//                 <div className="flex-1 flex items-center bg-gray-100/12 rounded-full px-3">

//                     {replyToMessage && (
//                         <div className="mx-4 mb-2 p-3 bg-gray-800/50 rounded-lg border-l-4 border-violet-500 relative">
//                             <button onClick={() => setReplyToMessage(null)} className="absolute top-2 right-2 text-gray-400 hover:text-white">
//                                 ✕
//                             </button>
//                             <p className="text-xs text-violet-400 mb-1">Replying to:</p>
//                             {replyToMessage.image ? (
//                                 <p className="text-sm text-gray-300">📷 Photo</p>
//                             ) : (
//                                 <p className="text-sm text-gray-300 truncate">{replyToMessage.text || "Empty message"}</p>
//                             )}
//                         </div>
//                     )}

//                     <ImageUploadProgress
//                         progress={uploadProgress}
//                         isVisible={isUploading}
//                     />

//                     {previewFile && (
//                         <div className="flex gap-2.5 mb-2.5 overflow-x-auto pb-1">
//                             <div className="relative flex-shrink-0">
//                                 <img
//                                     src={URL.createObjectURL(previewFile)}
//                                     alt="preview"
//                                     className="w-16 h-16 object-cover rounded-lg border border-gray-600/50"
//                                 />
//                                 <button
//                                     onClick={removePreview}
//                                     className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md"
//                                 >
//                                     ×
//                                 </button>
//                             </div>
//                         </div>
//                     )}

//                     <input
//                         value={input}
//                         onChange={(e) => setInput(e.target.value)}
//                         onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage(e)}
//                         placeholder={isUploading ? "Uploading image..." : "Send Message"}
//                         className="flex-1 text-sm p-3 bg-transparent outline-none text-white"
//                         autoFocus
//                         disabled={isUploading}
//                     />

//                     <input
//                         type="file"
//                         id="image"
//                         accept="image/*"
//                         hidden
//                         onChange={handleSendImage}
//                         disabled={isUploading}
//                     />
//                     <label htmlFor="image">
//                         <img src={assets.gallery_icon} className={`w-6 ml-2 cursor-pointer opacity-80 hover:opacity-100 ${isUploading ? "opacity-40 cursor-not-allowed" : ""
//                             }`}
//                         />
//                     </label>
//                 </div>
//                 <button type="submit" disabled={isUploading || !input.trim()}>
//                     <img src={assets.send_button} className={`w-7 cursor-pointer ${isUploading || !input.trim() ? "opacity-50" : ""}`} />
//                 </button>
//             </form>

//             {/* IMAGE PREVIEW */}
//             {previewImage && (
//                 <ImagePreviewModal
//                     image={previewImage}
//                     onClose={() => setPreviewImage(null)}
//                     onDownload={downloadImage}
//                 />
//             )}

//             {/* DELETE CONFIRMATION */}
//             <DeleteConfirmationModal
//                 isOpen={deleteConfirmOpen}
//                 onClose={() => {
//                     setDeleteConfirmOpen(false);
//                     setMessageToDelete(null);
//                 }}
//                 onConfirm={() => {
//                     if (messageToDelete) {
//                         deleteMessage(messageToDelete);
//                     }
//                 }}
//             />
//         </div>
//     );
// };

// export default ChatContainer;
















import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import ChatMessages from "./ChatMessages";
import ImagePreviewModal from "./ImagePreviewModal";
import DeleteConfirmationModal from "./DeleteConfirmModal";

import { useChatStore, type Message } from "../../store/chat.store";
import { useAuthStore } from "../../store/auth.store";
import { useSocketStore } from "../../store/socket.store";
import assets from "../../assets/assets";

const ChatContainer = () => {
    const { getMessages, sendMessage, deleteMessage } = useChatStore();
    const authUser = useAuthStore((s) => s.authUser);
    const selectedUser = useChatStore((s) => s.selectedUser);
    const setShowRightSidebar = useChatStore((s) => s.setShowRightSidebar);
    const showRightSidebar = useChatStore((s) => s.showRightSidebar);


    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
    const [previewFile, setPreviewFile] = useState<File | null>(null);

    const messagesByConversation = useChatStore((s) => s.messagesByConversation);
    const scrollEnd = useRef<HTMLDivElement | null>(null);

    const socket = useSocketStore((s) => s.socket);

    // Upload socket listener
    useEffect(() => {
        // const socket = useSocketStore.getState().socket;

        if (!socket) return;

        socket.on("upload:started", () => {
            setIsUploading(true);
            setUploadProgress(0);
            // let progress = 0;
            // const interval = setInterval(() => {
            //     if (progress >= 90) {
            //         clearInterval(interval);
            //         return;
            //     }
            //     progress += Math.random() * 10 + 5;
            //     setUploadProgress(Math.min(progress, 90));
            // }, 300);
        });

        socket.on("upload:completed", () => {
            setUploadProgress(100);
            setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
                setPreviewFile(null);
            }, 500);
        });

        return () => {
            socket.off("upload:started");
            socket.off("upload:completed");
        };
    }, [socket]);

    // Typing listeners
    useEffect(() => {
        // const socket = useSocketStore.getState().socket;
        if (!socket) {
            console.log("❌ socket not ready yet (typing listener)");
            return;
        }

        console.log("🟢 attaching typing listeners");

        socket.on("userTyping", (userId: string) => {
            console.log("📥 userTyping received:", userId);
            setTypingUsers((prev) => new Set(prev).add(userId));
        });

        socket.on("userStopTyping", (userId: string) => {
            console.log("📥 userStopTyping received:", userId);
            setTypingUsers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        });

        return () => {
            console.log("🧹 removing typing listeners");
            socket.off("userTyping");
            socket.off("userStopTyping");
        };
    }, [socket]);

    // Load messages
    useEffect(() => {
        if (selectedUser) {
            getMessages(selectedUser._id);
            setShowRightSidebar(false);
        }
    }, [selectedUser, getMessages, setShowRightSidebar]);

    const messages = useMemo(() => {
        if (!selectedUser) return [];
        return messagesByConversation[selectedUser._id] || [];
    }, [selectedUser, messagesByConversation]);

    // Auto-scroll
    useEffect(() => {
        scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    const handleDelete = (messageId: string) => {
        setMessageToDelete(messageId);
        setDeleteConfirmOpen(true);
    };

    const handleSendText = async (text: string, replyTo?: string) => {
        await sendMessage({ text, replyTo });
    };

    const handleSendImage = async (file: File, replyTo?: string) => {
        setPreviewFile(file);

        setIsUploading(true);
        setUploadProgress(0);

        let progress = 0;
        const fakeInterval = setInterval(() => {
            progress += Math.random() * 12 + 5;     // random jumps 5–17%
            setUploadProgress(Math.min(progress, 92)); // cap at 92% until done
        }, 180);

        const reader = new FileReader();
        reader.onloadend = async () => {
            if (typeof reader.result !== "string") return;

            try {
                await sendMessage({
                    image: reader.result,
                    replyTo,
                });

                // Finish animation
                clearInterval(fakeInterval);
                setUploadProgress(100);
                toast.success("Image sent!");

                // Hide after showing 100% for a moment
                setTimeout(() => {
                    setIsUploading(false);
                    setUploadProgress(0);
                    setPreviewFile(null);
                }, 700); // 0.7s delay — enough to see completion
            } catch {
                clearInterval(fakeInterval);
                setIsUploading(false);
                setUploadProgress(0);
                toast.error("Failed to send image");
            } finally {
                setIsUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const downloadImage = async (url: string) => {
        try {
            const res = await fetch(url);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = `image-${Date.now()}.jpg`;
            a.click();
            URL.revokeObjectURL(blobUrl);
        } catch {
            toast.error("Failed to download image");
        }
    };

    if (!selectedUser) {
        return (
            <div className="flex flex-col justify-center items-center gap-2 text-gray-500 bg-white/10 max-md:hidden h-full">
                <img src={assets.logo_icon} className="w-16" />
                <p className="text-lg font-medium text-white">Chat anytime, anywhere...</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden relative">
            <ChatHeader setShowRightSidebar={setShowRightSidebar} showRightSidebar={showRightSidebar} />

            <ChatMessages
                messages={messages}
                authUser={authUser}
                selectedUser={selectedUser}
                onImageClick={setPreviewImage}
                scrollEndRef={scrollEnd}
                handleDelete={handleDelete}
                typingUsers={typingUsers}
                setReplyToMessage={setReplyToMessage}
            />

            <ChatInput
                replyToMessage={replyToMessage}
                setReplyToMessage={setReplyToMessage}
                isUploading={isUploading}
                previewFile={previewFile}
                setPreviewFile={setPreviewFile}
                uploadProgress={uploadProgress}
                onSendText={handleSendText}
                onSendImage={handleSendImage}
            />

            {previewImage && (
                <ImagePreviewModal
                    image={previewImage}
                    onClose={() => setPreviewImage(null)}
                    onDownload={downloadImage}
                />
            )}

            <DeleteConfirmationModal
                isOpen={deleteConfirmOpen}
                onClose={() => {
                    setDeleteConfirmOpen(false);
                    setMessageToDelete(null);
                }}
                onConfirm={() => {
                    if (messageToDelete) deleteMessage(messageToDelete);
                }}
            />
        </div>
    );
};

export default ChatContainer;