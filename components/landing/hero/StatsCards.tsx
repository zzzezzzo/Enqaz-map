import { Clock, Star, Users, MapPin, CheckCircle, TrendingUp } from "lucide-react";

const stats = [
    { icon: <Clock className="text-orange-500" size={30} />, badge: <TrendingUp className="text-green-500" size={20} />, label: "Average Response", value: "~10min" },
    { icon: <Star className="text-orange-500" size={30} />, badge: <TrendingUp className="text-green-500" size={20} />, label: "User Satisfaction", value: "4.9/5" },
    { icon: <Users className="text-orange-500" size={30} />, badge: <TrendingUp className="text-green-500" size={20} />, label: "Active Providers", value: "500+" },
    { icon: <MapPin className="text-orange-500" size={30} />, badge: <CheckCircle className="text-green-500" size={20} />, label: "Real-Time Tracking", value: "Live" },
];

export default function StatsCards() {
    return (
        <div className="relative overflow-hidden bg-linear-to-r from-[#FFFFFF33]  grid grid-cols-2 md:grid-cols-2 gap-6 max-w-5xl mx-auto p-6 border rounded-lg ">
            <div className="w-37.5 h-37.5 border-5 border-[#FF9F1C33] rounded-full absolute -right-12 -top-12 z-10"></div>
            {stats.map((stat, index) => (
                <div key={index} className="bg-white text-slate-900 p-5 rounded-2xl shadow-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        {stat.icon}
                        {stat.badge}
                    </div>
                    <div className="mt-auto text-start">
                        <span className="text-4xl font-bold text-slate-900 mb-2 block">{stat.value}</span>
                        <span className="text-sm text-gray-600 font-medium">{stat.label}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}