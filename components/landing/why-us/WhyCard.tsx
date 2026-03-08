interface WhyCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    iconBgColor: string;
    iconColor: string;
}

export default function WhyCard({ icon, title, description, iconBgColor, iconColor }: WhyCardProps) {
    return (
        <div className="flex items-start p-6 rounded-lg shadow-md bg-white">
            <div className={`p-3 rounded-full ${iconBgColor} mr-4`}>
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">{title}</h3>
                <p className="text-gray-600">{description}</p>
            </div>
        </div>
    );
}