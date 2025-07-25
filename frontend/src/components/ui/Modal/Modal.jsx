import { createPortal } from "react-dom";
import Button from "../Button";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background:
          "rgba(255, 255, 255, 0.15)", // fallback for light mode
        backdropFilter: "blur(8px) saturate(180%)",
        WebkitBackdropFilter: "blur(8px) saturate(180%)",
        backgroundColor: "rgba(30, 41, 59, 0.25)", // fallback for dark mode (slate-800/900)
        transition: "background 0.3s",
      }}
    >
      <div className="bg-white/80 dark:bg-gray-900/80 rounded-md shadow-lg w-full max-w-lg mx-4 sm:mx-auto backdrop-blur-md">
        <div className="flex justify-between items-center border-b px-4 py-3 dark:border-white/[0.1]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          >
            &times;
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
        <div className="flex justify-end px-4 py-2 border-t dark:border-white/[0.05]">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
