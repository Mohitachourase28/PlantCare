import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice.js';

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <NavLink to="/" className="text-2xl font-bold text-green-600">PlantCare</NavLink>
            {isAuthenticated && (
              <nav className="hidden md:flex space-x-6">
                <NavLink to="/dashboard" className={({ isActive }) => `text-gray-700 hover:text-green-600 ${isActive ? 'font-bold text-green-600' : ''}`}>Dashboard</NavLink>
                <NavLink to="/detect" className={({ isActive }) => `text-gray-700 hover:text-green-600 ${isActive ? 'font-bold text-green-600' : ''}`}>Detect</NavLink>
                <NavLink to="/knowledge-base" className={({ isActive }) => `text-gray-700 hover:text-green-600 ${isActive ? 'font-bold text-green-600' : ''}`}>Knowledge Base</NavLink>
              </nav>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-700">Welcome, {user.name}</span>
                <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-500">Logout</button>
              </>
            ) : (
              <NavLink to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Sign In</NavLink>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;