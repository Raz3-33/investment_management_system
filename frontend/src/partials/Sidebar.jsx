import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";

import SidebarLinkGroup from "./SidebarLinkGroup";
import IfCan from "../components/IfCan";

function Sidebar({ sidebarOpen, setSidebarOpen, variant = "default" }) {
  const location = useLocation();
  const { pathname } = location;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  // Subscribe so Sidebar re-renders when role/permissions change
  // const { user, permissions } = useAuthStore(
  //   (s) => ({ user: s.user, permissions: s.permissions }),
  //   shallow
  // );

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  // close on click outside
  const openRef = React.useRef(sidebarOpen);
  useEffect(() => {
    openRef.current = sidebarOpen;
  }, [sidebarOpen]);

  useEffect(() => {
    const clickHandler = (e) => {
      if (!sidebar.current || !trigger.current) return;
      if (!openRef.current) return;
      if (
        sidebar.current.contains(e.target) ||
        trigger.current.contains(e.target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, []); // bind once

  useEffect(() => {
    const keyHandler = (e) => {
      if (!openRef.current || e.key !== "Escape") return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, []); // bind once

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = (e) => {
      if (!openRef.current || e.key !== "Escape") return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, []); // bind once

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", String(sidebarExpanded));
    const body = document.body;
    if (sidebarExpanded) body.classList.add("sidebar-expanded");
    else body.classList.remove("sidebar-expanded");
  }, [sidebarExpanded]); // <-- important
  
  

  return (
    <div className="min-w-fit">
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-gray-900/30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex lg:flex! flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:w-64! shrink-0 bg-white dark:bg-gray-800 p-4 transition-all duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } ${
          variant === "v2"
            ? "border-r border-gray-200 dark:border-gray-700/60"
            : "rounded-r-2xl shadow-xs"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex justify-between mb-10 pr-3 sm:px-2">
          {/* Close button */}
          <button
            ref={trigger}
            className="lg:hidden text-gray-500 hover:text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <svg
              className="w-6 h-6 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
            </svg>
          </button>
          {/* Logo */}
          <NavLink end to="/" className="block">
            <img
              src="/images/logos/Login.png"
              alt="Logo"
              className={`transition-all duration-300 object-contain ${
                sidebarExpanded ? "w-20" : "w-80"
              }`}
            />
          </NavLink>
        </div>

        {/* Links */}
        <div className="space-y-8">
          {/* Pages group */}
          <div>
            <h3 className="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold pl-3">
              <span
                className="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6"
                aria-hidden="true"
              >
                •••
              </span>
            </h3>
            <ul className="mt-3">
              {/* Dashboard (visible to all in your App.tsx) */}
              <SidebarLinkGroup
                activecondition={
                  pathname === "/" || pathname.includes("dashboard")
                }
              >
                {(handleClick, open) => {
                  return (
                    <>
                      <NavLink
                        end
                        to="/"
                        className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                          pathname === "/" || pathname.includes("dashboard")
                            ? ""
                            : "hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={() => setSidebarExpanded(true)}
                      >
                        <div className="flex items-center">
                          <svg
                            className={`shrink-0 fill-current ${
                              pathname === "/" || pathname.includes("dashboard")
                                ? "text-violet-500"
                                : "text-gray-400 dark:text-gray-500"
                            }`}
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                          >
                            <path d="M5.936.278A7.983 7.983 0 0 1 8 0a8 8 0 1 1-8 8c0-.722.104-1.413.278-2.064a1 1 0 1 1 1.932.516A5.99 5.99 0 0 0 2 8a6 6 0 1 0 6-6c-.53 0-1.045.076-1.548.21A1 1 0 1 1 5.936.278Z" />
                            <path d="M6.068 7.482A2.003 2.003 0 0 0 8 10a2 2 0 1 0-.518-3.932L3.707 2.293a1 1 0 0 0-1.414 1.414l3.775 3.775Z" />
                          </svg>
                          <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                            Dashboard
                          </span>
                        </div>
                      </NavLink>
                    </>
                  );
                }}
              </SidebarLinkGroup>

              {/* Role Management */}
              <IfCan perm="Role Management:view">
                <li
                  className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 bg-linear-to-r ${
                    pathname.includes("role_management") &&
                    "from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04]"
                  }`}
                >
                  <NavLink
                    end
                    to="/role_management"
                    className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                      pathname.includes("role_management")
                        ? ""
                        : "hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center">
                      <svg
                        className={`shrink-0 fill-current ${
                          pathname.includes("role_management")
                            ? "text-violet-500"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        width="17"
                        height="17"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 0c.2 0 .4.06.56.17l4.82 3.67c.36.27.57.7.57 1.16v4.45c0 3.07-2.39 5.36-5.33 6.48a.72.72 0 0 1-.46 0c-2.93-1.12-5.33-3.4-5.33-6.48V5c0-.46.21-.89.56-1.17L7.44.17A.86.86 0 0 1 8 0Zm0 1.6L3.33 5.17v4.27c0 2.3 1.7 4.16 4.2 5.18 2.5-1.02 4.14-2.88 4.14-5.18V5.17L8 1.6Zm0 5.9c.55 0 1-.45 1-1S8.55 5.5 8 5.5 7 5.95 7 6.5s.45 1 1 1Zm2.15 2.9c-.3-.8-1.05-1.4-2.15-1.4s-1.85.6-2.15 1.4a.5.5 0 0 0 .47.6h3.36a.5.5 0 0 0 .47-.6Z" />
                      </svg>

                      <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                        Role Management
                      </span>
                    </div>
                  </NavLink>
                </li>
              </IfCan>

              {/* User Management */}
              <IfCan perm="User Management:view">
                <li
                  className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 bg-linear-to-r ${
                    pathname.includes("user_management") &&
                    "from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04]"
                  }`}
                >
                  <NavLink
                    end
                    to="/user_management"
                    className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                      pathname.includes("user_management")
                        ? ""
                        : "hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`shrink-0 ${
                          pathname.includes("user_management")
                            ? "text-violet-500"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        <circle cx="9" cy="7" r="3" />
                        <path d="M5 21v-2a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v2" />
                        <circle cx="17" cy="17" r="2" />
                        <path d="M17 13v1" />
                        <path d="M17 19v1" />
                        <path d="M20 17h1" />
                        <path d="M13 17h1" />
                        <path d="M18.5 14.5l.7.7" />
                        <path d="M15.5 14.5l-.7.7" />
                        <path d="M18.5 19.5l.7-.7" />
                        <path d="M15.5 19.5l-.7-.7" />
                      </svg>

                      <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                        User Management
                      </span>
                    </div>
                  </NavLink>
                </li>
              </IfCan>

              {/* Investment Management (perm: Investment:view) */}
              <IfCan perm="Investment:view">
                <li
                  className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 bg-linear-to-r ${
                    pathname.includes("investment_management") &&
                    "from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04]"
                  }`}
                >
                  <NavLink
                    end
                    to="/investment_management"
                    className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                      pathname.includes("investment_management")
                        ? ""
                        : "hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`shrink-0 ${
                          pathname.includes("investment_management")
                            ? "text-violet-500"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        <path d="M3 17s1.5 1 4 1h10c1.1 0 2-.9 2-2s-1-2-2-2h-5" />
                        <path d="M7 17s.5 1 1.5 1 1.5-1 1.5-1" />
                        <rect x="4" y="10" width="2" height="4" rx="0.5" />
                        <rect x="8" y="8" width="2" height="6" rx="0.5" />
                        <rect x="12" y="6" width="2" height="8" rx="0.5" />
                        <path d="M16 6l2-2 2 2" />
                        <line x1="18" y1="4" x2="18" y2="10" />
                      </svg>

                      <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                        Investment Management
                      </span>
                    </div>
                  </NavLink>
                </li>
              </IfCan>

              {/* Booking List Management (perm: Booking Management:view) */}
              <IfCan perm="Booking Management:view">
                <li
                  className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 bg-linear-to-r ${
                    pathname.includes("booking_list_management") &&
                    "from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04]"
                  }`}
                >
                  <NavLink
                    end
                    to="/booking_list_management"
                    className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                      pathname.includes("booking_list_management")
                        ? ""
                        : "hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`shrink-0 ${
                          pathname.includes("booking_list_management")
                            ? "text-violet-500"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        <rect x="3" y="10" width="2" height="8" rx="0.5" />
                        <rect x="7" y="6" width="2" height="12" rx="0.5" />
                        <rect x="11" y="3" width="2" height="15" rx="0.5" />
                        <circle cx="17" cy="17" r="3" />
                        <line x1="19.5" y1="19.5" x2="22" y2="22" />
                      </svg>

                      <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                        Booking List Management
                      </span>
                    </div>
                  </NavLink>
                </li>
              </IfCan>

              {/* Investment Opportunity Management */}
              <IfCan perm="Investment Opportunity Management:view">
                <li
                  className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 bg-linear-to-r ${
                    pathname.includes("investment_opportunity_management") &&
                    "from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04]"
                  }`}
                >
                  <NavLink
                    end
                    to="/investment_opportunity_management"
                    className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                      pathname.includes("investment_opportunity_management")
                        ? ""
                        : "hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`shrink-0 ${
                          pathname.includes("investment_opportunity_management")
                            ? "text-violet-500"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        <rect x="3" y="10" width="2" height="8" rx="0.5" />
                        <rect x="7" y="6" width="2" height="12" rx="0.5" />
                        <rect x="11" y="3" width="2" height="15" rx="0.5" />
                        <circle cx="17" cy="17" r="3" />
                        <line x1="19.5" y1="19.5" x2="22" y2="22" />
                      </svg>

                      <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                        Investment Opportunity Management
                      </span>
                    </div>
                  </NavLink>
                </li>
              </IfCan>

              {/* Investors Management (perm: Investor:view) */}
              <IfCan perm="Investor:view">
                <li
                  className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 bg-linear-to-r ${
                    pathname.includes("investors_management") &&
                    "from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04]"
                  }`}
                >
                  <NavLink
                    end
                    to="/investors_management"
                    className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                      pathname.includes("investors_management")
                        ? ""
                        : "hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`shrink-0 ${
                          pathname.includes("investors_management")
                            ? "text-violet-500"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        <circle cx="6" cy="7" r="3" />
                        <path d="M2 21v-1a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v1" />
                        <rect x="14" y="10" width="2" height="7" rx="0.5" />
                        <rect x="18" y="7" width="2" height="10" rx="0.5" />
                        <rect x="10" y="13" width="2" height="4" rx="0.5" />
                      </svg>

                      <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                        Investors Management
                      </span>
                    </div>
                  </NavLink>
                </li>
              </IfCan>

              {/* Sales Management */}
              <IfCan perm="Sales Management:view">
                <li
                  className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 bg-linear-to-r ${
                    pathname.includes("sales_management") &&
                    "from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04]"
                  }`}
                >
                  <NavLink
                    end
                    to="/sales_management"
                    className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                      pathname.includes("sales_management")
                        ? ""
                        : "hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`shrink-0 ${
                          pathname.includes("sales_management")
                            ? "text-violet-500"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        <path d="M4 20V10" />
                        <path d="M10 20V6" />
                        <path d="M16 20V14" />
                        <path d="M4 14L10 8L14 12L20 6" />
                        <path d="M20 6V10" />
                      </svg>

                      <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                        Sales Management
                      </span>
                    </div>
                  </NavLink>
                </li>
              </IfCan>

              {/* Payout Management */}
              <IfCan perm="Payout Management:view">
                <li
                  className={`pl-4 pr-3 py-2 rounded-lg mb-0.5 last:mb-0 bg-linear-to-r ${
                    pathname.includes("payout_management") &&
                    "from-violet-500/[0.12] dark:from-violet-500/[0.24] to-violet-500/[0.04]"
                  }`}
                >
                  <NavLink
                    end
                    to="/payout_management"
                    className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                      pathname.includes("payout_management")
                        ? ""
                        : "hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`shrink-0 ${
                          pathname.includes("payout_management")
                            ? "text-violet-500"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        <path d="M4 7C4 5.89543 4.89543 5 6 5H20C21.1046 5 22 5.89543 22 7V17C22 18.1046 21.1046 19 20 19H6C4.89543 19 4 18.1046 4 17V7Z" />
                        <path d="M4 9H18C19.1046 9 20 9.89543 20 11V13C20 14.1046 19.1046 15 18 15H4" />
                        <path d="M9 10H13" />
                        <path d="M9 13H12.5C11.5 13 11 14.5 9 14.5" />
                        <path d="M13 7H9V10" />
                      </svg>

                      <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                        Payout Management
                      </span>
                    </div>
                  </NavLink>
                </li>
              </IfCan>

              {/* Settings */}
              <IfCan perm="Settings:view">
                <SidebarLinkGroup
                  activecondition={pathname.includes("settings")}
                >
                  {(handleClick, open) => {
                    return (
                      <>
                        <NavLink
                          end
                          to="/settings"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                            pathname.includes("settings")
                              ? "text-violet-500"
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => setSidebarExpanded(true)}
                        >
                          <div className="flex items-center">
                            <svg
                              className={`shrink-0 fill-current ${
                                pathname.includes("settings")
                                  ? "text-violet-500"
                                  : "text-gray-400 dark:text-gray-500"
                              }`}
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                            >
                              <path
                                d="M10.5 1a3.502 3.502 0 0 1 3.355 2.5H15a1 1 0 1 1 0 2h-1.145a3.502 3.502 0 0 1-6.71 0H1a1 1 0 0 1 0-2h6.145A3.502 3.502 0 0 1 10.5 1ZM9 4.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM5.5 9a3.502 3.502 0 0 1 3.355 2.5H15a1 1 0 1 1 0 2H8.855a3.502 3.502 0 0 1-6.71 0H1a1 1 0 1 1 0-2h1.145A3.502 3.502 0 0 1 5.5 9ZM4 12.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0Z"
                                fillRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                              Settings
                            </span>
                          </div>
                        </NavLink>
                        <NavLink
                          end
                          to="/settings"
                          className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 mt-2 ${
                            pathname === "/settings"
                              ? "text-violet-500"
                              : "hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => setSidebarExpanded(true)}
                        ></NavLink>
                      </>
                    );
                  }}
                </SidebarLinkGroup>
              </IfCan>

              {/* Utility group left as-is (no perms) */}
              <SidebarLinkGroup activecondition={pathname.includes("utility")}>
                {(handleClick, open) => {
                  return (
                    <>
                      <a
                        href="#0"
                        className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                          pathname.includes("utility")
                            ? ""
                            : "hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleClick();
                          setSidebarExpanded(true);
                        }}
                      />
                      <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                        <ul className={`pl-8 mt-1 ${!open && "hidden"}`}>
                          <li className="mb-1 last:mb-0">
                            <NavLink
                              end
                              to=""
                              className={({ isActive }) =>
                                "block transition duration-150 truncate " +
                                (isActive
                                  ? "text-violet-500"
                                  : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                              }
                            >
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                Empty State
                              </span>
                            </NavLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <NavLink
                              end
                              to=""
                              className={({ isActive }) =>
                                "block transition duration-150 truncate " +
                                (isActive
                                  ? "text-violet-500"
                                  : "text-gray-500/90 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200")
                              }
                            >
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                404
                              </span>
                            </NavLink>
                          </li>
                        </ul>
                      </div>
                    </>
                  );
                }}
              </SidebarLinkGroup>
            </ul>
          </div>

          {/* More group (left as-is) */}
          <div>
            <h3 className="text-xs uppercase text-gray-400 dark:text-gray-500 font-semibold pl-3">
              <span
                className="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6"
                aria-hidden="true"
              >
                •••
              </span>
            </h3>
            <ul className="mt-3">
              <SidebarLinkGroup>
                {(handleClick, open) => {
                  return (
                    <>
                      <a
                        href="#0"
                        className={`block text-gray-800 dark:text-gray-100 truncate transition duration-150 ${
                          open
                            ? ""
                            : "hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleClick();
                          setSidebarExpanded(true);
                        }}
                      />
                      <div className="lg:hidden lg:sidebar-expanded:block 2xl:block">
                        <ul className={`pl-8 mt-1 ${!open && "hidden"}`}>
                          <li className="mb-1 last:mb-0">
                            <NavLink
                              end
                              to=" dark:hover:text-gray-200 transition duration-150 truncate"
                            >
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                Sign in
                              </span>
                            </NavLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <NavLink
                              end
                              to=" dark:hover:text-gray-200 transition duration-150 truncate"
                            >
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                Sign up
                              </span>
                            </NavLink>
                          </li>
                          <li className="mb-1 last:mb-0">
                            <NavLink
                              end
                              to=" hover:text-gray-700 dark:hover:text-gray-200 transition duration-150 truncate"
                            >
                              <span className="text-sm font-medium lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                Reset Password
                              </span>
                            </NavLink>
                          </li>
                        </ul>
                      </div>
                    </>
                  );
                }}
              </SidebarLinkGroup>
            </ul>
          </div>
        </div>

        {/* Expand / collapse button */}
        <div className="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
          <div className="w-12 pl-4 pr-3 py-2">
            <button
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
            >
              <span className="sr-only">Expand / collapse sidebar</span>
              <svg
                className="shrink-0 fill-current text-gray-400 dark:text-gray-500 sidebar-expanded:rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path d="M15 16a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1ZM8.586 7H1a1 1 0 1 0 0 2h7.586l-2.793 2.793a1 1 0 1 0 1.414 1.414l4.5-4.5A.997.997 0 0 0 12 8.01M11.924 7.617a.997.997 0 0 0-.217-.324l-4.5-4.5a1 1 0 0 0-1.414 1.414L8.586 7M12 7.99a.996.996 0 0 0-.076-.373Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
