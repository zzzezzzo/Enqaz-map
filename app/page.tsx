"use client";

import { CheckCircle, Clock, Users, Star, Navigation, Shield, Download, ArrowRight, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { redirect } from "next/navigation";

export default function Page() {
  redirect('/landing');
  return (
    <div className="min-h-screen bg-white">
    </div>
  );
}