import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-xl font-bold">Task Manager</Link>
            <div className="hidden md:flex space-x-4">
              <Link to="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded transition">Dashboard</Link>
              <Link to="/tasks" className="hover:bg-blue-700 px-3 py-2 rounded transition">Tasks</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">{user?.name}</span>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
