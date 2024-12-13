// CustomAlert.js
import React from "react";
import "./CustomAlert.css"; // Import your CSS file for styling

const CustomAlert = ({ message, onClose }) => {
  return (
    <div className="custom-alert-overlay">
      <div className="custom-alert">
        <h3>{message}</h3>
        <button onClick={onClose}>بستن</button>
      </div>
    </div>
  );
};

export default CustomAlert;
