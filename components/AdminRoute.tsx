import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // User not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
      // User is logged in but not an admin, redirect to the home page
      return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;