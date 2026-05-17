"use client";

import { useEffect, useState } from "react";

const DEADLINE = new Date("2026-06-11T19:00:00Z"); // 16:00 ART = 19:00 UTC

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const diff = DEADLINE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function Countdown() {
  const [time, setTime] = useState<TimeLeft>(getTimeLeft());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const isExpired =
    time.days === 0 &&
    time.hours === 0 &&
    time.minutes === 0 &&
    time.seconds === 0;

  if (isExpired) {
    return (
      <p className="text-brand-300 font-semibold text-base tracking-wide">
        ¡El Mundial ya comenzó · Pronósticos cerrados!
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs uppercase tracking-[0.2em] text-brand-400">
        Pronósticos cierran en
      </p>
      <div className="flex gap-2">
        {[
          { value: time.days, label: "días" },
          { value: time.hours, label: "hs" },
          { value: time.minutes, label: "min" },
          { value: time.seconds, label: "seg" },
        ].map(({ value, label }, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <span className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-2xl sm:text-3xl font-bold tabular-nums min-w-[52px] text-center text-white">
                {pad(value)}
              </span>
              <span className="text-brand-400 text-[10px] mt-1 uppercase tracking-widest">
                {label}
              </span>
            </div>
            {i < 3 && (
              <span className="text-brand-600 text-2xl font-light mb-4">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
