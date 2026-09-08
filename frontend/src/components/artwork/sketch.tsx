/**
 * SketchIllustration — hand-drawn pencil sketch of an evening gown.
 * Pure SVG, no external assets. Layered strokes mimic pencil pressure.
 * Shares its silhouette with VisualizationIllustration so the two align
 * in the hero comparison slider.
 */

type Props = {
  className?: string;
  /** Show construction lines + measurement annotations (hero size only). */
  detailed?: boolean;
};

const PENCIL = "#4a443b";
const FAINT = "#8a8274";

export function SketchIllustration({ className, detailed = true }: Props) {
  return (
    <svg
      viewBox="0 0 800 1000"
      className={className}
      role="img"
      aria-label="Hand-drawn fashion sketch of an evening gown"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="sk-paper" cx="50%" cy="42%" r="75%">
          <stop offset="0%" stopColor="#faf6ee" />
          <stop offset="70%" stopColor="#f5efe4" />
          <stop offset="100%" stopColor="#ece3d2" />
        </radialGradient>
        <radialGradient id="sk-vignette" cx="50%" cy="45%" r="72%">
          <stop offset="60%" stopColor="rgba(90,74,52,0)" />
          <stop offset="100%" stopColor="rgba(90,74,52,0.10)" />
        </radialGradient>
      </defs>

      {/* Paper */}
      <rect width="800" height="1000" fill="url(#sk-paper)" />
      <rect width="800" height="1000" fill="url(#sk-vignette)" />

      {/* Construction lines */}
      {detailed && (
        <g stroke={FAINT} strokeWidth="1" opacity="0.5">
          <line x1="400" y1="120" x2="400" y2="930" />
          <line x1="250" y1="212" x2="550" y2="212" />
          <line x1="268" y1="392" x2="532" y2="392" />
          <line x1="258" y1="480" x2="542" y2="480" />
          <line x1="196" y1="868" x2="604" y2="868" />
          {/* bust/hip circles */}
          <ellipse cx="400" cy="298" rx="62" ry="46" />
          <ellipse cx="400" cy="656" rx="96" ry="58" />
          {/* hem measurement bracket */}
          <g stroke={FAINT} strokeWidth="1.1">
            <line x1="648" y1="480" x2="648" y2="868" />
            <line x1="642" y1="486" x2="654" y2="486" />
            <line x1="642" y1="862" x2="654" y2="862" />
          </g>
          <text
            x="660"
            y="690"
            fill={FAINT}
            fontSize="20"
            fontFamily="var(--font-mono), monospace"
            letterSpacing="1"
            transform="rotate(-90 660 690)"
            opacity="0.8"
          >
            L 96
          </text>
        </g>
      )}

      {/* Mannequin bust (faint) */}
      <ellipse
        cx="400"
        cy="186"
        rx="40"
        ry="52"
        fill="none"
        stroke={PENCIL}
        strokeWidth="1.2"
        opacity="0.22"
      />

      {/* Arms — freehand lines */}
      <g stroke={PENCIL} strokeWidth="2.2" fill="none" opacity="0.75" strokeLinecap="round">
        <path d="M 316 224 Q 270 300 244 396" />
        <path d="M 484 224 Q 530 300 556 396" />
        <path d="M 244 396 Q 236 414 240 430" opacity="0.5" />
        <path d="M 556 396 Q 564 414 560 430" opacity="0.5" />
      </g>

      {/*
        Dress silhouette — the shared outline. Drawn three times with tiny
        offsets and varying opacity to mimic layered pencil strokes.
      */}
      {[
        { dx: -1.4, dy: -1, o: 0.4, w: 2 },
        { dx: 1.2, dy: 1.6, o: 0.38, w: 2.2 },
        { dx: 0, dy: 0, o: 0.8, w: 2.6 },
      ].map((s, i) => (
        <g
          key={i}
          transform={`translate(${s.dx} ${s.dy})`}
          stroke={PENCIL}
          strokeWidth={s.w}
          fill="none"
          opacity={s.o}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M 308 212
            Q 340 258 400 258
            Q 460 258 492 212
            Q 476 300 438 392
            Q 452 434 448 480
            Q 486 560 585 868
            Q 400 902 215 868
            Q 314 560 352 480
            Q 348 434 362 392
            Q 324 300 308 212 Z"
          />
          {/* sweetheart inner line */}
          <path d="M 318 222 Q 400 272 482 222" opacity="0.6" />
          {/* waist seam */}
          <path d="M 356 392 Q 400 406 444 392" opacity="0.55" />
        </g>
      ))}

      {/* Drape lines inside the skirt */}
      {[
        "M 372 480 Q 338 640 268 848",
        "M 400 480 Q 356 660 312 870",
        "M 428 480 Q 398 660 372 882",
        "M 452 480 Q 460 660 452 884",
        "M 376 480 Q 410 660 428 884",
      ].map((d, i) => (
        <g key={i} transform={`translate(${(i % 3) - 1} ${(i % 2) * 1.4})`}>
          <path
            d={d}
            stroke={PENCIL}
            strokeWidth="1.7"
            fill="none"
            opacity="0.38"
            strokeLinecap="round"
          />
        </g>
      ))}

      {/* Loose sketchy marks — stray pencil energy */}
      <g stroke={PENCIL} fill="none" strokeLinecap="round" opacity="0.3">
        <path d="M 196 860 Q 176 872 188 884" strokeWidth="1.6" />
        <path d="M 604 858 Q 626 870 612 884" strokeWidth="1.6" />
        <path d="M 548 300 q 14 6 10 18" strokeWidth="1.4" />
        <path d="M 244 330 q 12 8 6 20" strokeWidth="1.4" />
      </g>
    </svg>
  );
}