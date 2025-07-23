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
// import AddUserForm from "./components/userManagement/AddUserForm";
import LoginPage from "./pages/Auth/login";
import AuthRedirector from "./components/authRedirect";
import InvestmentOpportunityManagement from "./pages/investmentOpportunityManagement/InvestmentOpportunityManagement";
import InvestorManagement from "./pages/investorManagement/InvestorManagement";
import InvestmentManagement from "./pages/InvestmentManagement/InvestmentManagement";

function ScrollToTopOnNavigate() {
  const location = useLocation();

  useEffect(() => {
    document.querySelector("html").style.scrollBehavior = "auto";
    window.scroll({ top: 0 });
    document.querySelector("html").style.scrollBehavior = "";
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <div className="h-full w-full">
      <ScrollToTopOnNavigate />
      <AuthRedirector />

      <Routes>
        {/* dashboard */}
        <Route path="/" element={<MainLayout children={<Dashboard />} />} />

        {/* Role Management */}
        <Route
          path="/role_management"
          element={<MainLayout children={<RoleManagement />} />}
        />

        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/role_management/permission"
          element={<MainLayout children={<RolePermissionForm />} />}
        />
        {/* User Management */}

        <Route
          path="/user_management"
          element={<MainLayout children={<UserManagement />} />}
        />

        {/* Investment Opportunity Management */}

        <Route
          path="/investment_opportunity_management"
          element={
            <MainLayout children={<InvestmentOpportunityManagement />} />
          }
        />

        {/* Investor Management */}
        <Route
          path="/investors_management"
          element={
            <MainLayout children={<InvestorManagement />} />
          }
        />

         {/* Investment Management */}
        <Route
          path="/investment_management"
          element={
            <MainLayout children={<InvestmentManagement />} />
          }
        />

        {/* <Route
          path="/user_management/add-user"
          element={<MainLayout children={<AddUserForm />} />}
        /> */}

        {/* Settings */}
        <Route
          path="/settings"
          element={<MainLayout children={<Settings />} />}
        />
      </Routes>
    </div>
  );
}

export default App;
