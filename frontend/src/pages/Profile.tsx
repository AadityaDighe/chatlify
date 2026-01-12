import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import assets from "../assets/assets";
import { useAuthStore } from "../store/auth.store";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const Profile = () => {
    const authUser = useAuthStore((s) => s.authUser);
    const updateProfile = useAuthStore((s) => s.updateProfile);

    const navigate = useNavigate();

    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [name, setName] = useState(authUser?.fullName || "");
    const [bio, setBio] = useState(authUser?.bio || "");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const previewUrl = useMemo(() => {
        if (!selectedImage) return null;
        return URL.createObjectURL(selectedImage);
    }, [selectedImage]);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Only image files are allowed");
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            toast.error("Image size must be under 2MB");
            return;
        }

        setSelectedImage(file);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            if (!selectedImage) {
                await updateProfile({
                    fullName: name.trim(),
                    bio: bio.trim(),
                });
                navigate("/");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = async () => {
                if (typeof reader.result !== "string") {
                    toast.error("Failed to read image");
                    setIsSubmitting(false);
                    return;
                }

                await updateProfile({
                    profilePic: reader.result,
                    fullName: name.trim(),
                    bio: bio.trim(),
                });

                navigate("/");
            };

            reader.readAsDataURL(selectedImage);
        } catch {
            toast.error("Failed to update profile");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
            <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5 p-10 flex-1"
                >
                    <h3 className="text-lg">Edit Profile</h3>

                    <label
                        htmlFor="avatar"
                        className="flex items-center gap-3 cursor-pointer"
                    >
                        <input
                            type="file"
                            id="avatar"
                            accept="image/png, image/jpeg"
                            hidden
                            onChange={handleImageChange}
                        />

                        <img
                            src={
                                previewUrl ||
                                authUser?.profilePic ||
                                assets.avatar_icon
                            }
                            className="w-12 h-12 rounded-full"
                        />
                        <span>Upload profile picture</span>
                    </label>

                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        type="text"
                        required
                        placeholder="Enter Name"
                        className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />

                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Enter Bio"
                        rows={4}
                        className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="flex-1 py-2 bg-gray-700 rounded-md cursor-pointer"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-2 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer"
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>

                <img
                    src={
                        previewUrl ||
                        authUser?.profilePic ||
                        assets.avatar_icon
                    }
                    className="w-44 h-44 rounded-full object-cover"
                />
            </div>
        </div>
    );
};

export default Profile;
