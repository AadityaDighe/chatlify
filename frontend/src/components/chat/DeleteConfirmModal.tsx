import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
}: DeleteConfirmationModalProps) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        toast.success("Message deleted", { icon: "🗑️", duration: 2000 });
        onClose();
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/70 z-40"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="
            w-full max-w-md 
            bg-gray-900 border border-gray-700 
            rounded-2xl shadow-2xl
            p-7
          "
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                <svg
                                    className="w-7 h-7 text-red-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-white">Delete message?</h3>
                                <p className="text-sm text-gray-400 mt-1">
                                    This cannot be undone.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white p-1 cursor-pointer"
                            aria-label="Close"
                        >
                            <IoClose size={24} />
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-6 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl font-medium transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-1 py-3 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors shadow-md cursor-pointer"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}