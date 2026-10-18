import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * RoutePreloaderBar
 * Displays a sleek top glowing progress bar on route transitions,
 * giving farmers immediate visual feedback that the next page is preloading.
 */
export default function RoutePreloaderBar() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(30);

    const midTimer = setTimeout(() => {
      setProgress(75);
    }, 100);

    const endTimer = setTimeout(() => {
      setProgress(100);
    }, 250);

    const hideTimer = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 450);

    return () => {
      clearTimeout(midTimer);
      clearTimeout(endTimer);
      clearTimeout(hideTimer);
    };
  }, [location.pathname, location.search]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none overflow-hidden bg-transparent">
      <div 
        className="h-full bg-gradient-to-r from-[#9fd700] via-[#84cc16] to-[#4ade80] shadow-[0_0_12px_rgba(159,215,0,0.8)] transition-all duration-200 ease-out"
        style={{ width: `${progress}%`, opacity: progress === 100 ? 0 : 1 }}
      />
    </div>
  );
}
