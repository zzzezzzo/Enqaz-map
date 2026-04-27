type StatTone = "emerald" | "blue" | "red" | "slate";

const toneToSubtext: Record<StatTone, string> = {
  emerald: "text-emerald-600",
  blue: "text-sky-700",
  red: "text-red-600",
  slate: "text-slate-600",
};

type Props = {
  title: string;
  value: number;
  subtext: string;
  tone: StatTone;
};

export function AdminAccountStatCard({ title, value, subtext, tone }: Props) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className={`mt-0.5 text-sm font-medium ${toneToSubtext[tone]}`}>{subtext}</p>
    </div>
  );
}
