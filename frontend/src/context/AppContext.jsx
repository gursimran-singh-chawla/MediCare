import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';

const AppContext = createContext(null);
const TOAST_DURATION = 4500;

export function AppProvider({ children }) {
  const navigate = useNavigate();
  const [session, setSession] = useState({});
  const [sessionReady, setSessionReady] = useState(false);
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  const dismissToast = useCallback((id) => {
    setToasts((items) => items.filter((toast) => toast.id !== id));
  }, []);

  const setAlert = useCallback((value) => {
    if (!value?.message) return;
    const id = ++toastId.current;
    setToasts((items) => [...items.slice(-2), { id, type: value.type || 'success', message: value.message }]);
    setTimeout(() => dismissToast(id), TOAST_DURATION);
  }, [dismissToast]);

  const applySession = useCallback((data) => {
    setSession({
      user: data.user,
      doctor: data.doctor,
      isAdmin: Boolean(data.isAdmin),
      mockMode: Boolean(data.mockMode),
      mockPayments: Boolean(data.mockPayments)
    });
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      applySession(await api('/api/session'));
    } finally {
      setSessionReady(true);
    }
  }, [applySession]);

  useEffect(() => { refreshSession().catch(() => {}); }, [refreshSession]);

  const logout = useCallback(async () => {
    const data = await api('/api/auth/logout', { method: 'POST' }).catch(() => null);
    if (data) applySession(data);
    else setSession({});
    setAlert({ type: 'success', message: 'You have been signed out.' });
    navigate('/');
  }, [applySession, navigate, setAlert]);

  const role = session.isAdmin ? 'admin' : session.doctor ? 'doctor' : session.user ? 'patient' : null;

  const value = useMemo(() => ({
    session,
    role,
    sessionReady,
    applySession,
    refreshSession,
    setAlert,
    toasts,
    dismissToast,
    logout,
    onPatientLogout: logout,
    onDoctorLogout: logout
  }), [session, role, sessionReady, applySession, refreshSession, setAlert, toasts, dismissToast, logout]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
