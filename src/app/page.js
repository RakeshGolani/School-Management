'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSessionAction, getSystemSettingsAction } from '@/actions/school/authActions';
import { getPlansAction } from '@/actions/school/commonActions';
import { applyDynamicTheme } from '@/lib/themeHelper';
import LandingPageSkeleton from '@/components/skeletons/landing/LandingPageSkeleton';
import PricingSection from '@/components/landing/PricingSection';
import Select from '@/components/ui/Select';
import FormPhoneInput from '@/components/FormPhoneInput';
import * as yup from 'yup';
import { submitInquiryAction } from '@/actions/school/inquiryActions';
import { notifySuccess, notifyError } from '@/lib/notify';
import { 
  GraduationCap, 
  Bus, 
  Users, 
  Shield, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  MapPin, 
  CheckCircle, 
  ChevronDown, 
  DollarSign, 
  Bell, 
  Calendar, 
  Sparkles, 
  Zap, 
  Activity, 
  Layers, 
  Award, 
  BarChart3, 
  FileCheck2, 
  Lock, 
  Smartphone, 
  Check, 
  Star, 
  Compass, 
  Radio, 
  Sliders, 
  Send, 
  HelpCircle, 
  Building, 
  Mail, 
  Phone, 
  Menu, 
  X, 
  QrCode, 
  ShieldCheck, 
  Navigation,
  Loader2,
  RefreshCw
} from 'lucide-react';

const inquirySchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Representative name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: yup
    .string()
    .trim()
    .required('Email address is required')
    .email('Please enter a valid email address'),
  school: yup
    .string()
    .trim()
    .required('School / Academy name is required')
    .min(2, 'School name must be at least 2 characters'),
  phone: yup
    .string()
    .trim()
    .required('Phone number is required')
    .test('valid-phone', 'Please enter a valid 10-digit phone number', (val) => {
      if (!val) return false;
      const clean = val.replace(/[^0-9]/g, '');
      return clean.length >= 10;
    }),
  moduleInterest: yup
    .string()
    .required('Please select a module of interest'),
  message: yup
    .string()
    .max(1000, 'Message cannot exceed 1000 characters')
});

