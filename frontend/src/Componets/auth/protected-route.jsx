import { Navigate } from "react-router-dom";
import authService from '../../Services/authService';

export default function ProtectedRoute({ children }) {
  if (!authService.isLoggedIn()) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}