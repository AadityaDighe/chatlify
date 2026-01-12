import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import assets from "../assets/assets";
import { useAuthStore } from "../store/auth.store";
import toast from "react-hot-toast";
import { ForgotPasswordModal } from "./ForgotPasswordModal";

type AuthMode = "login" | "signup";

// Schemas
const baseSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = baseSchema.extend({
    fullName: z
        .string()
        .min(2, "Full name must be at least 2 characters")
        .max(30, "Full name cannot exceed 30 characters"),
    bio: z
        .string()
        .min(3, "Bio must be at least 3 characters")
        .max(25, "Bio cannot exceed 25 characters")
        .optional(),
});


type LoginFormData = z.infer<typeof baseSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

type FormData = LoginFormData & Partial<SignupFormData>;

const Login = () => {
    const login = useAuthStore((s) => s.login);

    const [mode, setMode] = useState<AuthMode>("signup");
    const [showForgotModal, setShowForgotModal] = useState(false);

    const isSignup = mode === "signup";

    const form = useForm<FormData>({
        resolver: zodResolver(isSignup ? signupSchema : baseSchema),
        defaultValues: {
            email: "",
            password: "",
            fullName: "",
            bio: "",
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = form;

    const onSubmit = async (data: FormData) => {
        try {
            if (isSignup) {
                const signupData = data as SignupFormData;
                await login("signup", {
                    fullName: signupData.fullName.trim(),
                    email: signupData.email.trim(),
                    password: signupData.password,
                    bio: signupData.bio?.trim() || "",
                });
            } else {
                const loginData = data as LoginFormData;
                await login("login", {
                    email: loginData.email.trim(),
                    password: loginData.password,
                });
            }

            reset();
        } catch (err: any) {
            const msg = err?.response?.data?.message;
            if (msg && (msg.includes("Invalid") || msg.includes("credentials"))) {
                toast.error("Invalid email or password", { icon: "❌" });
            } else if (msg) {
                toast.error(msg);
            } else {
                toast.error("Something went wrong. Please try again.");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="backdrop-blur-md rounded-2xl shadow-xl max-w-md w-full p-8 flex flex-col gap-6 border border-white/20"
            >
                <div className="flex flex-col items-center mb-4">
                    <img src={assets.logo_icon} alt="logo" className="w-16 h-16 mb-2" />
                    <h1 className="text-3xl font-bold text-white tracking-tight">Chatlify</h1>
                </div>

                {isSignup && (
                    <div className="flex flex-col">
                        <input
                            placeholder="Full Name"
                            className="input bg-white/20 placeholder-white text-white focus:ring-2 focus:ring-violet-400 focus:outline-none rounded-lg px-4 py-2"
                            {...register("fullName")}
                        />
                        {errors.fullName && <p className="text-red-300 text-sm mt-1">{errors.fullName.message}</p>}
                    </div>
                )}

                <div className="flex flex-col">
                    <input
                        type="email"
                        placeholder="Email"
                        className="input bg-white/20 placeholder-white text-white focus:ring-2 focus:ring-violet-400 focus:outline-none rounded-lg px-4 py-2"
                        {...register("email")}
                    />
                    {errors.email && <p className="text-red-300 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div className="flex flex-col">
                    <input
                        type="password"
                        placeholder="Password"
                        className="input bg-white/20 placeholder-white text-white focus:ring-2 focus:ring-violet-400 focus:outline-none rounded-lg px-4 py-2"
                        {...register("password")}
                    />
                    {errors.password && <p className="text-red-300 text-sm mt-1">{errors.password.message}</p>}
                </div>

                {isSignup && (
                    <div className="flex flex-col">
                        <textarea
                            placeholder="Short bio (3-25 characters)"
                            rows={3}
                            className="input bg-white/20 placeholder-white text-white focus:ring-2 focus:ring-violet-400 focus:outline-none rounded-lg px-4 py-2"
                            {...register("bio")}
                        />
                        {errors.bio && <p className="text-red-300 text-sm mt-1">{errors.bio.message}</p>}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-violet-500 hover:bg-violet-600 transition rounded-lg font-semibold text-white disabled:opacity-50 cursor-pointer"
                >
                    {isSubmitting ? "Processing..." : isSignup ? "Create Account" : "Login"}
                </button>

                <p className="text-sm text-center text-white/80 mt-2">
                    {isSignup ? (
                        <>
                            Already have an account?{" "}
                            <span className="text-violet-200 cursor-pointer hover:underline" onClick={() => { setMode("login"); reset(); }}>
                                Login
                            </span>
                        </>
                    ) : (
                        <>
                            New here?{" "}
                            <span className="text-violet-200 cursor-pointer hover:underline" onClick={() => { setMode("signup"); reset(); }}>
                                Sign up
                            </span>
                        </>
                    )}
                </p>

                {!isSignup && (
                    <p className="text-sm text-center">
                        <span
                            className="text-violet-200 cursor-pointer hover:underline cursor-pointer"
                            onClick={() => setShowForgotModal(true)}
                        >
                            Forgot password?
                        </span>
                    </p>
                )}
            </form>

            <ForgotPasswordModal
                isOpen={showForgotModal}
                onClose={() => setShowForgotModal(false)}
            />
        </div>
    );
};

export default Login;