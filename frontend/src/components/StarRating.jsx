import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

export function Stars({ value = 0, size = 16 }) {
  return (
    <span className="stars" style={{ '--star-size': `${size}px` }} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((index) => {
        const fill = Math.max(0, Math.min(1, value - index + 1));
        return (
          <span key={index} className="star">
            <Star size={size} className="star-empty" />
            <span className="star-fill" style={{ width: `${fill * 100}%` }}><Star size={size} fill="currentColor" /></span>
          </span>
        );
      })}
    </span>
  );
}

export function StarInput({ value, onChange, size = 30 }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="star-input" onMouseLeave={() => setHover(0)}>
      <div role="radiogroup" aria-label="Your rating">
        {[1, 2, 3, 4, 5].map((index) => (
          <motion.button
            key={index}
            type="button"
            role="radio"
            aria-checked={value === index}
            aria-label={`${index} star${index > 1 ? 's' : ''}`}
            className={index <= shown ? 'on' : ''}
            onMouseEnter={() => setHover(index)}
            onClick={() => onChange(index)}
            whileHover={{ scale: 1.18 }}
            whileTap={{ scale: 0.9 }}
            animate={value === index ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.25 }}
          >
            <Star size={size} fill={index <= shown ? 'currentColor' : 'none'} />
          </motion.button>
        ))}
      </div>
      <span className="star-input-label">{LABELS[shown] || 'Tap to rate'}</span>
    </div>
  );
}
