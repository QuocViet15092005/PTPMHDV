import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Courses from '../pages/Courses';
import MyCourses from '../pages/MyCourses';
import Schedule from '../pages/Schedule';
import Profile from '../pages/Profile';
import AdminCourses from '../pages/admin/AdminCourses';
import News from '../pages/News';
import Study from '../pages/Study';
import Finance from '../pages/Finance';

import AdminNews from '../pages/admin/AdminNews';
import AdminFinance from '../pages/admin/AdminFinance';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex justify-center p-8">Đang kiểm tra quyền truy cập...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={<Layout />}>
        {/* Student Routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/courses" element={
          <PrivateRoute>
            <Courses />
          </PrivateRoute>
        } />
        <Route path="/my-courses" element={
          <PrivateRoute>
            <MyCourses />
          </PrivateRoute>
        } />
        <Route path="/schedule" element={
          <PrivateRoute>
            <Schedule />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/news" element={
          <PrivateRoute>
            <News />
          </PrivateRoute>
        } />
        <Route path="/study" element={
          <PrivateRoute>
            <Study />
          </PrivateRoute>
        } />
        <Route path="/finance" element={
          <PrivateRoute>
            <Finance />
          </PrivateRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/courses" element={
          <PrivateRoute roles={['ADMIN']}>
            <AdminCourses />
          </PrivateRoute>
        } />
        <Route path="/admin/news" element={
          <PrivateRoute roles={['ADMIN']}>
            <AdminNews />
          </PrivateRoute>
        } />
        <Route path="/admin/finance" element={
          <PrivateRoute roles={['ADMIN']}>
            <AdminFinance />
          </PrivateRoute>
        } />
        
        {/* Fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
