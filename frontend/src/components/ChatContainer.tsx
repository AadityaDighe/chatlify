import { useEffect, useRef, useState } from "react"
import assets from "../assets/assets"
import { formatMessageTime, getDateLabel, isSameDay } from "../lib/utils";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

interface ChatContainerProps {
    showRightSidebar: boolean
    setShowRightSidebar: React.Dispatch<React.SetStateAction<boolean>>
}

const ChatContainer = ({
    setShowRightSidebar
}: ChatContainerProps) => {

    const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useChat()
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { authUser, onlineUser } = useAuth()

    const [input, setInput] = useState("")

    const scrollEnd = useRef<HTMLDivElement | null>(null);


    useEffect(() => {
        if (selectedUser) {
            getMessages(selectedUser._id)
        }
    }, [selectedUser])

    useEffect(() => {
        if (scrollEnd.current && messages) {
            scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async (e: any) => {
        e.preventDefault()
        if (input.trim() === "") return null
        await sendMessage({ text: input.trim() })
        setInput("")
    }


    // Handle send image

    const handleSendImage = async (e: any) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith("image/")) {
            toast.error("select an image file")
            return
        }

        const reader = new FileReader()
        reader.onloadend = async () => {
            await sendMessage({ image: reader.result })
            e.target.value = ""
        }
        reader.readAsDataURL(file)
    }

    useEffect(() => {
        const escHandler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setPreviewImage(null);
        };
        document.addEventListener("keydown", escHandler);
        return () => document.removeEventListener("keydown", escHandler);
    }, []);

    useEffect(() => {
        document.body.style.overflow = previewImage ? "hidden" : "auto";
    }, [previewImage]);


    const downloadImage = async (url: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();

            const blobUrl = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = blobUrl;

            // default filename (user can change it)
            a.download = `image-${Date.now()}.jpg`;

            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed", error);
            toast.error("Failed to download image");
        }
    };

    useEffect(() => {
        setShowRightSidebar(false)
    }, [selectedUser])

    return selectedUser ? (
        <div className={`h-full flex flex-col backdrop-blur-lg overflow-hidden ${previewImage ? "pointer-events-none" : ""
            }`}>

            {/* Header */}

            <div onClick={() => setShowRightSidebar(prev => !prev)} className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500 shrink-0 cursor-pointer">
                <img src={selectedUser.profilePic || assets.avatar_icon} alt="profile" className="w-8 rounded-full" />
                <p className="flex-1 text-lg text-white flex items-center gap-2 ">
                    {selectedUser.fullName}
                    {onlineUser.includes(selectedUser._id) && (
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    )}
                </p>
                <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="arrow" className="md:hidden max-w-7" />
                <img src={assets.arrow_icon} alt="help" className="max-md:hidden max-w-5 rotate-180 cursor-pointer" />
            </div>

            {/* Chat Area */}

            <div className="flex-1 overflow-y-auto p-3 pb-6">
                {messages.map((message: any, index: number) => {
                    const messageDate = new Date(message.createdAt);
                    const prevMessage = messages[index - 1];
                    const showDateSeparator =
                        !prevMessage ||
                        !isSameDay(
                            new Date(prevMessage.createdAt),
                            messageDate
                        );

                    return (
                        <div key={index}>
                            {/* Date Separator */}
                            {showDateSeparator && (
                                <div className="flex justify-center my-4">
                                    <span className="px-4 py-1 text-xs text-gray-300 bg-white/10 rounded-full">
                                        {getDateLabel(messageDate)}
                                    </span>
                                </div>
                            )}

                            {/* Message */}
                            <div
                                className={`flex items-end gap-2 justify-end ${message.senderId !== authUser?._id &&
                                    "flex-row-reverse"
                                    }`}
                            >
                                {message.image ? (
                                    <img
                                        src={message.image}
                                        onClick={() =>
                                            setPreviewImage(message.image)
                                        }
                                        alt="image"
                                        className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8 cursor-pointer hover:opacity-90"
                                    />
                                ) : (
                                    <p
                                        className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${message.senderId === authUser?._id
                                            ? "rounded-br-none"
                                            : "rounded-bl-none"
                                            }`}
                                    >
                                        {message.text}
                                    </p>
                                )}

                                <div className="text-center text-xs">
                                    <img
                                        src={
                                            message.senderId === authUser?._id
                                                ? authUser?.profilePic ||
                                                assets.avatar_icon
                                                : selectedUser?.profilePic ||
                                                assets.avatar_icon
                                        }
                                        alt=""
                                        className="w-7 rounded-full"
                                    />
                                    <p className="text-gray-500">
                                        {formatMessageTime(
                                            message.createdAt
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}


                <div ref={scrollEnd}></div>
            </div>

            {/* Bottom Area */}

            <div className="shrink-0 p-3 flex items-center gap-3 border-t border-stone-500 bg-black/40 backdrop-blur-md">
                <div className="flex-1 flex items-center bg-gray-100/12 rounded-full px-3">
                    <input onChange={(e) => setInput(e.target.value)} value={input}
                        onKeyDown={(e) => e.key === "Enter" ? handleSendMessage(e) : null}
                        type="text" placeholder="Send Message" className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400" />
                    <input onChange={handleSendImage} type="file" id="image" accept="image/png , image/jpeg" hidden />
                    <label htmlFor="image">
                        <img src={assets.gallery_icon} alt="" className="w-5 mr-2 cursor-pointer" />
                    </label>
                </div>
                <img onClick={handleSendMessage} src={assets.send_button} alt="" className="w-7 cursor-pointer" />
            </div>

            {previewImage && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col pointer-events-auto"
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}>
                    {/* Top Bar */}
                    <div className="flex items-center justify-between p-4 text-white">
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <img src={assets.arrow_icon} className="w-6" />
                            <span>Back</span>
                        </button>

                        <button
                            onClick={() => downloadImage(previewImage)}
                            className="text-sm bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 cursor-pointer"
                        >
                            Download
                        </button>
                    </div>

                    {/* Image */}
                    <div className="flex-1 flex items-center justify-center">
                        <img
                            src={previewImage}
                            className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain"
                            alt="preview"
                        />
                    </div>
                </div>
            )}


        </div>
    ) : (
        <div className="flex flex-col justify-center items-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
            <img src={assets.logo_icon} alt="logo" className="max-w-16" />
            <p className="text-lg font-medium text-white">Chat anytime, anywhere...</p>
        </div>
    )
}
export default ChatContainer