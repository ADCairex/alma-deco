interface DeerLogoProps {
  className?: string;
  color?: string;
}

export function DeerLogo({ className, color = "currentColor" }: DeerLogoProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color }}
    >
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M31.5 24.5c-2.8-3.7-4.7-8.3-4.7-13.5" />
        <path d="M26.8 16.3 21 11.7" />
        <path d="M26.1 11.4 18 8.7" />
        <path d="M24.9 20.1 17 19.2" />
        <path d="M32.5 24.5c2.8-3.7 4.7-8.3 4.7-13.5" />
        <path d="M37.2 16.3 43 11.7" />
        <path d="M37.9 11.4 46 8.7" />
        <path d="M39.1 20.1 47 19.2" />
        <path d="M25.8 27.5c0-3.6 2.8-6.5 6.2-6.5s6.2 2.9 6.2 6.5v7.3c0 6.8-2.6 12-6.2 15.4-3.6-3.4-6.2-8.6-6.2-15.4z" />
        <path d="M29.2 37.2c1.8 1.2 3.8 1.2 5.6 0" />
        <path d="M28.7 49.4 26.5 58" />
        <path d="M35.3 49.4 37.5 58" />
      </g>
    </svg>
  );
}
