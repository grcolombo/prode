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

  const isExpired = time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0;

  if (isExpired) {
    return (
      <div className="text-center">
        <p className="text-green-400 font-bold text-xl">¡El Mundial ya comenzó!</p>
        <p className="text-gray-400 text-sm mt-1">Los pronósticos están cerrados</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-gray-400 text-sm uppercase tracking-widest mb-3">
        Cierre de pronósticos en
      </p>
      <div className="flex gap-3 justify-center">
        {[
          { value: time.days, label: "días" },
          { value: time.hours, label: "hs" },
          { value: time.minutes, label: "min" },
          { value: time.seconds, label: "seg" },
        ].map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center">
            <span className="bg-white/10 rounded-xl px-4 py-3 text-3xl font-bold tabular-nums min-w-[60px] text-center">
              {pad(value)}
            </span>
            <span className="text-gray-500 text-xs mt-1">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
