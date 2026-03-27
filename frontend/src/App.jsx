import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import UserDashboardHome from './pages/user/UserDashboardHome';
import UserComplaints from './pages/user/UserComplaints';
import SubmitComplaint from './pages/user/SubmitComplaint';
import UserSettings from './pages/user/UserSettings';

// Resolver components
import ResolverDashboard from './pages/resolver/ResolverDashboard';
import ResolverDashboardHome from './pages/resolver/ResolverDashboardHome';
import ResolverComplaints from './pages/resolver/ResolverComplaints';

// Admin components
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDashboardHome from './pages/admin/AdminDashboardHome';
import AdminUsers from './pages/admin/AdminUsers';
import AdminComplaints from './pages/admin/AdminComplaints';

import Notifications from './pages/Notifications';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* User Dashboard Routes */}
          <Route path="/user-dashboard" element={<UserDashboard />}>
            <Route index element={<UserDashboardHome />} />
            <Route path="complaints" element={<UserComplaints />} />
            <Route path="submit-complaint" element={<SubmitComplaint />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<UserSettings />} />
          </Route>

          {/* Resolver Dashboard Routes */}
          <Route path="/resolver-dashboard" element={<ResolverDashboard />}>
            <Route index element={<ResolverDashboardHome />} />
            <Route path="complaints" element={<ResolverComplaints />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<UserSettings />} />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route path="/admin-dashboard" element={<AdminDashboard />}>
            <Route index element={<AdminDashboardHome />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<UserSettings />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
