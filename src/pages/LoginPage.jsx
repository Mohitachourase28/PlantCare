// src/pages/LoginPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Simple static login page (no Redux)
 * Credentials: user@test.com / password
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/landing";

  const [email, setEmail] = useState("user@test.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // if already logged in, redirect away
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate(from, { replace: true });
    }
  }, [navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // simulate a small delay like a real login request
    setTimeout(() => {
      // static credential check
      if (email === "user@test.com" && password === "password") {
        // store static token + user
        const demoToken = "demo-token-123456";
        const demoUser = { name: "Demo User", email };

        try {
          localStorage.setItem("token", demoToken);
          localStorage.setItem("user", JSON.stringify(demoUser));
        } catch (err) {
          console.error("Storage error", err);
        }

        setLoading(false);
        // navigate back to the protected page or landing
        navigate(from, { replace: true });
      } else {
        setLoading(false);
        setError("Invalid credentials. Use user@test.com / password");
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-semibold text-center text-gray-800">Sign in to PlantCare</h2>
        <p className="text-sm text-gray-500 mt-2 text-center">
          Use <strong>user@test.com</strong> and <strong>password</strong> to sign in (demo).
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center px-4 py-2 rounded-md text-white ${
              loading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-500">
          <button
            type="button"
            onClick={() => {
              // quick demo login helper
              setEmail("user@test.com");
              setPassword("password");
            }}
            className="underline"
          >
            Fill demo credentials
          </button>
        </div>
      </div>
    </div>
  );
}
