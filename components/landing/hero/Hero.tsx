import StatsCards from "./StatsCards";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-3 py-12 text-white sm:px-4 sm:py-16 md:py-20 lg:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-10 xl:gap-14">
        <div className="w-full text-center lg:min-w-0 lg:max-w-xl lg:flex-1 lg:text-left xl:max-w-2xl">
          <h1 className="text-balance text-3xl font-bold leading-[1.1] sm:text-4xl sm:leading-tight md:text-5xl lg:text-[3.25rem] lg:leading-[1.08] xl:text-6xl">
            <span className="mb-1 block text-white sm:mb-2">24/7</span>
            <div className="mt-1 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 sm:gap-x-3 lg:justify-start">
              <span className="border-b-[3px] border-[#FF9F1C]/55 pb-0.5 text-[#E18100]">
                Roadside
              </span>
              <span className="text-white">Assistance</span>
            </div>
          </h1>
          <p className="text-pretty mx-auto mt-5 max-w-2xl text-base leading-relaxed text-gray-300 sm:mt-6 sm:text-lg md:mt-8 md:text-xl lg:mx-0">
            Contact reliable mechanics and workshops immediately. Get help when
            you need it most. Real-time tracking, instant matching, guaranteed
            service.
          </p>
          <div className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:mt-10 sm:mx-auto sm:flex-row sm:justify-center sm:gap-4 lg:mx-0 lg:max-w-none lg:justify-start">
            <a
              href="/order"
              className="inline-flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#FF8C00] to-[#FF9F1C] px-6 py-3 text-center text-sm font-bold text-white shadow-lg transition-colors hover:from-[#FF9F1C] hover:to-[#FF8C00] sm:min-h-0 sm:w-auto sm:px-8 sm:py-3.5 sm:text-base md:px-10 md:py-4 md:text-lg"
            >
              Request Assistance Now
              <ArrowRight className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden />
            </a>
            <a
              href="/provider"
              className="inline-flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-slate-700/90 px-6 py-3 text-center text-sm font-bold text-white shadow-lg transition-colors hover:bg-slate-600 sm:min-h-0 sm:w-auto sm:px-8 sm:py-3.5 sm:text-base md:px-10 md:py-4 md:text-lg"
            >
              Join as Provider
              <ArrowRight className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" aria-hidden />
            </a>
          </div>
          <div className="mt-8 flex flex-col items-center gap-3 text-gray-300 sm:mt-10 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2 lg:justify-start">
            <p className="flex items-center gap-2 text-xs font-medium sm:text-sm">
              <CheckCircle className="h-4 w-4 shrink-0 text-green-500 sm:h-5 sm:w-5" aria-hidden />
              GPS Tracking
            </p>
            <p className="flex items-center gap-2 text-xs font-medium sm:text-sm">
              <CheckCircle className="h-4 w-4 shrink-0 text-green-500 sm:h-5 sm:w-5" aria-hidden />
              Verified Providers
            </p>
            <p className="flex items-center gap-2 text-xs font-medium sm:text-sm">
              <CheckCircle className="h-4 w-4 shrink-0 text-green-500 sm:h-5 sm:w-5" aria-hidden />
              24/7 Support
            </p>
          </div>
        </div>
        <div className="mx-auto w-full max-w-md shrink-0 sm:max-w-lg lg:mx-0 lg:max-w-sm xl:max-w-md">
          <StatsCards />
        </div>
      </div>
    </section>
  );
}
