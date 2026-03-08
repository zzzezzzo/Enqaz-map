import { CheckCircle, Download, ArrowRight, CircleAlert, Dot} from "lucide-react";
import ServiceCard from "./ServiceCard";

export default function Services() {
    return (
        <section className="bg-white text-slate-900 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left Column - The Problem */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-semibold">
                <CircleAlert className="w-4 h-4 mr-2" />
                The Problem
              </div>
              
              <h2 className="text-4xl font-bold text-slate-900 mb-8 leading-tight">
                Vehicle Breakdowns Shouldn't Leave You Helpless
              </h2>
              
              <div className="space-y-6">
                <ServiceCard 
                    icon={<Dot width={24} height={24} />}
                    title="Long wait times trying to find available assistance"
                    isGreen={false}
                />
                <ServiceCard 
                    icon={<Dot width={24} height={24} />}
                    title="No visibility on when help will arrive"
                    isGreen={false}
                />
                <ServiceCard 
                    icon={<Dot width={24} height={24} />}
                    title="Difficulty finding trusted, verified service providers"
                    isGreen={false}
                />
                <ServiceCard 
                    icon={<Dot width={24} height={24} />}
                    title="Unsafe roadside waiting in emergency situations"
                    isGreen={false}
                />
              </div>
            </div>
            
            {/* Right Column - Our Solution */}
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-semibold">
                <CheckCircle className="w-4 h-4 mr-2" />
                Our Solution
              </div>
              
              <h2 className="text-4xl font-bold text-slate-900 mb-8 leading-tight">
                ENQAZ Connects You Instantly
              </h2>
              
              <div className="space-y-6">
                <ServiceCard 
                    icon={<CheckCircle className="w-6 h-6" />}
                    title="Instant Matching"
                    description="AI-powered provider matching"
                    isGreen={true}
                />
                <ServiceCard 
                    icon={<CheckCircle className="w-6 h-6" />}
                    title="Live Tracking"
                    description="Watch your help arrive in real-time"
                    isGreen={true}
                />
                <ServiceCard 
                    icon={<CheckCircle className="w-6 h-6" />}
                    title="Transparent Pricing"
                    description="Know the cost before you commit"
                    isGreen={true}
                />
                <ServiceCard 
                    icon={<CheckCircle className="w-6 h-6" />}
                    title="Verified Providers"
                    description="All providers are background checked"
                    isGreen={true}
                />
              </div>
              
              <button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors flex items-center shadow-lg">
                Experience Difference
                <ArrowRight className="w-5 h-5 ml-3" />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
}