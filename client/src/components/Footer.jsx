// Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer>
      <p>&copy; 2025 Smart'Z Findery. All rights reserved.</p>
      <div className="footer-links">
        <a href="#" onClick={(e) => e.preventDefault()}>About Us</a> |
        <a href="#" onClick={(e) => e.preventDefault()}>Contact Us</a> |
        <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
      </div>
    </footer>
  );
};

export default Footer;