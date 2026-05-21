interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function Chip({ label, active = false, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={`flex h-7 shrink-0 items-center rounded-md px-3 text-xs font-medium transition-colors ${
        active
          ? "border border-eat-accent/25 bg-eat-accent/10 text-eat-accent"
          : "border border-eat-border bg-eat-surface text-eat-text2 hover:bg-eat-surface2"
      }`}
    >
      {label}
    </button>
  );
}
