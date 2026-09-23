type LogoProps = {
  footer?: boolean;
};

export default function Logo({ footer = false }: LogoProps) {
  return (
    <span className={`ussx-logo ${footer ? "ussx-logo--footer" : ""}`}>
      <svg
        className="ussx-logo__mark"
        viewBox="0 0 92 66"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="brickFace" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#234F7F" />
            <stop offset="100%" stopColor="#173A60" />
          </linearGradient>
        </defs>

        {/* textile brick */}
        <g transform="translate(7 9)">
          <path
            d="M6 8 L60 2 L72 14 L66 45 L13 51 L2 39 Z"
            fill="url(#brickFace)"
            stroke="#D7AF47"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* diagonal cuts inspired by the sketch */}
          <path
            d="M24 5 L13 48"
            stroke="#F5F1E9"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M49 3 L38 47"
            stroke="#F5F1E9"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* subtle textile texture */}
          <g
            stroke="#F5F1E9"
            strokeWidth="0.8"
            opacity="0.28"
            strokeLinecap="round"
          >
            <line x1="8" y1="16" x2="64" y2="10" />
            <line x1="6" y1="24" x2="66" y2="18" />
            <line x1="5" y1="32" x2="65" y2="26" />
            <line x1="8" y1="40" x2="63" y2="34" />
          </g>

          {/* small gold textile fibre detail */}
          <path
            d="M58 38 C62 34, 66 35, 68 31"
            fill="none"
            stroke="#D7AF47"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>

      <span className="ussx-logo__type">
        <strong>USS X</strong>
        <small>KREATIV</small>
      </span>
    </span>
  );
}
