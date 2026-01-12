import { useEffect } from "react";
import assets from "../../assets/assets";

interface Props {
    image: string;
    onClose: () => void;
    onDownload: (url: string) => void;
}

const ImagePreviewModal = ({ image, onClose, onDownload }: Props) => {
    useEffect(() => {
        const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", esc);

        return () => {
            document.removeEventListener("keydown", esc);
        };
    }, []);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);


    return (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col">
            <div className="flex justify-between p-4 text-white">
                <button onClick={onClose} className="flex items-center gap-2 cursor-pointer">
                    <img src={assets.arrow_icon} className="w-6" />
                    Back
                </button>
                <button
                    onClick={() => onDownload(image)}
                    className="bg-white/10 px-4 py-2 rounded-full cursor-pointer"
                >
                    Download
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-hidden">
                <img
                    src={image}
                    className="max-h-[60vh] max-w-[90vw] rounded-lg object-contain"
                />
            </div>
        </div>
    );
};

export default ImagePreviewModal;
