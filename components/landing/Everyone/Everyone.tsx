import { CheckCircle , Wrench ,Users   } from "lucide-react";
import EveryoneCard from "./EveryoneCard";

export default function Everyone() {
    return (
        <section className="py-20 px-4 bg-[#0B1C2D]">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-6xl font-bold text-center text-gray-50 mb-4">Built For Everyone</h2>
                <p className="text-center text-gray-300 mb-16">Whether you need help or want to provide it, ENQAZ has the perfect solution for you</p>
                <div className="grid md:grid-cols-2 gap-10">
                    {/* Service Provider Card */}
                    <EveryoneCard 
                        icon={<Wrench width={85} height={85} />}
                        heading="Are you a Service Provider?"
                        descriptionTitle="Join our network and grow your business"
                        description="Access to thousands of customers, flexible work schedule, fair and transparent payments, professional tools and support"
                        bgColor="bg-gradient-to-br from-orange-500 to-orange-600"
                        iconColor="text-white"
                        title="Join Today"
                    />
                    
                    {/* Motorist Card */}
                    <EveryoneCard 
                        icon={<Users width={85} height={85} />}
                        heading="Are you a Motorist?"
                        descriptionTitle="Get help when you need it most"
                        description="24/7 emergency assistance, real-time provider tracking, transparent pricing, peace of mind on the road"
                        bgColor="bg-white border-2 border-gray-200"
                        iconColor="text-green-500"
                        title="Join Today"
                    />
                </div>
            </div>
        </section>
    );
}