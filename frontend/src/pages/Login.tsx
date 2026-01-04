// import { useState } from "react";
// import assets from "../assets/assets"
// import { useAuth } from "../context/AuthContext";

// const Login = () => {

//     const [currState, setCurrState] = useState("Sign up");
//     const [fullName, setFullName] = useState("");
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [bio, setBio] = useState("");
//     const [isDataSubmitted, setIsDataSubmitted] = useState(false);

//     const { login } = useAuth();

//     const onSumitHandler = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (currState === "Sign up" && !isDataSubmitted) {
//             setIsDataSubmitted(true);
//             return
//         }
//         login(currState === "Sign up" ? "signup" : "login",
//             currState === "Sign up" ? { fullName, email, password, bio } : { email, password });
//     }

//     return (
//         <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">

//             {/* Left */}
//             <div className="flex justify-center items-center flex-col">
//                 <img src={assets.logo_icon} alt="" className="w-20" />
//                 <p className="text-white">Chatlify</p>
//             </div>

//             {/* Right */}

//             <form onSubmit={onSumitHandler} className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg">

//                 <h2 className="font-medium text-2xl flex justify-between items-center">
//                     {currState}
//                     {isDataSubmitted && <img onClick={() => { setIsDataSubmitted(false); }} src={assets.arrow_icon} alt="" className="w-5 cursor-pointer" />}

//                 </h2>

//                 {currState === "Sign up" && !isDataSubmitted && (
//                     <input onChange={(e) => setFullName(e.target.value)} value={fullName} type="text" className="p-2 border border-gray-500 rounded-md focus:outline-none" placeholder="Full Name" required />
//                 )}

//                 {
//                     !isDataSubmitted && (
//                         <>
//                             <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Email" required />

//                             <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" className="p-2 border border-gray-500 rounded-md focus:outline-none" placeholder="Password" required />

//                         </>
//                     )}

//                 {
//                     currState === "Sign up" && isDataSubmitted && (
//                         <textarea onChange={(e) => setBio(e.target.value)} value={bio} className="p-2 border border-gray-500 rounded-md focus:outline-none" placeholder="Provide short Bio..." rows={4} required />
//                     )
//                 }

//                 <button type="submit" className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer">
//                     {
//                         currState === "Sign up" ? "Create Account" : "Login Now"
//                     }
//                 </button>

//                 <div className="flex items-center gap-2 text-sm text-gray-500">
//                     <input type="checkbox" />
//                     <p>Agree to the terms of use & privacy policy</p>
//                 </div>

//                 <div className="flex flex-col gap-2">
//                     {currState === "Sign up" ? (
//                         <p className="text-gray-600 text-sm">Already have an account? <span
//                             onClick={() => { setCurrState("Login"); setIsDataSubmitted(false); }} className="font-medium text-violet-500 cursor-pointer">Login</span></p>
//                     ) : (
//                         <p className="text-gray-600 text-sm">Create account <span
//                             onClick={() => { setCurrState("Sign up") }} className="font-medium text-violet-500 cursor-pointer">Sign up</span></p>
//                     )}
//                 </div>

//             </form>

//         </div>
//     )
// }

// export default Login

















import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import assets from "../assets/assets";
import { useAuth } from "../context/AuthContext";

/* ===================== TYPES ===================== */

type AuthMode = "login" | "signup";

/* ===================== ZOD SCHEMA ===================== */

const baseSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = baseSchema.extend({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    bio: z.string().min(10, "Bio must be at least 10 characters"),
});


type FormValues = LoginValues & Partial<SignupValues>;
type LoginValues = z.infer<typeof baseSchema>;
type SignupValues = z.infer<typeof signupSchema>;



