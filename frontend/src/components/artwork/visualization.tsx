/**
 * VisualizationIllustration — the same gown rendered as a realistic satin
 * visualization on a studio backdrop. Pure SVG. Shares its silhouette with
 * SketchIllustration for the hero comparison slider.
 */

type Props = {
  className?: string;
  /** Rotate the dress hue (used for variation thumbnails). */
  dressHue?: number;
};

export function VisualizationIllustration({
  className,
  dressHue = 0,
}: Props) {
  return (
    <svg
      viewBox="0 0 800 1000"
      className={className}
      role="img"
      aria-label="Realistic AI visualization of an evening gown in deep green satin"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="viz-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2ece1" />
          <stop offset="55%" stopColor="#eae2d3" />
          <stop offset="100%" stopColor="#ddd2be" />
        </linearGradient>
        <radialGradient id="viz-light" cx="50%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fffdf7" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fffdf7" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="viz-vignette" cx="50%" cy="46%" r="72%">
          <stop offset="62%" stopColor="rgba(40,30,20,0)" />
          <stop offset="100%" stopColor="rgba(40,30,20,0.16)" />
        </radialGradient>
        <linearGradient id="viz-dress" x1="0.15" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#3a6351" />
          <stop offset="42%" stopColor="#27493d" />
          <stop offset="100%" stopColor="#142c23" />
        </linearGradient>
        <linearGradient id="viz-fold" x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#0f221b" />
          <stop offset="100%" stopColor="#0a1813" />
        </linearGradient>
        <linearGradient id="viz-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8f4ec" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#e8f4ec" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#e8f4ec" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="viz-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(30,24,16,0.22)" />
          <stop offset="100%" stopColor="rgba(30,24,16,0)" />
        </radialGradient>
      </defs>

      {/* Studio backdrop */}
      <rect width="800" height="1000" fill="url(#viz-bg)" />
      <rect width="800" height="1000" fill="url(#viz-light)" />

      {/* Body — head, neck, shoulders behind the garment */}
      <g opacity="0.5" fill="#2a241d">
        <path d="M 258 224 Q 316 146 372 170 L 428 170 Q 484 146 542 224 L 542 246 L 258 246 Z" />
        <rect x="374" y="108" width="52" height="74" rx="22" />
        <ellipse cx="400" cy="84" rx="35" ry="46" />
      </g>

      {/* Ground shadow */}
      <ellipse cx="400" cy="896" rx="300" ry="30" fill="url(#viz-shadow)" />

      {/* The gown */}
      <g style={dressHue ? { filter: `hue-rotate(${dressHue}deg)` } : undefined}>
        {/* main body */}
        <path
          d="M 308 212
            Q 340 258 400 258
            Q 460 258 492 212
            Q 476 300 438 392
            Q 452 434 448 480
            Q 486 560 585 868
            Q 400 902 215 868
            Q 314 560 352 480
            Q 348 434 362 392
            Q 324 300 308 212 Z"
          fill="url(#viz-dress)"
        />

        {/* skirt folds — shadow wedges */}
        <g fill="url(#viz-fold)">
          <path d="M 362 392 Q 322 620 262 860 Q 298 872 330 870 Q 366 640 400 480 Z" opacity="0.5" />
          <path d="M 400 480 Q 372 660 322 882 Q 366 890 392 886 Q 424 660 430 484 Z" opacity="0.42" />
          <path d="M 444 480 Q 452 660 452 884 Q 486 882 516 876 Q 488 630 452 480 Z" opacity="0.46" />
          <path d="M 432 392 Q 452 560 540 856 Q 560 846 574 834 Q 492 560 448 392 Z" opacity="0.3" />
        </g>

        {/* skirt sheen — broad soft highlight */}
        <path
          d="M 322 392 Q 276 640 240 830 Q 300 868 336 872 Q 366 660 400 480 Z"
          fill="url(#viz-sheen)"
          opacity="0.55"
        />

        {/* bodice highlight */}
        <path
          d="M 318 232 Q 344 272 392 260 Q 376 316 356 372 Q 336 316 318 232 Z"
          fill="url(#viz-sheen)"
          opacity="0.7"
        />

        {/* waist seam */}
        <path d="M 356 392 Q 400 408 444 392" stroke="#0d211a" strokeWidth="5" fill="none" opacity="0.35" />
        <path d="M 356 396 Q 400 412 444 396" stroke="#dceadf" strokeWidth="1.5" fill="none" opacity="0.3" />

        {/* neckline rim */}
        <path
          d="M 316 222 Q 400 274 484 222"
          stroke="#c9ded2"
          strokeWidth="3"
          fill="none"
          opacity="0.55"
          strokeLinecap="round"
        />

        {/* hem light */}
        <path
          d="M 224 866 Q 400 898 576 866"
          stroke="#a9c6b6"
          strokeWidth="2.4"
          fill="none"
          opacity="0.4"
          strokeLinecap="round"
        />
      </g>

      {/* Vignette */}
      <rect width="800" height="1000" fill="url(#viz-vignette)" />
    </svg>
  );
}