import { Link } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function MockBadge() {
  const { session } = useApp();
  if (!session.mockMode) return null;
  return (
    <Link to="/login" className="mock-badge no-print" title="Mock mode: in-memory data, simulated payments. Click for demo logins.">
      <FlaskConical size={14} /> Mock mode
    </Link>
  );
}
