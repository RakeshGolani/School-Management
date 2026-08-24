'use client';
import { useState, useEffect } from 'react';
import { useParentChild } from '@/components/layout/parent/ParentLayout';
import { 
  User, 
  Mail, 
  Phone, 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  Users,
  Building
} from 'lucide-react';
import { getParentSessionAction } from '@/actions/parent/authActions';
import ParentProfileSkeleton from '@/components/skeletons/parent/ParentProfileSkeleton';

export default function ParentProfilePage() {
  const [sessionUser, setSessionUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { childrenList } = useParentChild();

  useEffect(() => {
    async function load() {
      try {
        const session = await getParentSessionAction();
        if (session?.user) {
          setSessionUser(session.user);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !sessionUser) {
    return <ParentProfileSkeleton />;
  }

  const parentName = sessionUser?.name || 'Guardian Member';
  const phone = sessionUser?.phone || '+91 9876543210';
  const email = sessionUser?.email || 'parent@example.com';
  const address = sessionUser?.address || '104, Sunrise Heights, Near City Mall, Ahmedabad';

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Profile Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-50 via-white to-primary-50/50 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary-600 to-primary-500 flex items-center justify-center text-white text-3xl font-black shadow-md shadow-primary-500/20 shrink-0">
            {parentName.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-primary-100 text-primary-700 border border-primary-200">
              <Sparkles size={12} /> Registered Guardian
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{parentName}</h1>
            <p className="text-xs text-primary-600 font-mono font-bold">Registered Mobile: {phone}</p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <User size={16} className="text-primary-600" /> Guardian Credentials
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Mobile Number</span>
              <span className="text-slate-900 font-mono font-bold">{phone}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Email Address</span>
              <span className="text-slate-900 font-mono">{email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Residential Address</span>
              <span className="text-slate-900 font-medium text-right max-w-[200px] truncate">{address}</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Users size={16} className="text-primary-600" /> Enrolled Wards ({childrenList.length})
          </h2>
          <div className="space-y-3 text-xs">
            {childrenList.map((child, idx) => (
              <div key={child.id || idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{child.full_name || child.first_name}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{child.admission_number || 'ADM-001'}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 border border-primary-200">
                  {child.grade || child.class?.class_name || 'Class 10-A'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
