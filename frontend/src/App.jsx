// src/App.tsx
import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import "./css/style.css";
import "./charts/ChartjsConfig";

import Dashboard from "./pages/Dashboard";
import RoleManagement from "./pages/roleManagement/RoleManagement";
import MainLayout from "./layout/MainLayout";
import RolePermissionForm from "./pages/roleManagement/RolePermissionForm";
import Settings from "./pages/settings/Settings";
import UserManagement from "./pages/userManagement/UserManagement";
import LoginPage from "./pages/Auth/login";
import AuthRedirector from "./components/authRedirect";
import InvestmentOpportunityManagement from "./pages/investmentOpportunityManagement/InvestmentOpportunityManagement";
import InvestorManagement from "./pages/investorManagement/InvestorManagement";
import InvestmentManagement from "./pages/InvestmentManagement/InvestmentManagement";
import PayoutManagement from "./pages/PayoutManagement/PayoutManagement";
import SalesManagement from "./pages/salesManagement/salesManagement";
import ProfilePage from "./pages/settings/Profile";
import BookingListManagement from "./pages/BookingListManagement/BookingListManagement";
import BookingDetailPage from "./components/BookingListManagement/BookingDetailPage";

import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthzStore } from "./store/useAuthzStore";
import { useAuthStore } from "./store/authentication";

function ScrollToTopOnNavigate() {
  const location = useLocation();
  useEffect(() => {
    document.querySelector("html").style.scrollBehavior = "auto";
    window.scroll({ top: 0 });
    document.querySelector("html").style.scrollBehavior = "";
  }, [location.pathname]);
  return null;
}

function AuthBoot() {
  const token = useAuthStore((s) => s.token);
  const bootstrap = useAuthzStore((s) => s.bootstrap);
  const reset = useAuthzStore((s) => s.reset);

  React.useEffect(() => {
    if (token) bootstrap();
    else reset();
  }, [token, bootstrap, reset]);

  return null;
}


function App() {
  return (
    <div className="h-full w-full">
      <ScrollToTopOnNavigate />
      <AuthBoot />
      {/* <AuthRedirector /> */}

      <Routes>
        {/* Dashboard (choose a permission name and seed it in DB, e.g. "Dashboard:view") */}
        <Route
          path="/"
          element={
            // <ProtectedRoute perm="Dashboard:view">
            <MainLayout children={<Dashboard />} />
            // </ProtectedRoute>
          }
        />

        {/* Role Management */}
        <Route
          path="/role_management"
          element={
            <ProtectedRoute perm="Role Management:view">
              <MainLayout children={<RoleManagement />} />
            </ProtectedRoute>
          }
        />

        {/* Role Permission Form (often same view perm; change if you require :update) */}
        <Route
          path="/role_management/permission"
          element={
            <ProtectedRoute perm="Role Management:view">
              <MainLayout children={<RolePermissionForm />} />
            </ProtectedRoute>
          }
        />

        {/* Login (public) */}
        <Route path="/login" element={<LoginPage />} />

        {/* User Management */}
        <Route
          path="/user_management"
          element={
            <ProtectedRoute perm="User Management:view">
              <MainLayout children={<UserManagement />} />
            </ProtectedRoute>
          }
        />

        {/* Booking Management */}
        <Route
          path="/booking_list_management"
          element={
            <ProtectedRoute perm="Booking Management:view">
              <MainLayout children={<BookingListManagement />} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking_details_management/:bookingId"
          element={
            <ProtectedRoute perm="Booking Management:view">
              <MainLayout>
                <BookingDetailPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Investment Opportunity Management */}
        <Route
          path="/investment_opportunity_management"
          element={
            <ProtectedRoute perm="Investment Opportunity Management:view">
              <MainLayout children={<InvestmentOpportunityManagement />} />
            </ProtectedRoute>
          }
        />

        {/* Investor Management */}
        <Route
          path="/investors_management"
          element={
            <ProtectedRoute perm="Investor:view">
              <MainLayout children={<InvestorManagement />} />
            </ProtectedRoute>
          }
        />

        {/* Investment Management */}
        <Route
          path="/investment_management"
          element={
            <ProtectedRoute perm="Investment:view">
              <MainLayout children={<InvestmentManagement />} />
            </ProtectedRoute>
          }
        />

        {/* Payout Management */}
        <Route
          path="/payout_management"
          element={
            <ProtectedRoute perm="Payout Management:view">
              <MainLayout children={<PayoutManagement />} />
            </ProtectedRoute>
          }
        />

        {/* Sales Management */}
        <Route
          path="/sales_management"
          element={
            <ProtectedRoute perm="Sales Management:view">
              <MainLayout children={<SalesManagement />} />
            </ProtectedRoute>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute perm="Settings:view">
              <MainLayout children={<Settings />} />
            </ProtectedRoute>
          }
        />

        {/* Profile (pick a permission or leave public if desired) */}
        <Route
          path="/profile"
          element={
            // <ProtectedRoute perm="Settings:view">
              <MainLayout children={<ProfilePage />} />
            // </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
