'use client';

import { useState } from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  Wrench, 
  CheckCircle, 
  DollarSign, 
  Settings, 
  LogOut,
  Search,
  ChevronDown,
  MapPin,
  Clock,
  User,
  Menu,
  X
} from 'lucide-react';

export default function ProviderDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Inbox, label: 'Incoming Requests', active: false },
    { icon: Wrench, label: 'Active Jobs', active: false },
    { icon: CheckCircle, label: 'Completed Jobs', active: false },
    { icon: DollarSign, label: 'Services & Pricing', active: false },
    { icon: User, label: 'Technicians', active: false },
    { icon: DollarSign, label: 'Earnings', active: false },
    { icon: Settings, label: 'Profile & Settings', active: false },
    { icon: LogOut, label: 'Logout', active: false },
  ];

  const statsCards = [
    { title: 'Total Requests Today', value: '12,458', change: '+12%', color: 'bg-blue-500' },
    { title: 'Active Jobs', value: '8,039', change: '+8%', color: 'bg-green-500' },
    { title: 'Available Technicians', value: '11,597', change: '+5%', color: 'bg-orange-500' },
    { title: 'Available Winches', value: '300', change: '+2%', color: 'bg-purple-500' },
  ];

  const incomingRequests = [
    { id: 1, customer: 'Ahmed Mohammed', service: 'Battery Service', distance: '2.5 km', time: '2 min ago', status: 'pending' },
    { id: 2, customer: 'Sarah Al-Rashid', service: 'Tire Change', distance: '1.8 km', time: '5 min ago', status: 'pending' },
    { id: 3, customer: 'Khalid Hassan', service: 'Fuel Delivery', distance: '4.2 km', time: '8 min ago', status: 'pending' },
    { id: 4, customer: 'Fatima Ali', service: 'Car Towing', distance: '3.1 km', time: '12 min ago', status: 'pending' },
    { id: 5, customer: 'Omar Khalid', service: 'Lockout Service', distance: '0.9 km', time: '15 min ago', status: 'pending' },
  ];

  const handleAcceptRequest = (requestId: number) => {
    console.log('Accepted request:', requestId);
    // TODO: Implement accept request logic
    // Add success animation
    const button = document.getElementById(`accept-${requestId}`);
    if (button) {
      button.classList.add('scale-95');
      setTimeout(() => button.classList.remove('scale-95'), 150);
    }
  };

  const handleRejectRequest = (requestId: number) => {
    console.log('Rejected request:', requestId);
    // TODO: Implement reject request logic
    // Add shake animation
    const button = document.getElementById(`reject-${requestId}`);
    if (button) {
      button.classList.add('animate-pulse');
      setTimeout(() => button.classList.remove('animate-pulse'), 300);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex ">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-center h-16 bg-blue-600 text-white">
          <h1 className="text-xl font-bold">ENQAZ</h1>
        </div>
        
        <nav className="mt-8">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                item.active ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : 'text-gray-700'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div>      
        <div className="flex-1 lg:ml-0">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center flex-1">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-200"
                >
                  {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
                
                <div className="relative max-w-md flex-1 ml-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="relative ml-4">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold shadow-lg">
                    AN
                  </div>
                  <span className="ml-2 font-medium text-gray-700">Al-Noor Workshop</span>
                  <ChevronDown className="ml-2 h-4 w-4 text-gray-500 transition-transform duration-200" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">Profile</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">Settings</a>
                    <hr className="my-1" />
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">Sign out</a>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsCards.map((card, index) => (
                <div key={index} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                      <div className="flex items-center">
                        <p className="text-sm text-green-600 mt-2">{card.change}</p>
                        <div className="ml-2 h-2 w-2 bg-green-100 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className={`h-12 w-12 ${card.color} rounded-lg flex items-center justify-center transform transition-transform duration-300 hover:rotate-12`}>
                      <LayoutDashboard className="h-6 w-6 text-white transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Incoming Requests */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Incoming Requests</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Showing {incomingRequests.length} requests</span>
                      <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Refresh
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    {incomingRequests.map((request) => (
                      <div key={request.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4 border border-gray-200">
                        <div className="mb-5">
                          <div className="flex items-center">
                            <div className="mb-3">
                              <div className="text-sm font-medium text-[#1E3A5F]">{request.customer}</div>
                            </div>
                          </div>
                          <div className="flex items-center  space-x-2">
                            <span className="inline-flex items-center px-3 py-1 text-xs leading-5 font-semibold rounded-full text-[#6B7280]">
                              {request.service}
                            </span>
                            <span className="text-xs text-gray-500 flex justify-between">
                              {request.distance} • {request.time}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            id={`accept-${request.id}`}
                            onClick={() => handleAcceptRequest(request.id)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#E18100] hover:bg-[#C16A00] rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L7 20l4 4M5 5l12 4" />
                            </svg>
                            Accept
                          </button>
                          <button
                            id={`reject-${request.id}`}
                            onClick={() => handleRejectRequest(request.id)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#6B7280] rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Requests Map */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Active Requests Map</h3>
                </div>
                <div className="p-4">
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 font-medium">Interactive Map</p>
                      <p className="text-sm text-gray-400">Active request locations will appear here</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-500">
          <p> 2024 ENQAZ Smart Roadside Assistance. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
