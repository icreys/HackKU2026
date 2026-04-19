import { useState } from 'react';

export type BuildingKind = 'company' | 'school' | 'invest' | 'social' | 'medical';

interface Props {
  kind: BuildingKind;
  label: string;
  onClick?: () => void;
}

export default function Building({ kind, label, onClick }: Props) {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="doodle-card group p-4 flex flex-col items-center gap-2 transition-transform hover:-translate-y-1 active:translate-y-0"
    >
      <div className={hover ? 'animate-wiggle' : ''}>
        <BuildingIcon kind={kind} />
      </div>
      <span className="font-hand text-xl">{label}</span>
      <span className="font-sketch text-xs text-ink/60">点击进入</span>
    </button>
  );
}

function BuildingIcon({ kind }: { kind: BuildingKind }) {
  const common = { width: 96, height: 96, viewBox: '0 0 100 100' } as const;

  switch (kind) {
    case 'company':
      return (
        <svg {...common}>
          <path d="M15 85 L15 35 L55 35 L55 85 Z" className="doodle-stroke" />
          <path d="M55 85 L55 50 L85 50 L85 85 Z" className="doodle-stroke" />
          {/* windows */}
          <rect x="22" y="44" width="8" height="8" className="doodle-stroke" />
          <rect x="40" y="44" width="8" height="8" className="doodle-stroke" />
          <rect x="22" y="60" width="8" height="8" className="doodle-stroke" />
          <rect x="40" y="60" width="8" height="8" className="doodle-stroke" />
          <rect x="63" y="58" width="6" height="6" className="doodle-stroke" />
          <rect x="73" y="58" width="6" height="6" className="doodle-stroke" />
          <rect x="63" y="70" width="6" height="6" className="doodle-stroke" />
          <rect x="73" y="70" width="6" height="6" className="doodle-stroke" />
          {/* door */}
          <path d="M30 85 L30 72 L40 72 L40 85" className="doodle-stroke" />
          <path d="M15 85 L88 85" className="doodle-stroke" />
        </svg>
      );
    case 'school':
      return (
        <svg {...common}>
          {/* roof */}
          <path d="M10 50 L50 20 L90 50" className="doodle-stroke" />
          {/* body */}
          <path d="M18 50 L18 85 L82 85 L82 50" className="doodle-stroke" />
          {/* flag pole */}
          <path d="M50 20 L50 8 L62 12 L50 16" className="doodle-stroke" />
          {/* clock */}
          <circle cx="50" cy="60" r="8" className="doodle-stroke" />
          <path d="M50 60 L50 54 M50 60 L55 60" className="doodle-stroke" />
          {/* door */}
          <path d="M40 85 L40 72 Q50 66 60 72 L60 85" className="doodle-stroke" />
        </svg>
      );
    case 'invest':
      return (
        <svg {...common}>
          {/* bank columns */}
          <path d="M10 40 L50 18 L90 40" className="doodle-stroke" />
          <path d="M14 40 L86 40" className="doodle-stroke" />
          <path d="M14 80 L86 80" className="doodle-stroke" />
          <path d="M22 40 L22 80 M38 40 L38 80 M50 40 L50 80 M62 40 L62 80 M78 40 L78 80" className="doodle-stroke" />
          <path d="M10 86 L90 86" className="doodle-stroke" />
          {/* $ */}
          <text x="50" y="34" textAnchor="middle" className="font-hand" style={{ fontSize: 14, fill: '#1A1A1A' }}>$</text>
        </svg>
      );
    case 'social':
      return (
        <svg {...common}>
          {/* cafe house */}
          <path d="M15 85 L15 40 L85 40 L85 85 Z" className="doodle-stroke" />
          <path d="M10 40 L50 18 L90 40" className="doodle-stroke" />
          {/* awning stripes */}
          <path d="M15 50 L25 60 L35 50 L45 60 L55 50 L65 60 L75 50 L85 60" className="doodle-stroke" />
          {/* coffee cup */}
          <path d="M40 70 L40 80 Q40 84 44 84 L52 84 Q56 84 56 80 L56 70 Z" className="doodle-stroke" />
          <path d="M56 73 Q62 73 62 78 Q62 82 56 82" className="doodle-stroke" />
          {/* steam */}
          <path d="M44 66 Q46 62 44 58 M50 66 Q52 62 50 58" className="doodle-stroke" />
        </svg>
      );
    case 'medical':
      return (
        <svg {...common}>
          {/* hospital */}
          <path d="M18 85 L18 35 L82 35 L82 85 Z" className="doodle-stroke" />
          <path d="M18 35 L50 18 L82 35" className="doodle-stroke" />
          {/* cross */}
          <path d="M44 50 L56 50 L56 56 L62 56 L62 68 L56 68 L56 74 L44 74 L44 68 L38 68 L38 56 L44 56 Z" className="doodle-stroke" />
          <path d="M10 86 L90 86" className="doodle-stroke" />
        </svg>
      );
  }
}
