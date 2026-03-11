"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 py-2">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex gap-3 justify-center">
            <div>
              <Image src="/logo.svg" alt="ENQAZ" width={70} height={70} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ENQAZ</h1>
              <p className="text-sm text-gray-600">Smart Roadside Assistance</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
              Solution
            </a>
            <a href="#services" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
              Benefits
            </a>
            <a href="#about" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
              Services
            </a>
            <a href="/auth/login" className="text-gray-800 hover:text-orange-500 transition-colors font-medium">
              Sign In
            </a>
            
          </div>
          <div>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
              Get Started Free
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-orange-500 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <a href="#home" className="text-gray-700 hover:text-orange-500 transition-colors font-medium py-2">
                Home
              </a>
              <a href="#services" className="text-gray-700 hover:text-orange-500 transition-colors font-medium py-2">
                Services
              </a>
              <a href="#about" className="text-gray-700 hover:text-orange-500 transition-colors font-medium py-2">
                About
              </a>
              <a href="#contact" className="text-gray-700 hover:text-orange-500 transition-colors font-medium py-2">
                Contact
              </a>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors w-full">
                Order Now
              </button>
              <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-semibold transition-colors w-full">
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}