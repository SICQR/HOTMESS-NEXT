"use client";
import Link from 'next/link';
export default function Legal(){
  return(
    <div className="pt-32 text-center">
      <h1 className="text-5xl font-bold mb-6">Legal Hub</h1>
      <p className="text-gray-400 mb-6">GDPR, Privacy & Care Disclaimer</p>
      <div className="space-y-2">
        <Link href="/legal/privacy" className="text-red-500 underline block">Privacy Policy</Link>
        <Link href="/legal/terms" className="text-red-500 underline block">Terms of Use</Link>
      </div>
    </div>
  );
}
