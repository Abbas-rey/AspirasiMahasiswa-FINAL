'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Clock, AlertTriangle, LogOut, CheckCircle2 } from 'lucide-react';

// Configuration: 1 Hour Idle Timeout
const INACTIVITY_LIMIT_MS = 60 * 60 * 1000; // 1 hour (3,600,000 ms)
const WARNING_BEFORE_LIMIT_MS = 2 * 60 * 1000; // Warning shown 2 minutes prior (at 58m)
const THROTTLE_ACTIVITY_MS = 10 * 1000; // Throttle activity updates to once every 10s
const CHECK_INTERVAL_MS = 2 * 1000; // Check elapsed idle time every 2 seconds
const STORAGE_KEY = 'asma_last_activity';

export function SessionTimeoutManager() {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(120);

  const lastActivityRef = useRef<number>(Date.now());
  const lastWriteRef = useRef<number>(0);
  const isLoggingOutRef = useRef<boolean>(false);

  // Check login state when pathname changes
  useEffect(() => {
    // Skip checking on /login page
    if (pathname === '/login') {
      setIsLoggedIn(false);
      setShowWarningModal(false);
      return;
    }

    let isMounted = true;
    fetch('/api/auth/me')
      .then((res) => {
        if (!isMounted) return;
        if (res.ok) {
          setIsLoggedIn(true);
          const now = Date.now();
          lastActivityRef.current = now;
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
              localStorage.setItem(STORAGE_KEY, now.toString());
            } else {
              lastActivityRef.current = parseInt(stored, 10) || now;
            }
          } catch {
            // localStorage not available
          }
        } else {
          res.json().then((data) => {
            if (data?.reason === 'device_limit') {
              try {
                localStorage.removeItem(STORAGE_KEY);
              } catch {}
              window.location.href = '/login?reason=device_limit';
            }
          }).catch(() => {});
          setIsLoggedIn(false);
          setShowWarningModal(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoggedIn(false);
          setShowWarningModal(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // Execute Logout due to inactivity
  const handleAutoLogout = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    try {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}

      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Failed to logout automatically:', err);
    } finally {
      setIsLoggedIn(false);
      setShowWarningModal(false);
      // Hard redirect to login page with reason parameter
      window.location.href = '/login?reason=inactivity';
    }
  }, []);

  // Update activity timestamp (throttled)
  const recordActivity = useCallback(() => {
    if (!isLoggedIn || isLoggingOutRef.current) return;

    const now = Date.now();
    lastActivityRef.current = now;

    // If warning modal was open, user activity immediately dismisses it
    setShowWarningModal(false);

    if (now - lastWriteRef.current >= THROTTLE_ACTIVITY_MS) {
      lastWriteRef.current = now;
      try {
        localStorage.setItem(STORAGE_KEY, now.toString());
      } catch {}
    }
  }, [isLoggedIn]);

  // Extend session explicitly by clicking "Tetap Masuk"
  const extendSession = () => {
    const now = Date.now();
    lastActivityRef.current = now;
    lastWriteRef.current = now;
    setShowWarningModal(false);
    try {
      localStorage.setItem(STORAGE_KEY, now.toString());
    } catch {}

    // Ping /api/auth/me to refresh server session state if needed
    fetch('/api/auth/me').catch(() => {});
  };

  // Setup Activity Listeners and Interval Timer
  useEffect(() => {
    if (!isLoggedIn || pathname === '/login') return;

    // Track user input events
    const events: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'click',
    ];

    const handleUserEvent = () => {
      recordActivity();
    };

    events.forEach((evt) => {
      window.addEventListener(evt, handleUserEvent, { passive: true });
    });

    // Cross-tab synchronization via storage event
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const timeFromOtherTab = parseInt(e.newValue, 10);
        if (!isNaN(timeFromOtherTab) && timeFromOtherTab > lastActivityRef.current) {
          lastActivityRef.current = timeFromOtherTab;
          setShowWarningModal(false);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Immediate check on tab focus or visibility change (e.g. laptop reopen after sleep)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check if session was invalidated remotely by another device
        fetch('/api/auth/me')
          .then((res) => {
            if (!res.ok) {
              res.json().then((data) => {
                if (data?.reason === 'device_limit') {
                  try {
                    localStorage.removeItem(STORAGE_KEY);
                  } catch {}
                  window.location.href = '/login?reason=device_limit';
                }
              }).catch(() => {});
            }
          })
          .catch(() => {});

        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = parseInt(stored, 10);
            if (!isNaN(parsed)) {
              lastActivityRef.current = parsed;
            }
          }
        } catch {}

        const now = Date.now();
        const elapsed = now - lastActivityRef.current;
        if (elapsed >= INACTIVITY_LIMIT_MS) {
          handleAutoLogout();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    // Periodic interval to evaluate idle duration
    const intervalId = window.setInterval(() => {
      const now = Date.now();
      let lastAct = lastActivityRef.current;

      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = parseInt(stored, 10);
          if (!isNaN(parsed) && parsed > lastAct) {
            lastAct = parsed;
            lastActivityRef.current = parsed;
          }
        }
      } catch {}

      const elapsed = now - lastAct;

      if (elapsed >= INACTIVITY_LIMIT_MS) {
        clearInterval(intervalId);
        handleAutoLogout();
      } else if (elapsed >= INACTIVITY_LIMIT_MS - WARNING_BEFORE_LIMIT_MS) {
        const remainingMs = INACTIVITY_LIMIT_MS - elapsed;
        setSecondsRemaining(Math.max(1, Math.ceil(remainingMs / 1000)));
        setShowWarningModal(true);
      } else {
        setShowWarningModal(false);
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserEvent);
      });
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [isLoggedIn, pathname, recordActivity, handleAutoLogout]);

  if (!isLoggedIn || !showWarningModal || pathname === '/login') {
    return null;
  }

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedCountdown = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div role="alertdialog" aria-modal="true" aria-labelledby="stm-title" className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-zinc-200 transform animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-300 flex items-center justify-center text-zinc-600 mb-4">
          <Clock size={24} className="animate-pulse" />
        </div>

        <h3 id="stm-title" className="text-lg font-bold text-zinc-950 mb-2">
          Peringatan: Sesi Akan Berakhir
        </h3>

        <p className="text-xs text-zinc-600 leading-relaxed mb-4">
          Anda tidak melakukan aktivitas selama hampir 1 jam. Demi keamanan data akun Anda, sistem akan otomatis mengeluarkan Anda dalam:
        </p>

        {/* Countdown Box */}
        <div className="flex items-center justify-center py-3 px-4 rounded-xl bg-zinc-50 border border-zinc-300 mb-5 text-center">
          <span className="font-mono text-2xl font-extrabold text-zinc-800 tracking-wider" role="timer" aria-live="off">
            {formattedCountdown}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={extendSession}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} />
            <span>Tetap Masuk</span>
          </button>

          <button
            type="button"
            onClick={handleAutoLogout}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-medium border border-zinc-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut size={14} />
            <span>Keluar Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
}
