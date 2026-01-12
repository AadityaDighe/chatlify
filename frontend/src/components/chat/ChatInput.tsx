import { useState } from "react";
import toast from "react-hot-toast";
import assets from "../../assets/assets";

import { type Message } from "../../store/chat.store";
import ImageUploadProgress from "./ImageUploadProgress";

interface ChatInputProps {
  replyToMessage: Message | null;
  setReplyToMessage: (msg: Message | null) => void;
  isUploading: boolean;
  previewFile: File | null;
  setPreviewFile: React.Dispatch<React.SetStateAction<File | null>>;
  uploadProgress: number;
  onSendText: (text: string, replyTo?: string) => Promise<void>;
  onSendImage: (file: File, replyTo?: string) => Promise<void>;
}

export const ChatInput = ({
  replyToMessage,
  setReplyToMessage,
  isUploading,
  previewFile,
  setPreviewFile,
  uploadProgress,
  onSendText,
  onSendImage,
}: ChatInputProps) => {
  const [input, setInput] = useState("");

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    try {
      await onSendText(input.trim(), replyToMessage?._id);
      setInput("");
      setReplyToMessage(null);
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleSendImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large (max 5MB)");
      return;
    }

    setPreviewFile(file);

    try {
      await onSendImage(file, replyToMessage?._id);
      setReplyToMessage(null);
    } catch {
      toast.error("Failed to send image");
    } finally {
      setPreviewFile(null);
      e.target.value = "";
    }
  };

  const removePreview = () => setPreviewFile(null);

  return (
    <form
      onSubmit={handleSendMessage}
      className="p-3 flex items-center gap-3 border-t border-stone-500 bg-black/40"
    >
      <div className="flex-1 flex flex-col bg-gray-100/12 rounded-full px-3 pt-2 pb-1">

        {replyToMessage && (
          <div className="mx-4 mb-2 p-3 bg-gray-800/50 rounded-lg border-l-4 border-violet-500 relative">
            <button
              type="button"
              onClick={() => setReplyToMessage(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <p className="text-xs text-violet-400 mb-1">Replying to:</p>
            {replyToMessage.image ? (
              <p className="text-sm text-gray-300">📷 Photo</p>
            ) : (
              <p className="text-sm text-gray-300 truncate">
                {replyToMessage.text || "Empty message"}
              </p>
            )}
          </div>
        )}

        <ImageUploadProgress progress={uploadProgress} isVisible={isUploading} />

        {previewFile && (
          <div className="flex gap-2.5 mb-2 overflow-x-auto pb-1">
            <div className="relative flex-shrink-0">
              <img
                src={URL.createObjectURL(previewFile)}
                alt="preview"
                className="w-16 h-16 object-cover rounded-lg border border-gray-600/50"
              />
              <button
                type="button"
                onClick={removePreview}
                className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage(e)}
            placeholder={isUploading ? "Uploading image..." : "Send Message"}
            className="flex-1 text-sm p-3 bg-transparent outline-none text-white"
            autoFocus
            disabled={isUploading}
          />

          <input
            type="file"
            id="image"
            accept="image/*"
            hidden
            onChange={handleSendImage}
            disabled={isUploading}
          />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              className={`w-6 ml-2 cursor-pointer opacity-80 hover:opacity-100 ${isUploading ? "opacity-40 cursor-not-allowed" : ""
                }`}
              alt="attach image"
            />
          </label>
        </div>
      </div>

      <button type="submit" disabled={isUploading || !input.trim()}>
        <img
          src={assets.send_button}
          className={`w-7 cursor-pointer ${isUploading || !input.trim() ? "opacity-50" : ""}`}
          alt="send"
        />
      </button>
    </form>
  );
};