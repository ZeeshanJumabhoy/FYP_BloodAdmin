import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaUser, FaCog, FaBell } from "react-icons/fa";
import '../Styles/Navbar.css';

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const profileRef = useRef();
  const settingsRef = useRef();
  const navigate = useNavigate();

  const toggleProfileDropdown = () => {
    setIsProfileOpen(prev => !prev);
    setIsSettingsOpen(false);
  };

  const toggleSettingsDropdown = () => {
    setIsSettingsOpen(prev => !prev);
    setIsProfileOpen(false);
  };

  const onLogout = async () => {
    localStorage.removeItem('token');
    navigate('/blood-admin');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current && !profileRef.current.contains(event.target) &&
        settingsRef.current && !settingsRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      {/* Left Side */}
      <div className="navbar-l">
        <FaHome className="navbar-icon home-icon" />
      </div>

      {/* Middle Search */}
      <div className="navbar-m">
        <span className="navbar-title">Hayaat-e-Attiya</span>
      </div>

      {/* Right Side */}
      <div className="navbar-r">
        <input
          type="text"
          placeholder="Search here..."
          className="navbar-search"
        />

        {/* Profile Dropdown */}
        <div className="navbar-dropdown-container" ref={profileRef}>
          <FaUser className="navbar-icon" onClick={toggleProfileDropdown} />
          {isProfileOpen && (
            <div className="navbar-dropdown">
              <div className="navbar-dropdown-header">Profile</div>
              <div className="navbar-dropdown-item">My Profile</div>
              <div className="navbar-dropdown-item" onClick={onLogout}>
                Logout
              </div>
            </div>
          )}
        </div>

        {/* Settings Dropdown */}
        <div className="navbar-dropdown-container" ref={settingsRef}>
          <FaCog className="navbar-icon" onClick={toggleSettingsDropdown} />
          {isSettingsOpen && (
            <div className="navbar-dropdown">
              <div className="navbar-dropdown-header">Settings</div>
              <div className="navbar-dropdown-item">Account Settings</div>
              <div className="navbar-dropdown-item">Privacy Settings</div>
            </div>
          )}
        </div>

        <FaBell className="navbar-icon" />
      </div>
    </nav>
  );
};

export default Navbar;
