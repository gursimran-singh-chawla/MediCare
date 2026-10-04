import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import Loader from './Loader.jsx';

export default function RequireRole({ role, children }) {
  const { role: currentRole, sessionReady } = useApp();
  const location = useLocation();

  if (!sessionReady) return <Loader label="Checking your session" fullscreen />;
  if (currentRole !== role) {
    return <Navigate to="/login" replace state={{ from: location.pathname, role: role === 'doctor' ? 'doctor' : 'patient' }} />;
  }
  return children;
}
