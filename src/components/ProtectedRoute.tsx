import { Navigate } from "react-router-dom";
import authService from "../services/auth";
import { ReactNode } from "react";

// Define the interface
interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[]; // The '?' makes it optional
}

const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  // Check authentication
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check roles if specified
  const currentUser = authService.getCurrentUser();
  
  // Fix: Ensure currentUser?.role is treated as a string to match allowedRoles
  const userRole = currentUser?.role as string;

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;