import StatsCards from "./StatsCards";
// import leaft icon for lucide
import { ArrowRight, CheckCircle } from "lucide-react";

export default function Hero() {
    return (
        <section className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white py-16 px-4">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between">
                <div className=" mb-16 md:mb-0 md:w-2/3">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                        <span className="block mb-2">24/7</span> 
                        
                        <div className="flex items-center gap-3">
                            <span className="text-[#E18100] border-b-5 border-[#FF9F1C4D]">Roadside</span>
                            <span>assistance</span>
                        </div>
                    </h1>
                    <p className="text-xl text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed">
                    Contact reliable mechanics and workshops immediately. Get help when you need it most.
                    Real-time tracking, instant matching, guaranteed service.   
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 ">
                    <a href="/order" className="bg-gradient-to-r from-[#FF8C00] to-[#FF9F1C] hover:from-[#FF9F1C] hover:to-[#FF8C00] text-white px-10 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg flex items-center justify-center">
                        Request Assistance Now <ArrowRight  className="inline-block ml-2" size={20} />
                    </a>
                    <a href="/provider" className="bg-slate-700 border text-white px-10 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg flex items-center justify-center">
                        Join as Provider <ArrowRight className="inline-block ml-2" size={20} />
                    </a>
                    </div>
                    <div className="flex flex-wrap gap-6 mt-8 text-gray-300">
                        <p className="flex items-center text-sm font-medium"><CheckCircle className="text-green-500 mr-2" size={20} /> GPS Tracking</p>
                        <p className="flex items-center text-sm font-medium"><CheckCircle className="text-green-500 mr-2" size={20} /> Verified Providers</p>
                        <p className="flex items-center text-sm font-medium"><CheckCircle className="text-green-500 mr-2" size={20} /> 24/7 Support</p>
                    </div>
                </div>
                <div className="w-1/3">
                    <StatsCards />
                </div>
            </div>
      </section>
    );
}