const Login = () => {
    const { login } = useAuth();

    const [mode, setMode] = useState<AuthMode>("signup");
    const [stepTwo, setStepTwo] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(mode === "signup" && stepTwo ? signupSchema : baseSchema),
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
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = form;

    const email = watch("email");
    const password = watch("password");


    const onSubmit = async (data: FormValues) => {
        if (mode === "signup" && !stepTwo) {
            setStepTwo(true);
            return;
        }

        await login(
            mode,
            mode === "signup"
                ? {
                    fullName: data.fullName?.trim() || "",
                    email: data.email.trim(),
                    password: data.password,
                    bio: data.bio?.trim(),
                }
                : {
                    email: data.email.trim(),
                    password: data.password,
                }
        );

        reset();
        setStepTwo(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="backdrop-blur-md rounded-2xl shadow-xl max-w-md w-full p-8 flex flex-col gap-6 border border-white/20"
            >
                {/* Logo */}
                <div className="flex flex-col items-center mb-4">
                    <img src={assets.logo_icon} alt="logo" className="w-16 h-16 mb-2" />
                    <h1 className="text-3xl font-bold text-white tracking-tight">Chatlify</h1>
                </div>

                {/* Title */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-white">
                        {mode === "signup" ? "Sign Up" : "Login"}
                    </h2>
                    {stepTwo && (
                        <button
                            type="button"
                            className="text-white hover:text-gray-300 transition cursor-pointer"
                            onClick={() => setStepTwo(false)}
                        >
                            Back
                        </button>
                    )}
                </div>

                {/* Full Name */}

                {!stepTwo && (
                    <>
                        {mode === "signup" && !stepTwo && (
                            <div className="flex flex-col">
                                <input
                                    placeholder="Full Name"
                                    className="input bg-white/20 placeholder-white text-white focus:ring-2 focus:ring-violet-400 focus:outline-none rounded-lg px-4 py-2"
                                    {...register("fullName", { required: "Full name is required" })}
                                />
                                {errors.fullName && <p className="text-red-300 text-sm">{errors.fullName.message}</p>}
                            </div>
                        )}

                        <div className="flex flex-col gap-1">
                            <input
                                type="email"
                                placeholder="Email"
                                className="input bg-white/20 placeholder-white text-white focus:ring-2 focus:ring-violet-400 focus:outline-none rounded-lg px-4 py-2"
                                {...register("email", { required: "Email is required" })}
                            />
                            {errors.email && <p className="text-red-300 text-sm">{errors.email.message}</p>}

                            <input
                                type="password"
                                placeholder="Password"
                                className="input bg-white/20 placeholder-white text-white focus:ring-2 focus:ring-violet-400 focus:outline-none rounded-lg px-4 py-2 mt-4"
                                {...register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
                            />
                            {errors.password && <p className="text-red-300 text-sm">{errors.password.message}</p>}

                        </div>
                    </>
                )}


                {mode === "signup" && stepTwo && (
                    <>
                        <div className="flex flex-col gap-1">
                            <textarea
                                placeholder="Short bio..."
                                rows={4}
                                className="input bg-white/20 placeholder-white text-white focus:ring-2 focus:ring-violet-400 focus:outline-none rounded-lg px-4 py-2 mt-4"
                                {...register("bio")}
                            />
                            {errors.bio && (
                                <p className="text-yellow-300 text-sm">{errors.bio.message}</p>
                            )}
                        </div>
                    </>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting || (mode === "login" && (!email || !password))}
                    className="w-full py-3 bg-violet-500 hover:bg-violet-600 transition rounded-lg font-semibold text-white disabled:opacity-50 cursor-pointer"
                >
                    {mode === "signup" ? (stepTwo ? "Create Account" : "Next") : "Login"}
                </button>

                <p className="text-sm text-center text-white/80 mt-2">
                    {mode === "signup" ? (
                        <>
                            Already have an account?{" "}
                            <span className="text-violet-400 cursor-pointer hover:underline" onClick={() => { setMode("login"); setStepTwo(false); reset() }}>
                                Login
                            </span>
                        </>
                    ) : (
                        <>
                            New here?{" "}
                            <span className="text-violet-400 cursor-pointer hover:underline" onClick={() => { setMode("signup"); reset(); }}>
                                Sign up
                            </span>
                        </>
                    )}
                </p>
            </form>
        </div>
    );
};


export default Login;