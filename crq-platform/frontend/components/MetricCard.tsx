interface MetricCardProps {
  label: string;
  value: string;
  sublabel?: string;
  tone?: "default" | "accent" | "warning";
}

const toneMap: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  default: "border-ink/10 text-ink",
  accent: "border-accent/40 text-accent",
  warning: "border-signal/50 text-signal",
};

export function MetricCard({ label, value, sublabel, tone = "default" }: MetricCardProps) {
  return (
    <div className={`rounded-2xl border bg-white p-6 ${toneMap[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
      {sublabel && <p className="mt-1 text-sm text-ink/60">{sublabel}</p>}
    </div>
  );
}
