import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import './index.css';

export default function Signup() {
    const [authError, setAuthError] = useState("");
    const [authLoading, setAuthLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
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

            // Fix: Check for the correct success message
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

    return (
        <div className="max-w-md ms-auto mt-16 p-8 bg-orange-50 border border-orange-200">
            <h2 className='text-3xl font-extrabold mb-6 text-center text-orange-600'>
                Signup
            </h2>

            {authError && (
                <div className="mb-3 text-center text-red-600 font-semibold">
                    {authError}
                </div>
            )}

            {success && (
                <div className="mb-3 text-center text-green-600 font-semibold">
                    Account created successfully! Redirecting to login...
                </div>
            )}

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    signup(username, password);
                }}
            >
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="p-3 border-2 border-orange-300 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Username"
                    required
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="p-3 border-2 border-orange-300 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Password"
                    required
                />

                <button
                    type="submit"
                    className='px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded w-full transition-colors duration-300'
                    disabled={authLoading}
                >
                    {authLoading ? "Signing up..." : "Signup"}
                </button>
            </form>

            <div className="mt-5 text-center text-gray-700">
                Already have an account?{" "}
                <Link to="/login">
                    <span className="text-orange-500 hover:underline font-semibold">Login</span>
                </Link>
            </div>
        </div>
    );
}