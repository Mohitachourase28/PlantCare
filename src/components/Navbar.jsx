import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  // check if user is logged in
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', {replace: true}); // redirect to login after logout
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/landing" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
            PC
          </div>
          <span className="font-semibold text-lg">PlantCare</span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink
            to="/landing"
            className={({ isActive }) =>
              isActive ? "text-green-600 font-medium" : "text-gray-600"
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/upload"
            className={({ isActive }) =>
              isActive ? "text-green-600 font-medium" : "text-gray-600"
            }
          >
            Scan
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) =>
              isActive ? "text-green-600 font-medium" : "text-gray-600"
            }
          >
            History
          </NavLink>

          <NavLink
            to="/knowledge-base"
            className={({ isActive }) =>
              isActive ? "text-green-600 font-medium" : "text-gray-600"
            }
          >
            Knowledge Base
          </NavLink>
        </nav>

        {/* Right Side: Auth Buttons OR User + Logout */}
        <div className="flex items-center gap-3">

          {/* If user is logged in */}
          {token ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  {user?.name?.[0] ?? "U"}
                </div>
                <div className="hidden md:block">{user?.name ?? "User"}</div>
              </div>

              <button
                onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Logout
              </button>
            </>
          ) : (
            /* If user is NOT logged in */
            <>
              <Link
                to="/"
                className="text-sm text-gray-600 hover:text-gray-800 hidden sm:inline"
              >
                Login
              </Link>

              <Link
                to="/"
                className="bg-green-500 text-white px-3 py-1.5 rounded text-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
