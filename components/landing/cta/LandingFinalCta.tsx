import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingFinalCta() {
  return (
    <section className="relative overflow-hidden bg-[#0B1C2D] px-4 py-20 md:py-28">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(225,129,0,0.22),transparent_65%)]"
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h2 className="mb-5 text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
          Ready to Never Be Stranded Again?
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-200 md:mb-12 md:text-xl">
          Join thousands of drivers and service providers who trust ENQAZ for
          fast, reliable roadside assistance
        </p>
        <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center sm:justify-center">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF8C00] to-[#FF9F1C] px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:from-[#FF9F1C] hover:to-[#FF8C00] md:text-lg"
          >
            Start Free Today
            <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-slate-800/50 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-colors hover:border-white/40 hover:bg-slate-800/70 md:text-lg"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
