"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ConnectionField } from "./connection-field";

export function LandingHero() {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [count, setCount] = useState({ students: 0, teams: 0, events: 0 });

  useEffect(() => {
    const targets = { students: 1240, teams: 186, events: 42 };
    const start = performance.now();
    const duration = 1400;
    let frame: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount({
        students: Math.round(targets.students * eased),
        teams: Math.round(targets.teams * eased),
        events: Math.round(targets.events * eased),
      });
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x, y });
  }

  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })} className="relative">
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/25 blur-[130px] animate-aurora transition-transform duration-300 ease-out"
        style={{ transform: `translate(calc(-50% + ${tilt.x * 30}px), ${tilt.y * 20}px)` }}
      />
      <div
        className="pointer-events-none absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[110px] animate-aurora transition-transform duration-300 ease-out"
        style={{ animationDelay: "3s", transform: `translate(${tilt.x * -40}px, ${tilt.y * -25}px)` }}
      />

      <section className="relative flex flex-col items-center px-4 pb-16 pt-24 text-center">
        <span className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-accent animate-riseIn">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulseGlow" />
          For students, by students
        </span>
        <h1 className="font-display max-w-3xl text-5xl font-semibold leading-tight text-white md:text-6xl animate-riseIn" style={{ animationDelay: "0.1s" }}>
          Build your <span className="gradient-text">dream team</span> for what&apos;s next
        </h1>
        <p className="mt-5 max-w-xl text-gray-400 animate-riseIn" style={{ animationDelay: "0.2s" }}>
          FixitHub matches you with teammates by skill, role, and goal — then helps you form a team, join events, and ship together.
        </p>
        <div className="mt-8 flex gap-3 animate-riseIn" style={{ animationDelay: "0.3s" }}>
          <Link
            href="/register"
            className="glow-ring group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-medium text-white shadow-glow transition-all hover:shadow-glow-lg hover:-translate-y-0.5"
          >
            Get started
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/login" className="glass inline-flex items-center rounded-xl px-6 py-3 text-sm font-medium text-gray-200 transition-colors hover:bg-white/10">
            Sign in
          </Link>
        </div>

        <div className="mt-12 flex gap-10 animate-riseIn" style={{ animationDelay: "0.4s" }}>
          {[
            { label: "Students matched", value: count.students },
            { label: "Active teams", value: count.teams },
            { label: "Live events", value: count.events },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display gradient-text text-3xl font-semibold tabular-nums">{s.value.toLocaleString()}+</p>
              <p className="mt-1 text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div
        className="relative mx-auto -mt-4 mb-4 max-w-4xl px-4 opacity-90 transition-transform duration-300 ease-out"
        style={{ transform: `rotateX(${tilt.y * -4}deg) rotateY(${tilt.x * 4}deg)` }}
      >
        <ConnectionField className="w-full h-auto" />
      </div>
    </div>
  );
}