import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const PHRASES = [
  'ToolsJockey.com',
  'Supercharged Multi-Tool Web App',
  'All your favorite tools, grouped for productivity.'
];

const DURATION = 5000; // 5 seconds

const HeaderRotator = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setIndex(i => (i + 1) % PHRASES.length);
    }, DURATION);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, prefersReducedMotion]);

  // Pause on mouse enter, resume on leave
  const handleMouseEnter = () => setPaused(true);
  const handleMouseLeave = () => setPaused(false);

  return (
    <span
      className="relative h-8 overflow-hidden font-semibold text-white whitespace-nowrap truncate min-w-0 select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ maxWidth: 320 }}
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        <motion.span
          key={PHRASES[prefersReducedMotion ? 0 : index]}
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
          transition={{ duration: 0.45 }}
          className="block absolute left-0 right-0 top-0 truncate"
        >
          {PHRASES[prefersReducedMotion ? 0 : index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};

export default HeaderRotator; 