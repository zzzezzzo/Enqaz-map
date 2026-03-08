import { Users, Star, TrendingUp, Shield, CheckCircle } from "lucide-react";

interface EveryoneCardProps {
    icon: React.ReactNode;
    title: string;
    heading:string;
    descriptionTitle:string;
    description: string;
    bgColor: string;
    iconColor: string;
}

export default function EveryoneCard({ icon, title, heading, descriptionTitle, description, bgColor, iconColor }: EveryoneCardProps) {
    const isOrangeCard = bgColor.includes('orange');
    
    return (
        <div className={`${bgColor} ${isOrangeCard ? 'text-white' : 'text-slate-900'} p-10 rounded-2xl ${isOrangeCard ? 'shadow-xl' : 'shadow-lg border-2 border-gray-200'}`}>
            {icon && <div className={` ${iconColor} w-20 h-20 border-2 border-current rounded-xl p-4 flex items-center justify-center mb-6`}>
                {icon}
            </div>}
            <h3 className="text-3xl font-bold mb-6">{heading}</h3>
            <p className={`text-lg mb-8 ${isOrangeCard ? 'text-white' : 'text-gray-600'}`}>{descriptionTitle}</p>
            
            <ul className="space-y-4 mb-8">
                {description.split(', ').map((item, index) => (
                    <li key={index} className="flex items-center text-lg">
                        <CheckCircle className={`w-6 h-6 mr-3 shrink-0 ${isOrangeCard ? 'text-white' : 'text-green-500'}`} />
                        <span className={isOrangeCard ? 'text-white' : 'text-gray-700'}>{item}</span>
                    </li>
                ))}
            </ul>
            
            <button className={`${isOrangeCard ? 'bg-white text-orange-500 hover:bg-gray-100' : 'bg-slate-900 hover:bg-slate-800 text-white'} px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg`}>
                {title}
            </button>
        </div>
    );
}