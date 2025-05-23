import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const isAuthenticated = user && token;

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    // Save the current location for redirect after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
