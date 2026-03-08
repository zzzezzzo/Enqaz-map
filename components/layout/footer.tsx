import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer(){
    return(
         <footer className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <h3 className="text-3xl font-bold text-orange-500 mb-4">ENQAZ</h3>
              <p className="text-gray-400 text-lg leading-relaxed">Your trusted partner for roadside assistance, 24/7.</p>
            </div>
            <div>
              <h4 className="font-bold text-xl mb-6">Services</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors text-lg">Towing</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Battery Jump</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Tire Change</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Fuel Delivery</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xl mb-6">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors text-lg">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xl mb-6">Connect</h4>
              <div className="flex space-x-4 mb-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-7 h-7" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-7 h-7" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Instagram className="w-7 h-7" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-7 h-7" />
                </a>
              </div>
              <p className="text-gray-400 text-lg mb-2">support@enqaz.com</p>
              <p className="text-gray-400 text-lg">1-800-ENQAZ</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p className="text-lg">&copy; 2024 ENQAZ. All rights reserved. | Privacy Policy | Terms of Service</p>
          </div>
        </div>
      </footer>         
    )
}