import { Wrench, UserRound } from "lucide-react";
import EveryoneCard from "./EveryoneCard";

const providerFeatures = [
  "Steady stream of customers",
  "Flexible working hours",
  "GPS-guided navigation",
  "Secure payment system",
  "Build your reputation",
];

const driverFeatures = [
  "Request help in seconds",
  "Live provider tracking",
  "Transparent pricing",
  "Safety-first approach",
  "Complete service history",
];

export default function Everyone() {
  return (
    <section className="bg-[#0B1C2D] px-3 py-14 sm:px-4 sm:py-20 md:px-6 md:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <header className="mx-auto mb-10 max-w-3xl text-center sm:mb-12 md:mb-16 lg:mb-20">
          <h2 className="text-balance px-1 text-3xl font-bold leading-[1.12] tracking-tight text-white sm:px-0 sm:text-4xl sm:leading-[1.15] md:text-5xl lg:text-6xl">
            Built For Everyone
          </h2>
          <p className="text-pretty mt-3 px-1 text-base leading-relaxed text-slate-300 sm:mt-4 sm:px-2 sm:text-lg md:mt-5 md:text-xl">
            Whether you need help or want to provide it, ENQAZ has the perfect
            solution for you
          </p>
        </header>
        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 md:gap-10">
          <EveryoneCard
            variant="provider"
            eyebrow="Grow Your Business"
            title="For Service Providers"
            description="Connect with customers and increase your revenue"
            features={providerFeatures}
            ctaLabel="Start Earning"
            ctaHref="/provider"
            icon={<Wrench className="h-7 w-7" strokeWidth={2} aria-hidden />}
          />
          <EveryoneCard
            variant="driver"
            eyebrow="Need Assistance?"
            title="For Drivers"
            description="Get fast, reliable help when your vehicle breaks down"
            features={driverFeatures}
            ctaLabel="Get Help Now"
            ctaHref="/order"
            icon={<UserRound className="h-7 w-7" strokeWidth={2} aria-hidden />}
          />
        </div>
      </div>
    </section>
  );
}
