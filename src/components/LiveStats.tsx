'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Clock, Users } from 'lucide-react';

interface PublicStats {
  totalAspirations: number;
  totalUsers: number;
  respondedPercent: number;
  resolvedPercent: number;
  avgFirstResponseHours: number | null;
}

function useCountUp(target: number | null, start: boolean, decimals = 0, duration = 1400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start || target === null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(parseFloat((target * eased).toFixed(decimals)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, decimals, duration]);

  return value;
}

export function LiveStats() {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [failed, setFailed] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/stats/public')
      .then((r) => {
        if (!r.ok) throw new Error('stats fetch failed');
        return r.json();
      })
      .then(setStats)
      .catch(() => setFailed(true));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const responded = useCountUp(stats?.respondedPercent ?? null, inView, 1);
  const total = useCountUp(stats?.totalAspirations ?? null, inView, 0);

  const loading = !stats && !failed;

  return (
    <div ref={ref} className="pt-6 border-t border-zinc-100 space-y-4">
      <div className="grid grid-cols-2 gap-8 max-w-sm">
        <div>
          {loading ? (
            <div className="h-9 w-24 bg-zinc-100 animate-pulse rounded-md" />
          ) : (
            <p className="text-3xl sm:text-4xl font-extrabold text-[#00638E] tracking-tight tabular-nums">
              {failed ? '—' : `${responded.toFixed(1)}%`}
            </p>
          )}
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
            Aspirasi direspons resmi
          </p>
        </div>
        <div>
          {loading ? (
            <div className="h-9 w-16 bg-zinc-100 animate-pulse rounded-md" />
          ) : (
            <p className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight tabular-nums">
              {failed ? '—' : total}
            </p>
          )}
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-1">
            Aspirasi masuk tercatat
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-2 text-xs text-zinc-600">
        {loading ? (
          <div className="h-4 w-64 bg-zinc-100 animate-pulse rounded" />
        ) : failed ? (
          <span className="text-zinc-500">Statistik belum dapat dimuat.</span>
        ) : (
          <>
            <Clock size={14} className="text-[#00638E]" />
            <span className="font-bold text-[#004A6B] tabular-nums">
              {stats!.avgFirstResponseHours !== null ? `${stats!.avgFirstResponseHours} jam` : '—'}
            </span>
            <span className="text-zinc-500">rata-rata respons pertama</span>
            <span className="text-zinc-400">•</span>
            <Users size={14} className="text-[#00638E]" />
            <span className="font-bold text-[#004A6B] tabular-nums">{stats!.totalUsers}</span>
            <span className="text-zinc-500">civitas terdaftar</span>
          </>
        )}
      </div>
    </div>
  );
}