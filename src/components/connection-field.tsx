"use client";

/**
 * Signature visual: a live "matching signal" network. Nodes represent people;
 * pulses travel along the connecting lines the moment two nodes match —
 * a literal picture of what FixitHub does.
 */
export function ConnectionField({ className }: { className?: string }) {
  const paths = [
    "M40,260 C160,120 260,340 420,180",
    "M420,180 C540,60 640,240 760,120",
    "M40,260 C180,380 320,300 480,400",
    "M480,400 C600,320 680,420 800,340",
    "M760,120 C820,220 780,320 800,340",
  ];
  const nodes = [
    [40, 260], [420, 180], [760, 120], [480, 400], [800, 340], [260, 340],
  ];

  return (
    <svg
      viewBox="0 0 840 460"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity="1" />
          <stop offset="100%" stopColor="#67e8f9" stopOpacity="0" />
        </radialGradient>
      </defs>

      {paths.map((d, i) => (
        <path key={i} d={d} stroke="url(#lineGrad)" strokeWidth="1" opacity="0.35" />
      ))}
      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#22d3ee" />
      </linearGradient>

      {paths.map((d, i) => (
        <circle key={`dot-${i}`} r="3.5" fill="#67e8f9" className="signal-dot" opacity="0">
          <animateMotion dur={`${3.5 + i * 0.7}s`} repeatCount="indefinite" path={d} begin={`${i * 0.6}s`} />
          <animate attributeName="opacity" values="0;1;1;0" dur={`${3.5 + i * 0.7}s`} repeatCount="indefinite" begin={`${i * 0.6}s`} />
        </circle>
      ))}

      {nodes.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="22" fill="url(#nodeGlow)" opacity="0.5" />
          <circle cx={x} cy={y} r="4" fill="#e5e7eb" className="animate-pulseGlow" style={{ animationDelay: `${i * 0.3}s` }} />
        </g>
      ))}
    </svg>
  );
}