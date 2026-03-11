import { Car , MapPin , Clock2 , Phone } from "lucide-react";

export default function ProviderIncomingRequestsPage() {
  const incomingRequests = [
    { id: 1, customer: "Ahmed Hassan", service: "Battery Service",distance:"2.5Km", car: "Toyota Camry 2020", time: "2 min ago", phone: "+966 512 345 678" },
    { id: 2, customer: "Ahmed Hassan", service: "Battery Service",distance:"2.5Km", car: "Toyota Camry 2020", time: "5 min ago", phone: "+966 512 345 678" },
    { id: 3, customer: "Ahmed Hassan", service: "Battery Service",distance:"2.5Km", car: "Toyota Camry 2020", time: "9 min ago", phone: "+966 512 345 678" },
    { id: 4, customer: "Ahmed Hassan", service: "Battery Service",distance:"2.5Km", car: "Toyota Camry 2020", time: "15 min ago", phone: "+966 512 345 678" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incoming Requests</h1>
          <p className="mt-1 text-sm text-gray-500">All pending assistance requests assigned to your workshop.</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-amber-50 px-4 py-1 text-xs font-semibold text-amber-600">
          Pending
        </span>
      </div>

      <div className="space-y-3">
        {incomingRequests.map((request) => (
          <div
            key={request.id}
            className="flex flex-col rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">{request.customer}</p>
              <div className="flex justify-between">
                <p className="text-xs text-gray-500 flex items-center gap-2">
                  <Car className="w-4 h-4 text-gray-500" />{request.car} • <MapPin className="w-4 h-4 text-gray-500" /> {request.distance} • <Clock2 className="w-4 h-4 text-gray-500" /> {request.time} • <span className="text-orange-500 flex items-center "><Phone className="w-4 h-4 text-orange-500" /> {request.phone}</span>
                </p>
                <p className="text-sm font-semibold text-gray-700">{request.service}</p>
              </div>
              
            </div>

            <div className="mt-3 flex items-center gap-3 md:mt-5">
              {/* <div className="text-xs text-gray-500">
                <div className="font-medium text-slate-700">Customer Phone</div>
                <div>{request.phone}</div>
              </div> */}
              <button className="inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-amber-600 transition-colors">
                Accept Request
              </button>
              <button className="inline-flex items-center rounded-lg bg-transparent px-4 py-2 text-xs font-semibold text-gray-500 border border-gray-300">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

