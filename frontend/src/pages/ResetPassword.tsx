import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/axios";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            toast.error("Passwords don't match");
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post(`/api/auth/reset-password/${token}`, { password });
            if (data.success) {
                toast.success("Password reset successful! Login now.");
                navigate("/login");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Reset failed");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <form onSubmit={handleSubmit} className="bg-white/10 p-8 rounded-xl">
                <h2 className="text-2xl mb-6">Reset Password</h2>
                <input
                    type="password"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 rounded mb-4"
                    required
                    minLength={6}
                />
                <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full p-3 rounded mb-6"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-violet-600 rounded"
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;