interface AppHeaderProps {
  title?: string;
  right?: React.ReactNode;
}

export default function AppHeader({ title = "食べイコ", right }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 pt-safe">
      <div className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="h-6 w-6 shrink-0">
          <path d="M256 88C188 88 134 142 134 210c0 54 30 100 74 132l48 84 48-84c44-32 74-78 74-132C378 142 324 88 256 88Z" fill="#C8952A"/>
          <line x1="228" y1="152" x2="228" y2="206" stroke="white" strokeWidth="18" strokeLinecap="round"/>
          <line x1="256" y1="152" x2="256" y2="206" stroke="white" strokeWidth="18" strokeLinecap="round"/>
          <line x1="284" y1="152" x2="284" y2="206" stroke="white" strokeWidth="18" strokeLinecap="round"/>
          <path d="M228 206 Q228 228 256 228 Q284 228 284 206" fill="none" stroke="white" strokeWidth="18" strokeLinecap="round"/>
          <line x1="256" y1="228" x2="256" y2="286" stroke="white" strokeWidth="18" strokeLinecap="round"/>
        </svg>
        <span className="text-[15px] font-bold tracking-tight text-eat-text">
          {title}
        </span>
      </div>
      {right && <div className="flex items-center gap-1.5">{right}</div>}
    </header>
  );
}
