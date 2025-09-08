// src/main.jsx
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import ThemeProvider from "./utils/ThemeContext";
import App from "./App";
import { ToastContainer } from "react-toastify";
import './index.css';
import { useAuthzStore } from "./store/useAuthzStore";

function PermissionsBootstrap({ children }) {
  const loading = useAuthzStore((s) => s.loading);
  const bootstrap = useAuthzStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  if (loading) return null; // or a global skeleton/spinner
  return children;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastContainer />
    <Router>
      <ThemeProvider>
        <PermissionsBootstrap>
          <App />
        </PermissionsBootstrap>
      </ThemeProvider>
    </Router>
  </React.StrictMode>
);
