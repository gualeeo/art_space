import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ protection }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading-indicator"><div className="spinner"></div></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return protection;
}

export default ProtectedRoute;