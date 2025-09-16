import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Transition from "../utils/Transition";
import IfCan from "./IfCan";
import {
  useProfileStore,
  resetProfileStore,
  clearProfilePersist,
} from "../store/profileStore";

// Hook: keep a reactive copy of the logged-in user id stored in localStorage
function useStoredUserId() {
  const getId = () => {
    try {
      return JSON.parse(localStorage.getItem("user"))?.id || null;
    } catch {
      return null;
    }
  };
  const [id, setId] = useState(getId);

  useEffect(() => {
    const handler = () => setId(getId());
    // Fires across tabs
    window.addEventListener("storage", handler);
    // Fires in the same tab when we dispatch after login
    window.addEventListener("user:changed", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("user:changed", handler);
    };
  }, []);

  return id;
}

function DropdownProfile({ align }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const trigger = useRef(null);
  const dropdown = useRef(null);
  const navigate = useNavigate();

  // --- PROFILE STORE ---
  const { users, fetchProfiles, loading } = useProfileStore((s) => s);

  // Normalize user shape: can be { ...user } or { data: { ...user } }
  const user = users?.data ? users.data : users || null;

  // React to logged-in user changes
  const storedUserId = useStoredUserId();

  // Re-fetch whenever storedUserId changes (login switch) or if user is missing
  useEffect(() => {
    // If we have a user id, fetch that profile
    if (storedUserId && typeof fetchProfiles === "function") {
      fetchProfiles().catch(() => {});
      return;
    }
    // If no user id, ensure we don't show stale data
    if (!storedUserId) {
      resetProfileStore();
    }
  }, [storedUserId, fetchProfiles]);

  // Helpers
  const toTitle = (s) =>
    typeof s === "string"
      ? s
          .replace(/[_-]+/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase()
          .replace(/\b\w/g, (m) => m.toUpperCase())
      : "";

  const displayName =
    user?.fullName ||
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "EBG.";

  const displayRole = user?.isAdmin
    ? "Administrator"
    : user?.role
    ? toTitle(user.role)
    : "Member";

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [dropdownOpen]);

  // close on Esc
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [dropdownOpen]);

  const onSignOut = async () => {
    setDropdownOpen(false);
    localStorage.clear();

    // Remove ONLY auth/session items (keep UI prefs like sidebar-expanded)
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");

    // Reset zustand store(s) so UI updates immediately
    resetProfileStore();

    // If persisting, clear disk cache too
    await clearProfilePersist();

    // Let other parts of app know that user is gone
    window.dispatchEvent(new Event("user:changed"));

    // Navigate away
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className="inline-flex justify-center items-center group"
        aria-haspopup="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <img
          className="w-9 h-4"
          src="/images/logos/Login.png"
          width="32"
          height="32"
          alt="User"
        />
        <div className="flex items-center truncate">
          <span className="truncate ml-2 text-sm font-medium text-gray-600 dark:text-gray-100 group-hover:text-gray-800 dark:group-hover:text-white">
            {/* If you want the name next to the avatar, uncomment: */}
            {/* {loading && !user ? "" : displayName} */}
          </span>
          <svg
            className="w-3 h-3 shrink-0 ml-1 fill-current text-gray-400 dark:text-gray-500"
            viewBox="0 0 12 12"
          >
            <path d="M5.9 11.4L.5 6l1.4-1.4 4 4 4-4L11.3 6z" />
          </svg>
        </div>
      </button>

      <Transition
        className={`origin-top-right z-10 absolute top-full min-w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 py-1.5 rounded-lg shadow-lg overflow-hidden mt-1 ${
          align === "right" ? "right-0" : "left-0"
        }`}
        show={dropdownOpen}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div
          ref={dropdown}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setDropdownOpen(false)}
        >
          {/* Header block with dynamic name + role */}
          <div className="pt-0.5 pb-2 px-3 mb-1 border-b border-gray-200 dark:border-gray-700/60">
            <div className="font-medium text-gray-800 dark:text-gray-100">
              {loading && !user ? "EBG." : displayName || "EBG."}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 italic">
              {loading && !user ? "Loading..." : displayRole}
            </div>
          </div>

          <ul>
            {/* Profile */}
            <li>
              <Link
                className="font-medium text-sm text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center py-1 px-3"
                to="/profile"
                onClick={() => setDropdownOpen(false)}
              >
                Profile
              </Link>
            </li>

            {/* Settings (permission-gated) */}
            <IfCan perm="Settings:view">
              <li>
                <Link
                  className="font-medium text-sm text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center py-1 px-3"
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                >
                  Settings
                </Link>
              </li>
            </IfCan>

            {/* Sign out */}
            <li>
              <button
                className="w-full text-left font-medium text-sm text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 flex items-center py-1 px-3"
                onClick={onSignOut}
              >
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      </Transition>
    </div>
  );
}

export default DropdownProfile;
