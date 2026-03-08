import Image from "next/image";
import Link from "next/link";

export default function CustomerFooter() {
  return (
    <footer className="bg-slate-900 text-white py-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <Link href="/customer" className="flex gap-3 items-center">
          <Image src="/logo.svg" alt="ENQAZ" width={40} height={40} />
          <div>
            <span className="font-bold text-lg">ENQAZ</span>
            <p className="text-sm text-gray-400">Smart Roadside Assistance</p>
          </div>
        </Link>
        <p className="text-gray-400 text-sm text-center md:text-right">
          © 2026 Roadside Assistance. We connect drivers with reliable mechanics 24/7.
        </p>
      </div>
    </footer>
  );
}
