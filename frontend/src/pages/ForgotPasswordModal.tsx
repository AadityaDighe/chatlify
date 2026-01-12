import { useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/axios";

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ForgotPasswordModal = ({ isOpen, onClose }: ForgotPasswordModalProps) => {
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!forgotEmail.trim()) {
            toast.error("Please enter your email");
            return;
        }

        setForgotLoading(true);

        try {
            await api.post("/api/auth/forgot-password", { email: forgotEmail.trim() });
            toast.success("Reset link sent if email exists");
            onClose();
            setForgotEmail("");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to send reset link");
        } finally {
            setForgotLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/70 z-50" onClick={onClose} />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full">
                    <h2 className="text-2xl font-bold mb-6 text-white text-center">Forgot Password ?</h2>

                    <form onSubmit={handleForgotPassword}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-400 mb-6 focus:outline-none focus:ring-2 focus:ring-violet-400"
                            required
                        />

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 transition rounded-lg cursor-pointer text-white"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={forgotLoading}
                                className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 transition rounded-lg disabled:opacity-50 cursor-pointer text-white"
                            >
                                {forgotLoading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};