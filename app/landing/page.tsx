import Nav from "@/components/layout/nav";
import Footer from "@/components/layout/footer";
import Hero from "@/components/landing/hero/Hero";
import Services from "@/components/landing/services/Services";
import WhyUs from "@/components/landing/why-us/WhyUs";
import Everyone from "@/components/landing/Everyone/Everyone";
import LandingFinalCta from "@/components/landing/cta/LandingFinalCta";

export default function LandingPage() {
    return (
        <>
            <Nav />
            <main>
                <Hero />
                <Services />
                <WhyUs />
                <Everyone/>
                <LandingFinalCta />
            </main>
            <Footer />
        </>
    );
}