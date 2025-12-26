import { Navigate } from "react-router-dom";
import authService from "../services/auth";
import { ReactNode } from "react";

// Define the interface for props
interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!authService.isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>; // Wrapping in fragments is safer for React nodes
};

export default AdminRoute;