/** Thin curved lines linking the side cards to the portrait. Coordinates are in a 1440x1000 space. */
export function ConnectorLines({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 1000"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden
    >
      <path
        d="M175 400 C 175 560, 330 630, 560 610"
        stroke="currentColor"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M1270 470 C 1275 600, 1130 660, 900 650"
        stroke="currentColor"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
