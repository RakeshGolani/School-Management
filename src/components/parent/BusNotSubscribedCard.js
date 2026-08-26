'use client';

import { Bus } from 'lucide-react';

/**
 * Reusable Notice Card when a Ward is Not Subscribed to Smart Bus Transit
 */
export default function BusNotSubscribedCard({ 
  wardName = 'Student', 
  schoolPhone = '+91 9876543200', 
  schoolEmail = 'transport@greenwood.edu',
  className = ''
}) {
  return (
    <div className={`p-8 sm:p-10 rounded-3xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-4 text-center max-w-3xl mx-auto shadow-2xs ${className}`}>
      <div className="w-14 h-14 rounded-3xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center mx-auto shadow-2xs">
        <Bus size={28} />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-black text-amber-900">
          Smart Bus Transit Not Subscribed for {wardName}
        </h3>
        <p className="text-xs sm:text-sm text-amber-800 leading-relaxed max-w-xl mx-auto">
          {wardName} is not currently enrolled in the institutional Smart Bus transit fleet service. If you would like to enable morning pickup and afternoon drop services, please contact your school administration desk.
        </p>
      </div>
      <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-amber-900">
        <span className="px-4 py-2 rounded-xl bg-white border border-amber-200 shadow-2xs">
          School Desk: {schoolPhone}
        </span>
        <span className="px-4 py-2 rounded-xl bg-white border border-amber-200 shadow-2xs">
          Email: {schoolEmail}
        </span>
      </div>
    </div>
  );
}
