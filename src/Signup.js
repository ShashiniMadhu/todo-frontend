import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import './index.css';

export default function Signup() {
    const [authError, setAuthError] = useState("");
    const [authLoading, setAuthLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const signup = async (username, password) => {
        setAuthLoading(true);
        setAuthError("");
        setSuccess(false);

        try {
            const response = await fetch("https://todo-backend-06ap.onrender.com/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            setAuthLoading(false);

            if (response.ok && data.message === "User registered successfully") {
                setSuccess(true);
                setTimeout(() => {
                    navigate("/login");
                }, 1500);
            } else {
                setAuthError(data.message || data.error || "Signup failed");
            }
        } catch (error) {
            setAuthLoading(false);
            setAuthError("Network error. Please try again.");
            console.error("Signup error:", error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Basic validation
        if (password !== confirmPassword) {
            setAuthError("Passwords do not match");
            return;
        }
        
        if (password.length < 6) {
            setAuthError("Password must be at least 6 characters long");
            return;
        }
        
        signup(username, password);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Brand */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-3xl text-white">✓</span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                        TaskMaster Pro
                    </h1>
                    <p className="text-gray-600 mt-2">Create your account to get started.</p>
                </div>

                {/* Signup Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
                    <h2 className='text-2xl font-bold mb-6 text-center text-gray-800'>
                        Create Account
                    </h2>

                    {authError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <div className="flex items-center">
                                <span className="text-red-500 mr-2">⚠️</span>
                                <span className="text-red-700 font-medium">{authError}</span>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                            <div className="flex items-center">
                                <span className="text-green-500 mr-2">✅</span>
                                <span className="text-green-700 font-medium">
                                    Account created successfully! Redirecting to login...
                                </span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400">👤</span>
                                </div>
                                <input 
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
                                    placeholder="Choose a username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400">🔒</span>
                                </div>
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
                                    placeholder="Create a password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <span className="text-gray-400 hover:text-gray-600 transition-colors">
                                        {showPassword ? "🙈" : "👁️"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400">🔐</span>
                                </div>
                                <input 
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
                                    placeholder="Confirm your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <span className="text-gray-400 hover:text-gray-600 transition-colors">
                                        {showConfirmPassword ? "🙈" : "👁️"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={authLoading}
                            className='w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
                        >
                            {authLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Creating Account...
                                </div>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{" "}
                            <Link 
                                to="/login" 
                                className="text-orange-500 hover:text-orange-600 font-semibold hover:underline transition-colors"
                            >
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-500 text-sm">
                    <p>© 2025 TaskMaster Pro. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}