import { useEffect, useRef, useState } from 'react';

const WARN_AFTER_MS = 25 * 60 * 1000;  // 25 minutes
const SIGNOUT_AFTER_MS = 30 * 60 * 1000; // 30 minutes

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

export function useInactivityTimeout(onSignOut: () => void) {
  const [showWarning, setShowWarning] = useState(false);
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signOutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (warnTimer.current) clearTimeout(warnTimer.current);
    if (signOutTimer.current) clearTimeout(signOutTimer.current);
  };

  const resetTimers = () => {
    clearTimers();
    setShowWarning(false);
    warnTimer.current = setTimeout(() => setShowWarning(true), WARN_AFTER_MS);
    signOutTimer.current = setTimeout(() => onSignOut(), SIGNOUT_AFTER_MS);
  };

  const staySignedIn = () => resetTimers();

  useEffect(() => {
    resetTimers();
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, resetTimers, { passive: true }));
    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, resetTimers));
    };
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  return { showWarning, staySignedIn };
}
