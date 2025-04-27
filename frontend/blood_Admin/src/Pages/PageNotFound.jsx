import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/PageNotFound.css'; // Import your CSS file for styling

const PageNotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1 className="notfound-title">404</h1>
        <h2 className="notfound-subtitle">Page Not Found</h2>
        <p className="notfound-text">
          Oops! The page you're looking for doesn't exist in the Blood Bank Admin Panel.
        </p>
        <Link to="/" className="notfound-button">
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default PageNotFound;
