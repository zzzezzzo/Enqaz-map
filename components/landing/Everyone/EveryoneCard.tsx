import { Users, Star, TrendingUp, Shield } from "lucide-react";



interface EveryoneCardProps {

    icon: React.ReactNode;

    title: string;

    heading:string;

    descriptionTitle:string;

    description: string;

    bgColor: string;

    iconColor: string;

}



export default function EveryoneCard({ icon, title, description, bgColor, iconColor }: EveryoneCardProps) {

    return (

        <div className={`${bgColor} p-8 rounded-2xl text-center shadow-lg hover:shadow-xl transition-shadow duration-300`}>

            <div className={`${iconColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6`}>

                {icon}

            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>

            <p className="text-gray-600 leading-relaxed">{description}</p>

        </div>

    );

}