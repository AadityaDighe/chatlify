interface ProfilePicPreviewModalProps {
    image: string;
    onClose: () => void;
}

export const ProfilePicPreviewModal = ({ image, onClose }: ProfilePicPreviewModalProps) => {
    return (
        <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={onClose}
        >
            <div
                className="relative max-w-[90vw] max-h-[90vh] p-4"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute -top-10 right-0 text-white bg-black/40 hover:bg-black/70 p-2 rounded-full transition cursor-pointer"
                    aria-label="Close preview"
                >
                    ✕
                </button>

                <img
                    src={image}
                    alt="Profile picture preview"
                    className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
                />
            </div>
        </div>
    );
};