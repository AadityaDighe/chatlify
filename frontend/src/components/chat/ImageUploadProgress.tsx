interface ImageUploadProgressProps {
    progress: number;
    isVisible: boolean;
}

export default function ImageUploadProgress({
    progress,
    isVisible,
}: ImageUploadProgressProps) {
    if (!isVisible) return null;

    const displayedProgress = Math.min(Math.round(progress), 100);

    return (

        <div className="flex items-center gap-4">
            <div className="relative">
                <div className="w-10 h-10 border-4 border-gray-600 border-t-violet-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-violet-300">{displayedProgress}</span>
                </div>
            </div>

            <div className="flex-1">
                <p className="text-sm text-white font-medium mb-1.5">Sending image...</p>
                <div className="relative h-2.5 bg-gray-700/60 rounded-full overflow-hidden">
                    <div
                        className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 transition-all duration-500 ease-out"
                        style={{ width: `${displayedProgress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}