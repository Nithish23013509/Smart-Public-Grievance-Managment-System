import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';

// Public Pages
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Unauthorized from '../pages/auth/Unauthorized';

// Citizen Pages
import CitizenDashboard from '../pages/citizen/CitizenDashboard';
import CreateComplaint from '../pages/citizen/CreateComplaint';
import MyComplaints from '../pages/citizen/MyComplaints';
import ComplaintDetails from '../pages/citizen/ComplaintDetails';

// Officer Pages
import OfficerDashboard from '../pages/officer/OfficerDashboard';
import OfficerComplaintDetails from '../pages/officer/OfficerComplaintDetails';
import AiReviewQueue from '../pages/officer/AiReviewQueue';
import AiReviewDetail from '../pages/officer/AiReviewDetail';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminComplaints from '../pages/admin/AdminComplaints';
import AdminComplaintDetails from '../pages/admin/AdminComplaintDetails';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminDepartments from '../pages/admin/AdminDepartments';
import AiAnalyticsDashboard from '../pages/admin/AiAnalyticsDashboard';

// Shared Pages
import Notifications from '../pages/Notifications';
import Profile from '../pages/Profile';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* CITIZEN Routes */}
        <Route element={<ProtectedRoute allowedRoles={['CITIZEN']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
            <Route path="/citizen/complaints" element={<MyComplaints />} />
            <Route path="/citizen/complaints/new" element={<CreateComplaint />} />
            <Route path="/citizen/complaints/:id" element={<ComplaintDetails />} />
            <Route path="/citizen/notifications" element={<Notifications />} />
            <Route path="/citizen/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* OFFICER Routes */}
        <Route element={<ProtectedRoute allowedRoles={['OFFICER']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/officer/dashboard" element={<OfficerDashboard />} />
            <Route path="/officer/complaints" element={<Navigate to="/officer/dashboard" replace />} />
            <Route path="/officer/complaints/:id" element={<OfficerComplaintDetails />} />
            <Route path="/officer/ai-review" element={<AiReviewQueue />} />
            <Route path="/officer/ai-review/:id" element={<AiReviewDetail />} />
            <Route path="/officer/notifications" element={<Notifications />} />
            <Route path="/officer/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* ADMIN Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/complaints" element={<AdminComplaints />} />
            <Route path="/admin/complaints/:id" element={<AdminComplaintDetails />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/departments" element={<AdminDepartments />} />
            <Route path="/admin/ai-analytics" element={<AiAnalyticsDashboard />} />
            <Route path="/admin/ai-review" element={<AiReviewQueue />} />
            <Route path="/admin/ai-review/:id" element={<AiReviewDetail />} />
            <Route path="/admin/notifications" element={<Notifications />} />
            <Route path="/admin/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
