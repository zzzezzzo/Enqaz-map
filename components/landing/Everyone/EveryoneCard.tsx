import Link from "next/link";
import { Check } from "lucide-react";

export type EveryoneCardVariant = "provider" | "driver";

export interface EveryoneCardProps {
  variant: EveryoneCardVariant;
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  icon: React.ReactNode;
}

export default function EveryoneCard({
  variant,
  eyebrow,
  title,
  description,
  features,
  ctaLabel,
  ctaHref,
  icon,
}: EveryoneCardProps) {
  const isProvider = variant === "provider";

  return (
    <div
      className={`flex flex-col rounded-2xl p-6 text-left shadow-xl transition-transform duration-300 hover:-translate-y-0.5 sm:p-8 md:p-10 ${
        isProvider
          ? "bg-gradient-to-br from-[#E18100] to-[#FF8C00] text-white"
          : "border border-slate-200/80 bg-white text-slate-900"
      }`}
    >
      <div
        className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl ${
          isProvider ? "bg-white/20 text-white" : "bg-[#E18100] text-white"
        }`}
      >
        <span className="scale-110 [&>svg]:h-7 [&>svg]:w-7">{icon}</span>
      </div>

      <p
        className={`mb-1 text-sm font-semibold uppercase tracking-wide ${
          isProvider ? "text-white/90" : "text-[#E18100]"
        }`}
      >
        {eyebrow}
      </p>
      <h3
        className={`mb-3 text-balance text-xl font-bold sm:text-2xl md:text-3xl ${
          isProvider ? "text-white" : "text-[#0B1C2D]"
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-pretty mb-6 text-sm leading-relaxed sm:mb-8 sm:text-base ${
          isProvider ? "text-white/95" : "text-slate-600"
        }`}
      >
        {description}
      </p>

      <ul className="mb-8 flex flex-col gap-2.5 sm:mb-10 sm:gap-3">
        {features.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm sm:gap-3 sm:text-base">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                isProvider ? "bg-white/25 text-white" : "bg-emerald-500 text-white"
              }`}
            >
              <Check className="h-3 w-3 stroke-[3]" aria-hidden />
            </span>
            <span className={isProvider ? "text-white/95" : "text-slate-700"}>
              {item}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <Link
          href={ctaHref}
          className={`inline-flex w-full min-h-[3rem] items-center justify-center rounded-xl px-5 py-3 text-center text-sm font-bold transition-colors sm:min-h-0 sm:px-6 sm:py-3.5 sm:text-base ${
            isProvider
              ? "bg-white text-[#E18100] hover:bg-white/90"
              : "bg-gradient-to-r from-[#FF8C00] to-[#FF9F1C] text-white hover:from-[#FF9F1C] hover:to-[#FF8C00]"
          }`}
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
