"use client";

import { CheckCircle, Clock, Users, Star, Navigation, Shield, Download, ArrowRight, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      

      {/* Problem/Solution Section */}
      

      {/* Why Choose ENQAZ Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Why Choose ENQAZ?</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We're revolutionizing roadside assistance with technology, reliability, and customer-first approach.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10 mb-16">
            <div className="text-center">
              <div className="bg-orange-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Navigation className="w-12 h-12 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Live Tracking</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Track your service provider in real-time from request to arrival</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-12 h-12 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Reliable and Safe</h3>
              <p className="text-gray-600 text-lg leading-relaxed">All providers are verified, insured, and trained professionals</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-12 h-12 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Fast Response</h3>
              <p className="text-gray-600 text-lg leading-relaxed">Average arrival time of just 10 minutes in most areas</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl mb-6 flex items-center justify-center">
                <div className="text-orange-500 text-6xl">🔧</div>
              </div>
              <h4 className="font-bold text-xl mb-3 text-slate-900">Expert Mechanics</h4>
              <p className="text-gray-600">Certified professionals ready to help</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl mb-6 flex items-center justify-center">
                <div className="text-blue-500 text-6xl">😊</div>
              </div>
              <h4 className="font-bold text-xl mb-3 text-slate-900">Happy Customers</h4>
              <p className="text-gray-600">Join thousands of satisfied users</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 rounded-xl mb-6 flex items-center justify-center">
                <div className="text-green-500 text-6xl">👍</div>
              </div>
              <h4 className="font-bold text-xl mb-3 text-slate-900">Quality Service</h4>
              <p className="text-gray-600">Professional help you can trust</p>
            </div>
          </div>
        </div>
      </section>

      {/* Built For Everyone Section */}
      

      {/* Final CTA Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Never Be Stranded Again?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed">
            Join the ENQAZ family today and experience roadside assistance the way it should be - fast, reliable, and stress-free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center shadow-lg">
              Join The Family
              <ArrowRight className="w-5 h-5 ml-3" />
            </button>
            <button className="bg-slate-700 hover:bg-slate-600 text-white px-10 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg">
              Register
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
     
    </div>
  );
}