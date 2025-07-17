import React, { useEffect, useState } from "react";
import axios from "axios";
import { useThemeProvider } from "../../utils/ThemeContext";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuthStore } from "../../store/authentication";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { currentTheme } = useThemeProvider();
    const navigate = useNavigate();

    const {
        login,
        loginDetails
    } = useAuthStore((s) => s);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

   

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            return setError("Both fields are required");
        }
        try {
            setLoading(true);
            await login(form)
        } catch (err) {
            console.log(err, "errrrrrrrrrr")
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${currentTheme === "dark" ? "bg-[#18181b]" : "bg-[#f5f5f5]"
                }`}
        >
            <div
                className={`flex w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md bg-opacity-60 transition-colors duration-300 ${currentTheme === "dark"
                    ? "bg-[#23232a]/80 text-white"
                    : "bg-white/80 text-black"
                    }`}
                style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" }}
            >
                {/* Left: Logo */}
                <div
                    className={`hidden md:flex flex-col items-center justify-center w-1/2 p-8 transition-colors duration-300 ${currentTheme === "dark" ? "bg-[#18181b]/60" : "bg-[#f5f5f5]/60"
                        }`}
                >
                    <img
                        src="/images/logos/Login.png"
                        alt="Logo"
                        className="w-40 h-40 object-contain mb-4 drop-shadow-lg"
                    />
                    <h2 className="text-3xl font-bold mb-2">Welcome Back!</h2>
                    <p className="text-base text-gray-400 text-center">
                        Sign in to access your dashboard
                    </p>
                </div>
                {/* Right: Login Form */}
                <div className="flex-1 flex flex-col justify-center p-8">
                    <div className="mb-8 text-center md:hidden">
                        <img
                            src="/images/logos/Login.png"
                            alt="Logo"
                            className="w-20 h-20 mx-auto mb-2 drop-shadow-lg"
                        />
                        <h2 className="text-2xl font-bold">Sign In</h2>
                        <p className="text-sm text-gray-400">Access your dashboard</p>
                    </div>
                    {error && (
                        <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <span className="absolute left-3 top-11 text-gray-400">
                                <FiMail />
                            </span>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className={`w-full mt-1 pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 transition-colors duration-300 ${currentTheme === "dark"
                                    ? "bg-[#18181b] border border-gray-700 text-white placeholder-gray-400 focus:ring-white"
                                    : "border border-gray-300 text-black placeholder-gray-400 focus:ring-black"
                                    }`}
                                placeholder="you@example.com"
                                autoComplete="username"
                                onBlur={() => setEmailTouched(true)}
                            />
                        </div>
                        {/* Show password field only after email is filled and valid */}
                        {(form.email && /^[^\s@]+@[^\s@]+\.(com)(?:\s*)$/.test(form.email)) && (
                            <div className="relative animate-fade-in">
                                <label className="block text-sm font-medium mb-1">Password</label>
                                <span className="absolute left-3 top-11 text-gray-400">
                                    <FiLock />
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className={`w-full mt-1 pl-10 pr-10 py-2 rounded-xl focus:outline-none focus:ring-2 transition-colors duration-300 ${currentTheme === "dark"
                                        ? "bg-[#18181b] border border-gray-700 text-white placeholder-gray-400 focus:ring-white"
                                        : "border border-gray-300 text-black placeholder-gray-400 focus:ring-black"
                                        }`}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    className="absolute right-3 top-11 text-gray-400 focus:outline-none"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        )}
                        <div className="flex items-center justify-between">
                            <div></div>
                            <a
                                href="#"
                                className="text-sm text-blue-500 hover:underline focus:outline-none"
                            >
                                Forgot password?
                            </a>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 rounded-xl font-semibold transition-colors duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${currentTheme === "dark"
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
