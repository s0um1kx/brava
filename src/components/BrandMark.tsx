export function BrandMark({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <path d="M38,84 C29.5,68.6 29.5,71.4 38,55 C46.5,71.4 46.5,68.6 38,84 Z" fill={color} />
      <path d="M63,86 C51.9,63.7 51.9,68.3 63,29 C74.1,68.3 74.1,63.7 63,86 Z" fill={color} />
      <path d="M88,84 C80.5,68.9 80.5,71.1 88,47 C95.5,71.1 95.5,68.9 88,84 Z" fill={color} />
    </svg>
  );
}
