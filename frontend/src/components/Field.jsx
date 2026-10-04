import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Field({ label, icon: Icon, type = 'text', className = '', ...props }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && visible ? 'text' : type;

  return (
    <div className={`field-float ${Icon ? 'has-icon' : ''} ${isPassword ? 'has-toggle' : ''} ${className}`}>
      {Icon && <Icon className="field-icon" size={18} aria-hidden="true" />}
      <input id={id} type={inputType} placeholder=" " {...props} />
      <label htmlFor={id}>{label}</label>
      {isPassword && (
        <button
          type="button"
          className="field-toggle"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
}
