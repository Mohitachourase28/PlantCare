import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import hero from "../assets/image.png";

export default function AuthPanel() {
  const [tab, setTab] = useState("login");

  const navigate = useNavigate();
  const location = useLocation();

  // Handle login success
  const handleLogin = () => {
    // static login — add token
    localStorage.setItem("token", "12345");

    // redirect back to protected page OR upload page
    const redirectTo = location.state?.from || "/upload";
    navigate(redirectTo, { replace: true });
  };

  // Handle signup success
  const handleSignup = () => {
    // static signup — add token
    localStorage.setItem("token", "12345");

    // signup also redirects to /upload
    navigate("/upload", { replace: true });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      {/* LEFT SECTION */}
      <div className="relative hidden md:flex items-center justify-center p-12 bg-white">
        <div className="w-full h-full flex flex-col items-center justify-center gap-6">
          <img
            src={hero}
            alt="plant"
            className="w-56 h-56 rounded-full object-cover shadow-lg"
          />
          <h3 className="text-2xl font-semibold">Join our growing community</h3>
          <p className="text-sm text-gray-500 text-center max-w-xs">
            Connect with plant lovers and share your gardening journey.
          </p>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="py-12 px-8 bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow px-6 py-8">
            
            {/* LOGO */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex gap-2 items-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"
                    />
                  </svg>
                  <span className="font-bold text-gray-700">GardenTracker</span>
                </div>
                <p className="text-xs text-gray-400">
                  Grow Your Garden Journey With Us
                </p>
              </div>
            </div>

            {/* TABS */}
            <div className="mb-4 border-b border-gray-100">
              <nav className="flex gap-4">
                <button
                  className={`pb-3 ${
                    tab === "login"
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-400"
                  }`}
                  onClick={() => setTab("login")}
                >
                  Login
                </button>

                <button
                  className={`pb-3 ${
                    tab === "signup"
                      ? "text-green-600 border-b-2 border-green-600"
                      : "text-gray-400"
                  }`}
                  onClick={() => setTab("signup")}
                >
                  Sign Up
                </button>
              </nav>
            </div>

            {/* LOGIN FORM */}
            {tab === "login" ? (
              <form className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500">
                    Email Address
                  </label>
                  <input
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500">Password</label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <a href="#" className="text-green-600">
                    Forgot Password?
                  </a>
                </div>

                <button
                  type="button"
                  onClick={handleLogin}
                  className="w-full bg-green-600 text-white rounded-md py-2 text-sm font-medium"
                >
                  Log In
                </button>
              </form>
            ) : (
              /* SIGNUP FORM */
              <form className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500">
                    Full Name
                  </label>
                  <input
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500">
                    Email Address
                  </label>
                  <input
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500">Password</label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Create a password"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSignup}
                  className="w-full bg-green-600 text-white rounded-md py-2 text-sm font-medium"
                >
                  Sign Up
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            © 2025 GardenTracker. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
