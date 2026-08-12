/**
 * A small stroke-icon set, drawn at 24px on currentColor. Icons do the work a
 * sentence used to: a guest scanning the day should read the shapes, not the
 * words. `name` comes from the session's `icon` field, falling back to its kind.
 */
const PATHS = {
  // Competition
  trophy: 'M7 4h10v5a5 5 0 0 1-10 0V4Zm0 2H4v1a3 3 0 0 0 3 3m10-4h3v1a3 3 0 0 1-3 3M9 19h6m-3-5v5',
  judo: 'M3 6h18v12H3V6Zm6 0v12m6-12v12', // a tatami, seen from above

  scale: 'M12 4v16M7 20h10M4 9h16M6 9l-2.5 5a3 3 0 0 0 5 0L6 9Zm12 0-2.5 5a3 3 0 0 0 5 0L18 9Z',
  // People and paperwork
  badge: 'M9 3h6v3H9V3Zm-3 3h12v15H6V6Zm3 5h6m-6 4h6',
  clipboard: 'M9 3h6v3H9V3ZM6 6h12v15H6V6Zm3 6h6m-6 4h4',
  // Movement
  plane: 'M2.5 12.5 21.5 5l-7 15-2.6-6.4-9.4-1.1Z',
  bus: 'M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9H4V6Zm0 9h16v3H4v-3Zm2 3v2m12-2v2M4 9h16',
  // Hospitality
  bed: 'M3 18v-9m0 5h18m0 4v-7a2 2 0 0 0-2-2H9v4M6.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  fork: 'M6 3v4a2 2 0 0 0 4 0V3M8 9v12M16 3c2 2 2 6 0 8v10', // fork and knife
  star: 'm12 3 2.6 5.6 6.1.8-4.5 4.2 1.2 6L12 16.7 6.6 19.6l1.2-6L3.3 9.4l6.1-.8L12 3Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3.5 2',
};

const BY_KIND = { competition: 'judo', social: 'star', logistics: 'clock' };

export default function Icon({ name, kind, className = '', size = 22 }) {
  const d = PATHS[name] ?? PATHS[BY_KIND[kind]] ?? PATHS.clock;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={d} />
    </svg>
  );
}
