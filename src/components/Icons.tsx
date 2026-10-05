type IconProps = { className?: string };

const base = "h-6 w-6";

/** Line icons drawn on a 24px grid so stroke weight stays consistent. */
export const icons = {
  cloud: ({ className = base }: IconProps) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.2 18.5h9.9a3.9 3.9 0 0 0 .55-7.76 5.6 5.6 0 0 0-10.72-1.5A4.13 4.13 0 0 0 7.2 18.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  code: ({ className = base }: IconProps) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 7.5 4.5 12 9 16.5M15 7.5 19.5 12 15 16.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  spark: ({ className = base }: IconProps) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.5l1.65 4.6a3 3 0 0 0 1.75 1.78L20 11.5l-4.6 1.65a3 3 0 0 0-1.78 1.75L12 19.5l-1.65-4.6a3 3 0 0 0-1.75-1.78L4 11.5l4.6-1.65a3 3 0 0 0 1.78-1.75Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  compass: ({ className = base }: IconProps) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M14.8 9.2l-1.6 4-4 1.6 1.6-4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  shield: ({ className = base }: IconProps) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.5l7 2.4v5.3c0 4-2.8 7.5-7 9.3-4.2-1.8-7-5.3-7-9.3V5.9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 12.1l2 2 3.6-3.9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  people: ({ className = base }: IconProps) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9.3" cy="9" r="3.1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.8 19.2a5.6 5.6 0 0 1 11 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M16.2 6.2a3.1 3.1 0 0 1 0 5.9M17.6 14.5a5.6 5.6 0 0 1 2.7 4.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  ),
} as const;

export type IconName = keyof typeof icons;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const Component = icons[name];
  return <Component className={className} />;
}

export function ArrowRight({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 8h9.5M9 4.5 12.5 8 9 11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Check({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className = "h-9 w-9" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="vbloom-logo" x1="4" y1="36" x2="36" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0a8364" />
          <stop offset="0.55" stopColor="#33bf92" />
          <stop offset="1" stopColor="#6d5efc" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#vbloom-logo)" />
      {/* A "V" that opens into a blooming petal. */}
      <path
        d="M11 12.5l6.6 15.2 3-6.9"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20.6 20.8c0-4.6 3.3-8.3 8.4-8.3 0 5.4-3.8 8.3-8.4 8.3Z" fill="#ffffff" fillOpacity="0.92" />
    </svg>
  );
}
