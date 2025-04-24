import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        Employee Management
      </Link>
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <span className="nav-link text-gray-700">
              Welcome, {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="nav-link text-red-600 hover:text-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-link">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 