export default function LandingPage() {
  const [activePreviewTab, setActivePreviewTab] = useState('admin');
  const [studentScale, setStudentScale] = useState(850);
  const [expandedFaq, setExpandedFaq] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', school: '', phone: '', moduleInterest: 'full_suite', message: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [systemSettings, setSystemSettings] = useState({
    company_name: 'Vidyadmin',
    tagline: 'Simplifying Education, Empowering Admins',
    logo_url: null,
    support_email: 'support@vidyadmin.com',
    support_phone: '+91 9876543210',
    address: 'Vidyadmin Global HQ, Tech Horizon Tower'
  });
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [dynamicPlans, setDynamicPlans] = useState([]);

  useEffect(() => {
    // Landing page always uses default Admin Theme Palette (#0047AB)
    applyDynamicTheme('#0047AB');

    async function loadData() {
      try {
        const [settingsRes, plansRes] = await Promise.all([
          getSystemSettingsAction().catch(() => null),
          getPlansAction().catch(() => null)
        ]);

        if (settingsRes?.success && settingsRes?.data) {
          setSystemSettings(prev => ({
            ...prev,
            ...settingsRes.data
          }));
        }

        if (plansRes?.success && Array.isArray(plansRes?.data?.plans) && plansRes.data.plans.length > 0) {
          setDynamicPlans(plansRes.data.plans);
        }
      } catch (err) {
        console.warn('Could not load settings or plans on landing page:', err);
      } finally {
        setSettingsLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    try {
      await inquirySchema.validate(formData, { abortEarly: false });
    } catch (err) {
      if (err.inner) {
        const errors = {};
        err.inner.forEach((error) => {
          errors[error.path] = error.message;
        });
        setFormErrors(errors);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await submitInquiryAction({
        representative_name: formData.name,
        email: formData.email,
        school_name: formData.school,
        phone: formData.phone,
        module_interest: formData.moduleInterest,
        message: formData.message
      });

      if (res.success) {
        setContactSubmitted(true);
        notifySuccess(res.message || 'Demonstration request submitted successfully!');
        setFormData({ name: '', email: '', school: '', phone: '', moduleInterest: 'full_suite', message: '' });
      } else {
        notifyError(res.message || 'Failed to submit demonstration inquiry');
      }
    } catch (err) {
      notifyError('Failed to connect to the server');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic calculations based on student slider
  const estimatedBuses = Math.max(1, Math.round(studentScale * 0.035));
  const estimatedStaff = Math.max(10, Math.round(studentScale * 0.07));
  const hoursSavedPerWeek = Math.round(studentScale * 0.08);

  const moduleInterestOptions = dynamicPlans.length > 0
    ? dynamicPlans.map(p => ({
        value: (p.code || '').toLowerCase(),
        label: `${p.name}${p.tagline ? ` (${p.tagline})` : ''}`
      }))
    : [
        { value: 'full_suite', label: 'Full Institutional Suite (ERP + Smart Bus + NFC)' },
        { value: 'transport_only', label: 'Smart Bus Fleet & Live GPS Only' },
        { value: 'school_only', label: 'Academic ERP & Fee Management Only' }
      ];

  const handleSelectPlan = (planCode) => {
    const formattedCode = (planCode || 'full_suite').toLowerCase();
    setFormData(prev => ({
      ...prev,
      moduleInterest: formattedCode
    }));
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: "How does the NFC/RFID attendance & bus tracking integrate?",
      a: "Each student is issued an NFC smart ID card. When boarding the bus or passing through the campus turnstile, a quick tap records their real-time timestamp and GPS coordinates. The system immediately broadcasts push notifications and SMS alerts to parents and updates the administrative command desk in under 1 second."
    },
    {
      q: "Can we subscribe to Smart Bus Fleet or School ERP separately?",
      a: "Yes! Our dynamic modular SaaS architecture supports granular package separation. You can run 'Smart Bus Fleet Only' if you just require GPS logistics, 'Academic ERP Only' for classroom & fee management, or the 'Full Institutional Suite' for complete unified control."
    },
    {
      q: "How does the Zero-Conflict Master Timetable engine work?",
      a: "The timetable module manages weekly allocations with real-time teacher and classroom clash detection. A single teacher cannot be double-booked across different sections during the same period, ensuring seamless scheduling across all grades."
    },
    {
      q: "Is parent and student data secure & isolated?",
      a: "Absolutely. Vidyadmin uses strict role-based access control (RBAC), multi-tenant isolation, 256-bit encryption in transit and at rest, and dedicated endpoints for Admins, Teachers, Parents, and Students."
    },
    {
      q: "Can we customize school branding, logos, and theme colors?",
      a: "Yes! Every school receives customized dynamic white-label branding. Your institutional logo and custom brand theme colors are loaded synchronously without page color flashes (Zero-FOUC architecture)."
    },
    {
      q: "What devices do staff and teachers need to use the portal?",
      a: "Vidyadmin is 100% web-based and cloud-native. It works flawlessly across smartphones, tablets, Chromebooks, laptops, and desktop browsers without requiring heavy local software installation."
    }
  ];

  const testimonials = [
    {
      quote: "EduManage transformed how our 2,400 students commute daily. Parents love the live bus ETA alerts, and morning gate attendance is 100% automated.",
      name: "Dr. Evelyn Vance",
      role: "Principal",
      school: "Oakridge International Academy",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    },
    {
      quote: "The Zero-Conflict timetable generator and one-click grading saved our faculty over 12 hours every week. Truly the best school ERP we've tested.",
      name: "Marcus Sterling",
      role: "Academic Director",
      school: "St. Jude Collegiate Institute",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80"
    },
    {
      quote: "As a parent, knowing the exact moment my daughter boards the bus and arrives at school gives our entire family complete peace of mind.",
      name: "Priya Sharma",
      role: "Parent Association Head",
      school: "Delhi Public School",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
    }
  ];

  if (settingsLoading) {
    return <LandingPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary-500 selection:text-white relative overflow-hidden">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-primary-100/40 via-secondary-100/20 to-transparent blur-3xl opacity-60"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#64748b08_1px,transparent_1px),linear-gradient(to_bottom,#64748b08_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Navigation Header (Light Theme) */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {settingsLoading ? (
            <div className="flex items-center space-x-3.5 animate-pulse">
              <div className="w-14 h-14 rounded-full bg-slate-200 shrink-0" />
              <div className="space-y-1.5 min-w-0">
                <div className="h-6 w-32 bg-slate-200 rounded-md" />
                <div className="h-3 w-48 bg-slate-200 rounded-md" />
              </div>
            </div>
          ) : (
            <Link href="/" className="flex items-center space-x-3.5 group">
              {systemSettings?.logo_url ? (
                <div className="w-14 h-14 rounded-full bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300 overflow-hidden shrink-0">
                  <img src={systemSettings.logo_url} alt={systemSettings.company_name || 'Logo'} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30 group-hover:scale-105 transition-transform duration-300 shrink-0 relative">
                  <GraduationCap size={26} className="text-white" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-secondary-500 border-2 border-white"></span>
                </div>
              )}
              <div className="min-w-0">
                <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center">
                  <span>{systemSettings?.company_name || 'Vidyadmin'}</span>
                </span>
                <span className="block text-[11px] font-semibold text-secondary-600 tracking-normal truncate max-w-[240px]">
                  {systemSettings?.tagline || 'Simplifying Education, Empowering Admins'}
                </span>
              </div>
            </Link>
          )}

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100 p-1.5 rounded-full border border-slate-200">
            <a href="#features" className="text-xs font-semibold px-4 py-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-xs">Features</a>
            <a href="#interactive-simulator" className="text-xs font-semibold px-4 py-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-xs">Live Preview</a>
            <a href="#transport" className="text-xs font-semibold px-4 py-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-xs">Smart Bus & NFC</a>
            <a href="#packages" className="text-xs font-semibold px-4 py-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-xs">Packages</a>
            <a href="#portals" className="text-xs font-semibold px-4 py-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-xs">Portals</a>
            <a href="#faq" className="text-xs font-semibold px-4 py-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-xs">FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center space-x-3">
            <Link 
              href="/login" 
              className="text-xs font-bold px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-all duration-200 shadow-xs"
            >
              Portal Login
            </Link>
            <a 
              href="#contact" 
              className="text-xs font-bold px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} /> Request Demo
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-100 border border-slate-200 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 bg-white/95 backdrop-blur-2xl px-6 py-6 space-y-4 animate-fadeIn">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="flex items-center text-sm font-medium text-slate-700 hover:text-primary-600 py-2">✨ All Features</a>
            <a href="#interactive-simulator" onClick={() => setMobileMenuOpen(false)} className="flex items-center text-sm font-medium text-slate-700 hover:text-primary-600 py-2">🖥️ Live Platform Simulator</a>
            <a href="#transport" onClick={() => setMobileMenuOpen(false)} className="flex items-center text-sm font-medium text-slate-700 hover:text-primary-600 py-2">🚌 Smart Bus & RFID</a>
            <a href="#packages" onClick={() => setMobileMenuOpen(false)} className="flex items-center text-sm font-medium text-slate-700 hover:text-primary-600 py-2">💎 Plans & Packages</a>
            <a href="#portals" onClick={() => setMobileMenuOpen(false)} className="flex items-center text-sm font-medium text-slate-700 hover:text-primary-600 py-2">🔐 Portal Gateways</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="flex items-center text-sm font-medium text-slate-700 hover:text-primary-600 py-2">❓ FAQ Support</a>
            <hr className="border-slate-200 my-3" />
            <div className="flex flex-col gap-2.5 pt-2">
              {userSession ? (
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-md shadow-primary-600/25">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm">
                    Login to Portal
                  </Link>
                  <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 rounded-xl bg-primary-600 text-white font-bold text-sm shadow-md shadow-primary-600/25">
                    Book School Demo
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Release Badge */}
          <div className="inline-flex items-center space-x-2 bg-primary-50 border border-primary-200/80 px-4 py-2 rounded-full text-xs font-bold text-primary-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-primary-600 animate-ping"></span>
            <span>⚡ Institutional ERP & Smart Bus Fleet Intelligence 2026</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
            The Modern Operating System for <span className="text-primary-600">Future-Ready Schools</span>
          </h1>

          {/* Subtext */}
          <p className="text-slate-600 text-base sm:text-xl leading-relaxed max-w-2xl mx-auto font-normal">
            Elevate campus administration with unified student management, zero-conflict timetables, automated fee collection, and real-time NFC bus fleet telemetry.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-white font-bold text-sm bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Access School Portal
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#interactive-simulator" 
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-sm transition duration-300 flex items-center justify-center gap-2"
            >
              <Activity size={18} className="text-primary-600" />
              Explore Live Simulator
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-accent-600" /> 256-Bit Multi-Tenant Security</span>
            <span className="flex items-center gap-1.5"><Radio size={16} className="text-secondary-600" /> Sub-Second NFC Tap Telemetry</span>
            <span className="flex items-center gap-1.5"><Zap size={16} className="text-primary-600" /> Zero-FOUC White-Label Branding</span>
            <span className="flex items-center gap-1.5"><Smartphone size={16} className="text-primary-600" /> Responsive On All Devices</span>
          </div>
        </div>

        {/* Live Interactive Product Simulator (Light Theme) */}
        <div id="interactive-simulator" className="mt-16 max-w-5xl mx-auto scroll-mt-28">
          <div className="rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-200/60 overflow-hidden p-4 sm:p-8 relative">
            {/* Ambient inner glow */}
            <div 
              className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
              style={{ background: 'var(--theme-primary-500, #0047AB)' }}
            ></div>

            {/* Window header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-xs"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-secondary-500 shadow-xs"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-accent-500 shadow-xs"></span>
                </div>
                <span className="text-xs font-mono text-slate-400 hidden md:inline">https://campus.vidyadmin.com/dashboard</span>
              </div>

              {/* View Selector Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full sm:w-auto overflow-x-auto">
                <button 
                  onClick={() => setActivePreviewTab('admin')} 
                  className={`text-xs px-4 py-2 rounded-xl transition-all font-bold cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activePreviewTab === 'admin' 
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 size={14} /> Admin Command
                </button>
                <button 
                  onClick={() => setActivePreviewTab('teacher')} 
                  className={`text-xs px-4 py-2 rounded-xl transition-all font-bold cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activePreviewTab === 'teacher' 
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calendar size={14} /> Teacher Podium
                </button>
                <button 
                  onClick={() => setActivePreviewTab('bus')} 
                  className={`text-xs px-4 py-2 rounded-xl transition-all font-bold cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activePreviewTab === 'bus' 
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Bus size={14} /> Smart Bus Telemetry
                </button>
                <button 
                  onClick={() => setActivePreviewTab('parent')} 
                  className={`text-xs px-4 py-2 rounded-xl transition-all font-bold cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activePreviewTab === 'parent' 
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users size={14} /> Parent & Student Hub
                </button>
              </div>
            </div>

            {/* TAB CONTENT: ADMIN */}
            {activePreviewTab === 'admin' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Enrolled</span>
                      <Users size={14} className="text-primary-600" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 mt-1">1,842</p>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center mt-1">↑ 8.4% this session</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fees Collected</span>
                      <DollarSign size={14} className="text-emerald-600" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 mt-1">$94,200</p>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center mt-1">94% target achieved</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Fleet</span>
                      <Bus size={14} className="text-amber-600" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 mt-1">18 / 18</p>
                    <span className="text-[10px] text-amber-600 font-semibold flex items-center mt-1">100% on schedule</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Daily Attendance</span>
                      <CheckCircle size={14} className="text-purple-600" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 mt-1">97.8%</p>
                    <span className="text-[10px] text-purple-600 font-semibold flex items-center mt-1">1,802 present today</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Activity size={14} className="text-primary-600" /> Live Campus Events
                      </h4>
                      <span className="text-[10px] bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full font-bold">REALTIME</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="text-slate-700 font-medium">Grade 10-A Midterm Results Published</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">2 min ago</span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary-600"></span>
                          <span className="text-slate-700 font-medium">Term 2 Fee Receipt #4982 Paid ($450)</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">8 min ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <FileCheck2 size={14} className="text-emerald-600" /> Quick Administrative Tasks
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                      <div className="bg-primary-50 hover:bg-primary-100 text-primary-800 border border-primary-200 p-3 rounded-xl flex items-center justify-between cursor-pointer transition shadow-xs">
                        <span>Generate ID Cards</span>
                        <ArrowRight size={12} />
                      </div>
                      <div className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 p-3 rounded-xl flex items-center justify-between cursor-pointer transition shadow-xs">
                        <span>Master Timetable</span>
                        <ArrowRight size={12} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: TEACHER */}
            {activePreviewTab === 'teacher' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-primary-50 border border-primary-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Class Teacher - Grade 10 Section B</h4>
                      <p className="text-xs text-slate-500">Class Room #304 • Total Students: 38</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                    Today Attendance: 37 / 38 (97.4%)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Period 1 (08:30 AM)</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">COMPLETED</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">Advanced Mathematics</p>
                    <p className="text-xs text-slate-500">Quadratic Equations & Polynomials</p>
                  </div>
                  <div className="bg-primary-50/60 p-4 rounded-2xl border border-primary-300 shadow-sm shadow-primary-500/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-primary-800 font-bold">Current Period (10:15 AM)</span>
                      <span className="text-primary-700 font-bold animate-pulse bg-primary-100 px-2 py-0.5 rounded-md">● LIVE</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">Physics Laboratory</p>
                    <p className="text-xs text-slate-600">Optics & Wave Motion (Lab 2)</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Period 4 (01:00 PM)</span>
                      <span className="text-slate-600 font-bold bg-slate-200 px-2 py-0.5 rounded-md">UPCOMING</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">Computer Science</p>
                    <p className="text-xs text-slate-500">Python Data Structures</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SMART BUS */}
            {activePreviewTab === 'bus' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Visual Map Simulation */}
                  <div className="lg:col-span-7 bg-slate-50 p-5 rounded-2xl border border-slate-200 relative overflow-hidden space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bus size={18} className="text-amber-600" />
                        <span className="text-sm font-bold text-slate-900">Bus #04 • Route North Express</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span> Live GPS (34 km/h)
                      </span>
                    </div>

                    {/* Progress Track Simulation */}
                    <div className="space-y-3 pt-2">
                      <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative">
                        <div className="h-full bg-primary-600 w-[68%] rounded-full"></div>
                        <div className="absolute top-1/2 left-[68%] -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black shadow-md">
                          🚌
                        </div>
                      </div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                        <span>Terminal (07:15 AM)</span>
                        <span className="text-amber-700 font-bold">Stop #4 (Current: Sector 8)</span>
                        <span>School Gate (ETA 08:10 AM)</span>
                      </div>
                    </div>
                  </div>

                  {/* NFC Live Stream */}
                  <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Radio size={14} className="text-primary-600" /> NFC Boarding Feed
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold">Sub-second sync</span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-white border border-emerald-300 shadow-xs flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900">Aryan Mehta (Grade 9-A)</p>
                          <p className="text-[10px] text-slate-500">Stop #4 • Sector 8 Junction</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Boarded 07:44 AM
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between text-xs opacity-75">
                        <div>
                          <p className="font-bold text-slate-800">Kavya Iyer (Grade 7-C)</p>
                          <p className="text-[10px] text-slate-500">Stop #3 • Palm Heights</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          Boarded 07:38 AM
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: PARENT */}
            {activePreviewTab === 'parent' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center space-x-2 text-primary-600">
                      <Bell size={18} />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Morning Transit Alert</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      &quot;Aryan has successfully tapped his NFC card and boarded Bus #04 at Stop #4 (Sector 8). ETA to Campus: 22 mins.&quot;
                    </p>
                    <span className="text-[10px] text-slate-400 block">Sent via SMS & Push Notification</span>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center space-x-2 text-emerald-600">
                      <DollarSign size={18} />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Fee Invoicing</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Term 2 Tuition & Transport fee cleared. Digital PDF tax receipt #REC-8849 generated.
                    </p>
                    <button className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer">
                      Download Receipt PDF <ArrowRight size={12} />
                    </button>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center space-x-2 text-purple-600">
                      <Award size={18} />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Academic Report</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Midterm Examination Grade: <span className="text-purple-700 font-bold">A+ (94.2%)</span>. Class Rank: #3.
                    </p>
                    <button className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer">
                      View Report Card <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Metrics Banner (Light Theme) */}
      <section className="border-y border-slate-200 bg-slate-50/70 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <p className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">450,000+</p>
            <p className="text-xs sm:text-sm font-bold text-primary-600 uppercase tracking-wider">Students Managed</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">99.99%</p>
            <p className="text-xs sm:text-sm font-bold text-emerald-600 uppercase tracking-wider">NFC Scan Accuracy</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">1,200+</p>
            <p className="text-xs sm:text-sm font-bold text-amber-600 uppercase tracking-wider">Active Bus Routes</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">99.2%</p>
            <p className="text-xs sm:text-sm font-bold text-purple-600 uppercase tracking-wider">Parent Satisfaction</p>
          </div>
        </div>
      </section>

      {/* Core Feature Pillars (Light Theme) */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-16 relative z-10 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-primary-50 border border-primary-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-primary-700 uppercase tracking-wider">
            <Layers size={14} />
            <span>Modular Institutional Engine</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Every System Your School Needs. Perfectly Synchronized.
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Eliminate fragmented spreadsheets and third-party silos. Vidyadmin consolidates all administration into one cohesive platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-primary-500/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                <Calendar size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">Zero-Conflict Timetables</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Smart scheduling matrix preventing teacher, room, and section booking clashes. Supports Master Class Accordion matrix views with single-click period swaps.
              </p>
            </div>
            <span className="text-xs font-bold text-primary-600 mt-6 flex items-center gap-1">Academics Core →</span>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-500/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <Bus size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">Smart Bus & Live GPS</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Road-snapped real-time navigation with OSRM engine. Interactive pin-drop location picker, stop-by-stop ETA calculators, and driver dispatch logs.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-600 mt-6 flex items-center gap-1">Transport Suite →</span>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-purple-500/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <Radio size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">NFC Gate & Fleet Attendance</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Sub-second smart card verification at school turnstiles and bus boarding gates. Pushes instant SMS and app notification triggers to parents.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-600 mt-6 flex items-center gap-1">Hardware Sync →</span>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-500/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <DollarSign size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Fee Automation & Stripe</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Custom fee structures by grade and transport tier. Automated digital invoicing, payment reminders, online card collection, and dynamic tax receipts.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 mt-6 flex items-center gap-1">Finance Hub →</span>
          </div>

          {/* Feature 5 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-primary-500/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                <QrCode size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">Digital ID Cards & Skeletons</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Generate high-resolution printable PDF ID cards with dynamic school primary brand themes, barcode integration, and modular single-page student hub.
              </p>
            </div>
            <span className="text-xs font-bold text-primary-600 mt-6 flex items-center gap-1">ID Generation →</span>
          </div>

          {/* Feature 6 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-rose-500/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-rose-600 transition-colors">Multi-Role Security Guard</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Isolated database schemas and dedicated `/api/school`, `/api/admin`, `/api/teacher`, and `/api/student` controllers preventing data leakage.
              </p>
            </div>
            <span className="text-xs font-bold text-rose-600 mt-6 flex items-center gap-1">Security Standards →</span>
          </div>
        </div>
      </section>

      {/* Interactive School Scale / ROI Estimator (Light Theme) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="bg-gradient-to-r from-slate-50 via-white to-primary-50/40 rounded-3xl p-8 md:p-12 border border-slate-200 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-primary-100/80 border border-primary-200 px-3 py-1 rounded-full text-xs font-bold text-primary-800 uppercase tracking-wide">
                <Sliders size={14} />
                <span>Interactive Capacity Planner</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black text-slate-900">
                Tailored for Institutions of Any Scale
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Slide to configure your total enrolled student capacity and discover immediate automation benefits for your campus.
              </p>

              {/* Slider Component */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                  <span>Student Enrollment:</span>
                  <span className="text-xl font-black text-primary-600 bg-primary-50 px-3 py-1 rounded-xl border border-primary-200">
                    {studentScale.toLocaleString()} Students
                  </span>
                </div>
                <input 
                  type="range" 
                  min="100" 
                  max="5000" 
                  step="50"
                  value={studentScale}
                  onChange={(e) => setStudentScale(parseInt(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-slate-500 font-semibold">
                  <span>100 (Small Academy)</span>
                  <span>2,500 (College)</span>
                  <span>5,000+ (Multi-Campus)</span>
                </div>
              </div>
            </div>

            {/* Calculated Results */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                  <Bus size={20} />
                </div>
                <p className="text-3xl font-black text-slate-900">{estimatedBuses}</p>
                <p className="text-xs font-bold text-slate-500 uppercase">Recommended Smart Buses</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 mx-auto flex items-center justify-center">
                  <Users size={20} />
                </div>
                <p className="text-3xl font-black text-slate-900">{estimatedStaff}+</p>
                <p className="text-xs font-bold text-slate-500 uppercase">Faculty Portals</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                  <Zap size={20} />
                </div>
                <p className="text-3xl font-black text-emerald-600">~{hoursSavedPerWeek} hrs</p>
                <p className="text-xs font-bold text-slate-500 uppercase">Admin Hours Saved/Wk</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent SaaS Packages Pricing (Light Theme) */}
      <PricingSection plans={dynamicPlans} onSelectPlan={handleSelectPlan} />

      {/* Role Portal Gateway Section (Light Theme) */}
      <section id="portals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12 relative z-10 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-primary-50 border border-primary-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-primary-700 uppercase tracking-wider">
            <Lock size={14} />
            <span>Role-Based Gateways</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Dedicated Experience for Every User</h2>
          <p className="text-slate-600 text-sm">
            Access your secure login portal below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <PortalRoleCard
            title="School Administrator"
            role="ADMIN"
            loginHref="/login"
            icon={<Building className="text-primary-600" size={24} />}
            desc="Full command of student registrations, fee collection, staff allocation, and institutional configuration."
          />
          <PortalRoleCard
            title="Class Teacher"
            role="TEACHER"
            loginHref="/teacher/login"
            icon={<GraduationCap className="text-primary-600" size={24} />}
            desc="1-click daily attendance logging, timetable schedule view, grading submissions, and parent notices."
          />
          <PortalRoleCard
            title="Parent & Guardian"
            role="PARENT"
            loginHref="/parent/login"
            icon={<Users className="text-primary-600" size={24} />}
            desc="Live smart bus route GPS tracker, NFC boarding logs, fee receipts download, and academic milestones."
          />
          <PortalRoleCard
            title="Student Profile"
            role="STUDENT"
            loginHref="/student/login"
            icon={<Smartphone className="text-primary-600" size={24} />}
            desc="Access daily period timetables, download homework assignments, exam schedules, and library records."
          />
        </div>
      </section>

      {/* Testimonials (Light Theme) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-black text-slate-900">Trusted by Leading Educators</h2>
          <p className="text-slate-600 text-sm">Hear what principals, transport supervisors, and parents say about Vidyadmin.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 flex flex-col justify-between space-y-6 shadow-sm hover:shadow-xl transition-shadow">
              <div className="space-y-4">
                <div className="flex text-amber-500 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed italic">
                  &quot;{t.quote}&quot;
                </p>
              </div>
              <div className="flex items-center space-x-3.5 border-t border-slate-200 pt-4">
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                  <p className="text-xs text-slate-500">{t.role} • {t.school}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section (Light Theme) */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12 relative z-10 scroll-mt-24">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 bg-primary-50 border border-primary-200 px-3 py-1 rounded-full text-xs font-bold text-primary-700 uppercase">
            <HelpCircle size={14} />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Frequently Asked Questions</h2>
          <p className="text-slate-600 text-sm">Everything you need to know about deployment, security, and hardware.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 shadow-xs"
            >
              <button 
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left text-sm sm:text-base font-bold text-slate-900 hover:bg-slate-50 transition duration-200 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown 
                  size={18} 
                  className={`text-slate-400 shrink-0 transition-transform duration-300 ${expandedFaq === index ? 'rotate-180 text-primary-600' : ''}`} 
                />
              </button>
              {expandedFaq === index && (
                <div className="border-t border-slate-200 px-6 py-5 bg-slate-50/70 animate-fadeIn">
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact / Book Demo Section (Light Theme) */}
      <section id="contact" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 scroll-mt-24">
        <div className="bg-gradient-to-b from-white via-slate-50/80 to-slate-100/70 rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-2xl relative overflow-hidden">
          <div className="text-center space-y-3 mb-8">
            <h3 className="text-2xl sm:text-4xl font-black text-slate-900">Transform Your School Today</h3>
            <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto">
              Schedule a personalized 1-on-1 walkthrough with our campus architects and see live NFC telemetry in action.
            </p>
          </div>

          {contactSubmitted ? (
            <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-8 sm:p-10 text-center space-y-4 animate-fadeIn shadow-sm">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle size={36} className="text-emerald-600" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-xl sm:text-2xl font-black text-slate-900">Demonstration Request Confirmed!</h4>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you! Our educational technology consultant will contact your office within 24 hours to schedule the live interactive demo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setContactSubmitted(false);
                  setFormErrors({});
                }}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-primary-600 hover:border-primary-300 shadow-xs transition-all cursor-pointer"
              >
                <RefreshCw size={13} /> Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4 max-w-xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Representative Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setFormErrors(prev => ({ ...prev, name: '' }));
                    }}
                    className={`w-full bg-white border ${
                      formErrors.name ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20'
                    } rounded-xl py-3 px-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition`}
                    placeholder="Principal / Admin Name"
                  />
                  {formErrors.name && (
                    <p className="text-xs text-rose-500 font-medium pl-1">{formErrors.name}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setFormErrors(prev => ({ ...prev, email: '' }));
                    }}
                    className={`w-full bg-white border ${
                      formErrors.email ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20'
                    } rounded-xl py-3 px-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition`}
                    placeholder="admin@institution.edu"
                  />
                  {formErrors.email && (
                    <p className="text-xs text-rose-500 font-medium pl-1">{formErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    School / Academy Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.school}
                    onChange={(e) => {
                      setFormData({ ...formData, school: e.target.value });
                      setFormErrors(prev => ({ ...prev, school: '' }));
                    }}
                    className={`w-full bg-white border ${
                      formErrors.school ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20'
                    } rounded-xl py-3 px-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition`}
                    placeholder="E.g. St. Xavier's Academy"
                  />
                  {formErrors.school && (
                    <p className="text-xs text-rose-500 font-medium pl-1">{formErrors.school}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <FormPhoneInput
                    label="Phone Number"
                    required
                    value={formData.phone}
                    error={formErrors.phone}
                    onChange={(phone) => {
                      setFormData({ ...formData, phone });
                      setFormErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    defaultCountry="in"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Select
                  label="Primary Module of Interest *"
                  value={formData.moduleInterest}
                  error={formErrors.moduleInterest}
                  onChange={(val) => {
                    setFormData({ ...formData, moduleInterest: val });
                    setFormErrors(prev => ({ ...prev, moduleInterest: '' }));
                  }}
                  options={moduleInterestOptions}
                  searchable={false}
                  clearable={false}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Additional Requirements / Notes</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    setFormErrors(prev => ({ ...prev, message: '' }));
                  }}
                  className={`w-full bg-white border ${
                    formErrors.message ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20'
                  } rounded-xl py-3 px-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition resize-none`}
                  placeholder="Tell us about student count, bus count, or custom requirements..."
                />
                {formErrors.message && (
                  <p className="text-xs text-rose-500 font-medium pl-1">{formErrors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl text-white font-bold text-sm bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-600/25 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Submitting Request...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Submit Demonstration Request
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer (Light Theme) */}
      <footer className="border-t border-slate-200 bg-slate-50 py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          <div className="md:col-span-5 space-y-4">
            {settingsLoading ? (
              <div className="flex items-center space-x-3 animate-pulse">
                <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
                <div className="h-6 w-32 bg-slate-200 rounded-md" />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {systemSettings?.logo_url ? (
                  <div className="w-12 h-12 rounded-full bg-white border border-slate-200/90 p-1 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                    <img src={systemSettings.logo_url} alt={systemSettings.company_name} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center shadow-md relative shrink-0">
                    <GraduationCap size={22} className="text-white" />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-secondary-500 border-2 border-white"></span>
                  </div>
                )}
                <span className="text-xl font-black tracking-wider text-slate-900">{systemSettings?.company_name || 'Vidyadmin'}</span>
              </div>
            )}
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-sm">
              {systemSettings?.tagline || 'Simplifying Education, Empowering Admins. Next-generation Institutional ERP & Live NFC Bus Telemetry OS.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-accent-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-accent-600 animate-pulse"></span>
              All Cloud Services Operational • SLA 99.9%
            </div>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Platform Links</h4>
            <div className="space-y-2 text-xs text-slate-600 font-medium">
              <a href="#features" className="block hover:text-slate-900 transition">Features & Modules</a>
              <a href="#interactive-simulator" className="block hover:text-slate-900 transition">Live Dashboard Simulator</a>
              <a href="#transport" className="block hover:text-slate-900 transition">Smart Bus & RFID Hardware</a>
              <a href="#packages" className="block hover:text-slate-900 transition">Subscription Plans</a>
              <a href="#faq" className="block hover:text-slate-900 transition">FAQ & Help</a>
            </div>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Contact & Support</h4>
            <div className="space-y-2.5 text-xs text-slate-600 font-medium">
              <p className="flex items-center gap-2"><Building size={14} className="text-primary-600 shrink-0" /> {systemSettings?.address || 'Vidyadmin Global HQ, Tech Horizon Tower'}</p>
              <p className="flex items-center gap-2"><Phone size={14} className="text-primary-600 shrink-0" /> {systemSettings?.support_phone || '+1 (800) 492-8821'}</p>
              <p className="flex items-center gap-2"><Mail size={14} className="text-primary-600 shrink-0" /> {systemSettings?.support_email || 'support@vidyadmin.com'}</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>© 2026 {systemSettings?.company_name || 'Vidyadmin'} Systems Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/login" className="hover:text-slate-900 transition">Portal Login</Link>
            <a href="#contact" className="hover:text-slate-900 transition">Book Demo</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PortalRoleCard({ title, role, icon, desc, loginHref = '/login' }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-primary-500/40 flex flex-col justify-between transition-all duration-300 group shadow-sm hover:shadow-xl">
      <div className="space-y-3">
        <div className="w-12 h-12 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <div>
          <span className="text-[9px] font-black uppercase tracking-wider text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
            {role}
          </span>
          <h4 className="text-base font-bold text-slate-900 mt-1.5">{title}</h4>
        </div>
        <p className="text-slate-600 text-xs leading-relaxed">{desc}</p>
      </div>
      <Link 
        href={loginHref} 
        className="mt-6 py-2.5 px-4 rounded-xl text-center text-xs font-bold bg-slate-50 border border-slate-200 hover:bg-primary-600 hover:border-primary-600 hover:text-white text-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
      >
        Sign In <ArrowRight size={12} />
      </Link>
    </div>
  );
}
