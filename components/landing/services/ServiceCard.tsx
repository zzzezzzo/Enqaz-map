import { CheckCircle  } from "lucide-react";

interface ServiceCardProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    isGreen?: boolean;
}

export default function ServiceCard({ icon, title, description, isGreen = false }: ServiceCardProps) {
    return (
        <div className="flex items-start space-y-6">
            <div className={`w-6 h-6 ${isGreen ? 'text-green-400' : 'text-red-400'} mr-3 mt-1 shrink-0`}>
                {icon}
            </div>
            <div>
                {isGreen ? (
                    <strong className="text-lg block text-slate-900">{title}</strong>
                ) : (
                    <p className="text-lg block text-slate-700">{title}</p>
                )}
                {description && <p className="text-sm text-slate-600 mt-1"> {description}</p>}
            </div>
        </div>
    );
}
