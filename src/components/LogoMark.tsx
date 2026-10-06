export default function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="14" fill="#0a0a0f" />
      <g transform="rotate(-8 32 20)">
        <rect x="10" y="12" width="44" height="11" rx="2" fill="#ffb703" />
        <path d="M20 12l-6 11M32 12l-6 11M44 12l-6 11" stroke="#0a0a0f" strokeWidth="4" />
      </g>
      <rect x="10" y="28" width="44" height="26" rx="3" fill="#ffb703" />
      <polygon
        points="32,32 34.35,37.76 40.56,38.22 35.8,42.24 37.29,48.28 32,45 26.71,48.28 28.2,42.24 23.44,38.22 29.65,37.76"
        fill="#0a0a0f"
      />
    </svg>
  );
}