import React from 'react';
import { FaHome, FaUser, FaCog, FaBell } from "react-icons/fa";
import '../Styles/Navbar.css'; // Import the custom CSS

const Navbar = () => {
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
        <FaUser className="navbar-icon" />
        <FaCog className="navbar-icon" />
        <FaBell className="navbar-icon" />
      </div>
    </nav>
  );
};

export default Navbar;