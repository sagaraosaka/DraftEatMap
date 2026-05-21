interface AppHeaderProps {
  title?: string;
  right?: React.ReactNode;
}

export default function AppHeader({ title = "DraftEatMap", right }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-2">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-eat-accent" />
        <span className="text-[15px] font-bold tracking-tight text-eat-text">
          {title}
        </span>
      </div>
      {right && <div className="flex items-center gap-1.5">{right}</div>}
    </header>
  );
}
