interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md";
}

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center font-semibold transition-opacity rounded-lg";
  const sizes = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm" };
  const variants = {
    primary: "bg-eat-text text-eat-bg hover:opacity-85",
    ghost:   "bg-eat-surface border border-eat-border text-eat-text2 hover:bg-eat-surface2",
    danger:  "bg-eat-red/10 border border-eat-red/20 text-eat-red hover:bg-eat-red/15",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
