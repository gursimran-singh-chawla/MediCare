import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView } from 'framer-motion';

export function Reveal({ children, delay = 0, y = 24, className, as = 'div' }) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}

export const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
};

export const staggerChild = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }
};

export function CountUp({ to, suffix = '', duration = 1.6 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(0, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => setValue(Math.round(latest))
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return <span ref={ref}>{value.toLocaleString()}{suffix}</span>;
}
