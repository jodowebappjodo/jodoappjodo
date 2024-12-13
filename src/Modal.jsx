// src/components/Modal.js
import React from "react";
import "./Modal.css"; // Import your CSS for styling
import { FaVideo } from "react-icons/fa6";
const Modal = ({ isOpen, onClose }) => {
  if (!isOpen) return null; // Don't render anything if the modal is not open

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <FaVideo style={{ fontSize: "100px" }} />
        <h1>درخواست ویدیو چک</h1>
        <h3>کمیته داوران در حال بررسی صحنه مسابقه می باشند</h3>
        <button onClick={onClose} style={{ width: "100px", height: "60px" }}>
          بستن
        </button>
      </div>
    </div>
  );
};

export default Modal;
