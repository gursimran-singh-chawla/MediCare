import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function Toaster() {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="toaster" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const Icon = isError ? AlertCircle : CheckCircle2;
          return (
            <motion.div
              key={toast.id}
              layout
              className={`toast ${isError ? 'toast-error' : 'toast-success'}`}
              initial={{ opacity: 0, y: -18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            >
              <Icon size={20} className="toast-icon" />
              <span>{toast.message}</span>
              <button type="button" className="toast-close" onClick={() => dismissToast(toast.id)} aria-label="Dismiss">
                <X size={16} />
              </button>
              <span className="toast-progress" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
