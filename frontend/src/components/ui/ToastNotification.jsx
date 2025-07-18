// ToastNotification.jsx
import React, { useEffect } from "react";

const ToastNotification = ({ show, message, type, onClose }) => {
  useEffect(() => {
    if (show) {
      // Auto-hide the toast after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className={`flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800 ${
        type === "success"
          ? "bg-green-100 text-green-500"
          : type === "error"
          ? "bg-red-100 text-red-500"
          : "bg-orange-100 text-orange-500"
      }`}
      role="alert"
    >
      <div
        className="inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg"
      >
        {/* Icon Based on Type */}
        {type === "success" && (
          <svg
            className="w-5 h-5 text-green-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 0C4.5 0 0 4.5 0 10c0 5.5 4.5 10 10 10s10-4.5 10-10C20 4.5 15.5 0 10 0zM9 14l-5-5 1.4-1.4L9 11.2l5.6-5.6L16 7l-7 7z" />
          </svg>
        )}
        {type === "error" && (
          <svg
            className="w-5 h-5 text-red-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 0C4.5 0 0 4.5 0 10c0 5.5 4.5 10 10 10s10-4.5 10-10C20 4.5 15.5 0 10 0zM9 14l-5-5 1.4-1.4L9 11.2l5.6-5.6L16 7l-7 7z" />
          </svg>
        )}
        {type === "warning" && (
          <svg
            className="w-5 h-5 text-orange-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 0C4.5 0 0 4.5 0 10c0 5.5 4.5 10 10 10s10-4.5 10-10C20 4.5 15.5 0 10 0zM9 14l-5-5 1.4-1.4L9 11.2l5.6-5.6L16 7l-7 7z" />
          </svg>
        )}
      </div>
      <div className="ms-3 text-sm font-normal">{message}</div>
      <button
        type="button"
        onClick={onClose}
        className="ms-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg bg-white text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <svg
          className="w-3 h-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
          />
        </svg>
      </button>
    </div>
  );
};

export default ToastNotification;
