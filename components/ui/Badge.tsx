interface Props {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function Badge({ children, color, className }: Props) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${className ?? ""}`}
      style={color ? { backgroundColor: `${color}22`, color, borderColor: `${color}44`, borderWidth: "1px", borderStyle: "solid" } : {}}
    >
      {children}
    </span>
  );
}
