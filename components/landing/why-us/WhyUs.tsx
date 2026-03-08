import { MapPin, Shield, Clock, Gauge } from "lucide-react";
import WhyCard from "./WhyCard";
import Image from "next/image";

export default function WhyUs() {
    return (
        <section className="py-20 px-4 bg-[#f1efef]">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">
                        Why Choose ENQAZ?
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        We've reimagined roadside assistance from the ground up to deliver unmatched speed, reliability, and peace of mind
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                    {/* Left - Graphic */}
                    <div className="relative flex justify-center">
                        {/* Main Circle */}
                        <div className="w-64 h-64 bg-[#1E3A5F] border-8 border-[#FFFFFF]  rounded-full relative">
                            {/* Concentric Rings */}
                            <div className="absolute inset-0 border-2 border-[#FFFFFF] rounded-full scale-125"></div>
                            <div className="absolute inset-0 border-2 border-[#FFFFFF] rounded-full scale-160"></div>
                            
                            {/* Orange Diamonds */}
                            <div className="absolute top-0 left-0 w-8 h-8 bg-orange-500 transform rotate-45 rounded-sm drop-shadow-[0_0_10px_rgba(251,146,60,0.7)] animate-pulse"></div>
                            <div className="absolute bottom-0 translate-x-1/3 -translate-y-1/2 w-4 h-4 bg-orange-500 transform rotate-45 rounded-sm drop-shadow-[0_0_10px_rgba(251,146,60,0.7)] animate-bounce"></div>
                            <div className="absolute bottom-0 right-0 translate-x-2/1 translate-y-3/2 w-3 h-3 bg-orange-500 transform rotate-45 rounded-sm drop-shadow-[0_0_10px_rgba(251,146,60,0.7)] animate-ping"></div>
                            
                            {/* Center Icon */}
                            <div className="absolute top-0 right-0 flex items-center justify-center">
                                <div className="">
                                    {/* <Gauge className="w-12 h-12 text-orange-500 " /> */}
                                    <Image src="/icon.png" alt="ENQAZ Logo" width={88} height={88} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Feature Cards */}
                    <div className="space-y-10 mt-10">
                        <WhyCard 
                            icon={<MapPin className="w-6 h-6 text-blue-600" />}
                            title="Live Tracking"
                            description="Monitor the mechanic's location in real time on the map"
                            iconBgColor="bg-blue-100"
                            iconColor="text-blue-600"
                        />
                        <WhyCard 
                            icon={<Shield className="w-6 h-6 text-green-600" />}
                            title="Reliable and Safe"
                            description="All workshops are certified and insured for your peace of mind"
                            iconBgColor="bg-green-100"
                            iconColor="text-green-600"
                        />
                        <WhyCard 
                            icon={<Clock className="w-6 h-6 text-orange-600" />}
                            title="Fast Response"
                            description="Mechanics available 24/7 to respond to your request"
                            iconBgColor="bg-orange-100"
                            iconColor="text-orange-600"
                        />
                    </div>
                </div>

                {/* Bottom Images */}
                <div className="grid md:grid-cols-3 gap-8 mt-18">
                    <div className="rounded-lg overflow-hidden shadow-lg">
                        <Image 
                            src="/image.png" 
                            alt="Mechanic in garage"
                            className="w-full h-64 object-cover"
                            width={400}
                            height={256}
                        />
                    </div>
                    <div className="rounded-lg overflow-hidden shadow-lg">
                        <Image 
                            src="/image1.png" 
                            alt="Car navigation system"
                            className="w-full h-64 object-cover"
                            width={400}
                            height={256}
                        />
                    </div>
                    <div className="rounded-lg overflow-hidden shadow-lg">
                        <Image 
                            src="/image2.png" 
                            alt="Trusted service provider"
                            className="w-full h-64 object-cover"
                            width={400}
                            height={256}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}