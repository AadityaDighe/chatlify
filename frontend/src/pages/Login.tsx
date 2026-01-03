import { useState } from "react";
import assets from "../assets/assets"
import { useAuth } from "../context/AuthContext";

const Login = () => {

    const [currState, setCurrState] = useState("Sign up");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [bio, setBio] = useState("");
    const [isDataSubmitted, setIsDataSubmitted] = useState(false);

    const { login } = useAuth();

    const onSumitHandler = (e: React.FormEvent) => {
        e.preventDefault();
        if (currState === "Sign up" && !isDataSubmitted) {
            setIsDataSubmitted(true);
            return
        }
        login(currState === "Sign up" ? "signup" : "login",
            currState === "Sign up" ? { fullName, email, password, bio } : { email, password });
    }

    return (
        <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">

            {/* Left */}
            <div className="flex justify-center items-center flex-col">
                <img src={assets.logo_icon} alt="" className="w-20" />
                <p className="text-white">Chatlify</p>
            </div>

            {/* Right */}

            <form onSubmit={onSumitHandler} className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg">

                <h2 className="font-medium text-2xl flex justify-between items-center">
                    {currState}
                    {isDataSubmitted && <img onClick={() => { setIsDataSubmitted(false); }} src={assets.arrow_icon} alt="" className="w-5 cursor-pointer" />}

                </h2>

                {currState === "Sign up" && !isDataSubmitted && (
                    <input onChange={(e) => setFullName(e.target.value)} value={fullName} type="text" className="p-2 border border-gray-500 rounded-md focus:outline-none" placeholder="Full Name" required />
                )}

                {
                    !isDataSubmitted && (
                        <>
                            <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Email" required />

                            <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" className="p-2 border border-gray-500 rounded-md focus:outline-none" placeholder="Password" required />

                        </>
                    )}

                {
                    currState === "Sign up" && isDataSubmitted && (
                        <textarea onChange={(e) => setBio(e.target.value)} value={bio} className="p-2 border border-gray-500 rounded-md focus:outline-none" placeholder="Provide short Bio..." rows={4} required />
                    )
                }

                <button type="submit" className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer">
                    {
                        currState === "Sign up" ? "Create Account" : "Login Now"
                    }
                </button>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <input type="checkbox" />
                    <p>Agree to the terms of use & privacy policy</p>
                </div>

                <div className="flex flex-col gap-2">
                    {currState === "Sign up" ? (
                        <p className="text-gray-600 text-sm">Already have an account? <span
                            onClick={() => { setCurrState("Login"); setIsDataSubmitted(false); }} className="font-medium text-violet-500 cursor-pointer">Login</span></p>
                    ) : (
                        <p className="text-gray-600 text-sm">Create account <span
                            onClick={() => { setCurrState("Sign up") }} className="font-medium text-violet-500 cursor-pointer">Sign up</span></p>
                    )}
                </div>

            </form>

        </div>
    )
}

export default Login