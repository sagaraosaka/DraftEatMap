interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  dot?: string;
}

export default function Chip({ label, active = false, onClick, dot }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`flex h-7 shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors ${
        active
          ? "border border-eat-accent/25 bg-eat-accent/10 text-eat-accent"
          : "border border-eat-border bg-eat-surface text-eat-text2 hover:bg-eat-surface2"
      }`}
    >
      {dot && <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />}
      {label}
    </button>
  );
}
