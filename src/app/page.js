'use client';
import { useState } from 'react';
import Link from 'next/link';
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
  Navigation
} from 'lucide-react';

export default function LandingPage() {
  const [activePreviewTab, setActivePreviewTab] = useState('admin');
  const [billingPeriod, setBillingPeriod] = useState('annual'); // 'monthly' | 'annual'
  const [studentScale, setStudentScale] = useState(850);
  const [expandedFaq, setExpandedFaq] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', school: '', phone: '', moduleInterest: 'full_suite', message: '' });

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setFormData({ name: '', email: '', school: '', phone: '', moduleInterest: 'full_suite', message: '' });
    }, 4500);
  };

  // Dynamic calculations based on student slider
  const estimatedBuses = Math.max(1, Math.round(studentScale * 0.035));
  const estimatedStaff = Math.max(10, Math.round(studentScale * 0.07));
  const hoursSavedPerWeek = Math.round(studentScale * 0.08);

  const packages = [
    {
      id: 'transport',
      name: 'Smart Bus Fleet',
      tagline: 'GPS Telemetry & Transit Safety',
      badge: 'Transport Special',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      priceMonthly: '$49',
      priceAnnual: '$39',
      popular: false,
      features: [
        'Live GPS Fleet Tracking (OSRM Navigation)',
        'NFC/RFID Bus Boarding & Deboarding Logs',
        'Real-time Parent ETA & Stop Push Alerts',
        'Driver, Vehicle & Fuel Maintenance Logs',
        'Speed Alerts & Safe Route Geo-Fencing',
        'Dedicated Transport Manager Dashboard'
      ]
    },
    {
      id: 'full_suite',
      name: 'Full Institutional Suite',
      tagline: 'Complete School ERP + Smart Bus Fleet',
      badge: 'Most Popular • All-in-One',
      badgeColor: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
      priceMonthly: '$149',
      priceAnnual: '$119',
      popular: true,
      features: [
        'Everything in Academic ERP + Smart Bus Fleet',
        'Dynamic Multi-Campus & Multi-Role Access',
        'NFC Dual Gateway (Campus Gate & Bus Entry)',
        'Automated Fee Invoicing & Online Gateway (Stripe)',
        'Zero-Conflict Master Timetable Engine',
        'Smart PDF Student & Teacher ID Cards with Barcode',
        'Priority 24/7 SLA Support & Dedicated Training'
      ]
    },
    {
      id: 'academic',
      name: 'Academic Core ERP',
      tagline: 'Academics, Grading & Operations',
      badge: 'ERP Core',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      priceMonthly: '$89',
      priceAnnual: '$69',
      popular: false,
      features: [
        'Class & Section Dynamic Master Management',
        'Class Teacher & Single Assignment Matrix',
        'Attendance Tracking (Period & Daily)',
        'Exams, Grading Scales & Report Cards',
        'Student Profile 360° Hub & Documents',
        'Fee Category & Installment Schedule'
      ]
    }
  ];

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
      a: "Absolutely. EduManage uses strict role-based access control (RBAC), multi-tenant isolation, 256-bit encryption in transit and at rest, and dedicated endpoints for Admins, Teachers, Parents, and Students."
    },
    {
      q: "Can we customize school branding, logos, and theme colors?",
      a: "Yes! Every school receives customized dynamic white-label branding. Your institutional logo and custom brand theme colors are loaded synchronously without page color flashes (Zero-FOUC architecture)."
    },
    {
      q: "What devices do staff and teachers need to use the portal?",
      a: "EduManage is 100% web-based and cloud-native. It works flawlessly across smartphones, tablets, Chromebooks, laptops, and desktop browsers without requiring heavy local software installation."
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden font-sans selection:bg-primary-500 selection:text-white">
      {/* Dynamic Background Glow Orbs adapting to School Theme Color */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[650px] h-[650px] rounded-full blur-[140px] opacity-20 animate-pulse"
          style={{ background: 'radial-gradient(circle, var(--theme-primary-500, #4f46e5) 0%, transparent 70%)' }}
        ></div>
        <div 
          className="absolute top-[35%] right-[-15%] w-[700px] h-[700px] rounded-full blur-[160px] opacity-15"
          style={{ background: 'radial-gradient(circle, var(--theme-primary-600, #4338ca) 0%, #38bdf8 50%, transparent 70%)' }}
        ></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-emerald-600/10 to-teal-500/5 blur-[150px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/85 border-b border-white/10 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-primary-400 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform duration-300">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center">
                Edu<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-primary-300 to-cyan-400">Manage</span>
              </span>
              <span className="block text-[10px] font-semibold text-primary-400/90 tracking-wider uppercase -mt-1">
                Next-Gen School OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/60 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
            <a href="#features" className="text-xs font-semibold px-4 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/5 transition-all">Features</a>
            <a href="#interactive-simulator" className="text-xs font-semibold px-4 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/5 transition-all">Live Preview</a>
            <a href="#transport" className="text-xs font-semibold px-4 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/5 transition-all">Smart Bus & NFC</a>
            <a href="#packages" className="text-xs font-semibold px-4 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/5 transition-all">Packages</a>
            <a href="#portals" className="text-xs font-semibold px-4 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/5 transition-all">Portals</a>
            <a href="#faq" className="text-xs font-semibold px-4 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/5 transition-all">FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center space-x-3">
            <Link 
              href="/login" 
              className="text-xs font-bold px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 text-slate-200 hover:text-white transition-all duration-200"
            >
              Portal Login
            </Link>
            <a 
              href="#contact" 
              className="text-xs font-bold px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 hover:from-primary-500 hover:to-primary-400 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-1.5"
            >
              <Sparkles size={14} /> Request Demo
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-white/10 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-white/10 bg-slate-950/95 backdrop-blur-2xl px-6 py-6 space-y-4 animate-fadeIn">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="flex items-center text-sm font-medium text-slate-300 hover:text-primary-400 py-2">✨ All Features</a>
            <a href="#interactive-simulator" onClick={() => setMobileMenuOpen(false)} className="flex items-center text-sm font-medium text-slate-300 hover:text-primary-400 py-2">🖥️ Live Platform Simulator</a>
            <a href="#transport" onClick={() => setMobileMenuOpen(false)} className="flex items-center text-sm font-medium text-slate-300 hover:text-primary-400 py-2">🚌 Smart Bus & RFID</a>
            <a href="#packages" onClick={() => setMobileMenuOpen(false)} className="flex items-center text-sm font-medium text-slate-300 hover:text-primary-400 py-2">💎 Plans & Packages</a>
            <a href="#portals" onClick={() => setMobileMenuOpen(false)} className="flex items-center text-sm font-medium text-slate-300 hover:text-primary-400 py-2">🔐 Portal Gateways</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="flex items-center text-sm font-medium text-slate-300 hover:text-primary-400 py-2">❓ FAQ Support</a>
            <hr className="border-white/10 my-3" />
            <div className="flex flex-col gap-2.5 pt-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 rounded-xl border border-white/15 bg-white/5 text-white font-semibold text-sm">
                Login to Portal
              </Link>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold text-sm shadow-lg shadow-primary-500/25">
                Book School Demo
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Release Badge */}
          <div className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/30 px-4 py-2 rounded-full text-xs font-bold text-primary-300 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-ping"></span>
            <span>⚡ Institutional ERP & Smart Bus Fleet Intelligence 2026</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
            The Modern Operating System for <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-primary-300 to-cyan-400">Future-Ready Schools</span>
          </h1>

          {/* Subtext */}
          <p className="text-slate-300 text-base sm:text-xl leading-relaxed max-w-2xl mx-auto font-normal">
            Elevate campus administration with unified student management, zero-conflict timetables, automated fee collection, and real-time NFC bus fleet telemetry.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-white font-bold text-sm bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 hover:from-primary-500 hover:to-primary-400 shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Access School Portal
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#interactive-simulator" 
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 text-slate-200 hover:text-white transition duration-300 flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <Activity size={18} className="text-primary-400" />
              Explore Live Simulator
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-400" /> 256-Bit Multi-Tenant Security</span>
            <span className="flex items-center gap-1.5"><Radio size={16} className="text-amber-400" /> Sub-Second NFC Tap Telemetry</span>
            <span className="flex items-center gap-1.5"><Zap size={16} className="text-cyan-400" /> Zero-FOUC White-Label Branding</span>
            <span className="flex items-center gap-1.5"><Smartphone size={16} className="text-purple-400" /> Responsive On All Devices</span>
          </div>
        </div>

        {/* Live Interactive Product Simulator */}
        <div id="interactive-simulator" className="mt-16 max-w-5xl mx-auto scroll-mt-28">
          <div className="rounded-3xl border border-white/15 bg-slate-900/80 backdrop-blur-2xl shadow-2xl overflow-hidden p-4 sm:p-8 relative">
            {/* Ambient inner gradient */}
            <div 
              className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
              style={{ background: 'var(--theme-primary-500, #4f46e5)' }}
            ></div>

            {/* Window header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500/90 shadow-sm shadow-rose-500/50"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500/90 shadow-sm shadow-amber-500/50"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/90 shadow-sm shadow-emerald-500/50"></span>
                </div>
                <span className="text-xs font-mono text-slate-400 hidden md:inline">https://campus.edumanage.cloud/dashboard</span>
              </div>

              {/* View Selector Tabs */}
              <div className="flex bg-slate-950 p-1 rounded-2xl border border-white/10 w-full sm:w-auto overflow-x-auto">
                <button 
                  onClick={() => setActivePreviewTab('admin')} 
                  className={`text-xs px-4 py-2 rounded-xl transition-all font-bold cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activePreviewTab === 'admin' 
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/25' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BarChart3 size={14} /> Admin Command
                </button>
                <button 
                  onClick={() => setActivePreviewTab('teacher')} 
                  className={`text-xs px-4 py-2 rounded-xl transition-all font-bold cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activePreviewTab === 'teacher' 
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/25' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Calendar size={14} /> Teacher Podium
                </button>
                <button 
                  onClick={() => setActivePreviewTab('bus')} 
                  className={`text-xs px-4 py-2 rounded-xl transition-all font-bold cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activePreviewTab === 'bus' 
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/25' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bus size={14} /> Smart Bus Telemetry
                </button>
                <button 
                  onClick={() => setActivePreviewTab('parent')} 
                  className={`text-xs px-4 py-2 rounded-xl transition-all font-bold cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activePreviewTab === 'parent' 
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/25' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone size={14} /> Parent Portal
                </button>
              </div>
            </div>

            {/* TAB CONTENT: ADMIN */}
            {activePreviewTab === 'admin' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Enrolled</span>
                      <Users size={14} className="text-primary-400" />
                    </div>
                    <p className="text-2xl font-black text-white mt-1">1,842</p>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center mt-1">↑ 8.4% this session</span>
                  </div>
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fees Collected</span>
                      <DollarSign size={14} className="text-emerald-400" />
                    </div>
                    <p className="text-2xl font-black text-white mt-1">$94,200</p>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center mt-1">94% target achieved</span>
                  </div>
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Fleet</span>
                      <Bus size={14} className="text-amber-400" />
                    </div>
                    <p className="text-2xl font-black text-white mt-1">18 / 18</p>
                    <span className="text-[10px] text-amber-400 font-semibold flex items-center mt-1">100% on schedule</span>
                  </div>
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Daily Attendance</span>
                      <CheckCircle size={14} className="text-purple-400" />
                    </div>
                    <p className="text-2xl font-black text-white mt-1">97.8%</p>
                    <span className="text-[10px] text-purple-400 font-semibold flex items-center mt-1">1,802 present today</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Activity size={14} className="text-primary-400" /> Live Campus Events
                      </h4>
                      <span className="text-[10px] bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded-full font-bold">REALTIME</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span className="text-slate-300 font-medium">Grade 10-A Midterm Results Published</span>
                        </div>
                        <span className="text-[10px] text-slate-500">2 min ago</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary-400"></span>
                          <span className="text-slate-300 font-medium">Term 2 Fee Receipt #4982 Paid ($450)</span>
                        </div>
                        <span className="text-[10px] text-slate-500">8 min ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <FileCheck2 size={14} className="text-emerald-400" /> Quick Administrative Tasks
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                      <div className="bg-primary-600/10 hover:bg-primary-600/20 text-primary-300 border border-primary-500/20 p-3 rounded-xl flex items-center justify-between cursor-pointer transition">
                        <span>Generate ID Cards</span>
                        <ArrowRight size={12} />
                      </div>
                      <div className="bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 border border-purple-500/20 p-3 rounded-xl flex items-center justify-between cursor-pointer transition">
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
                <div className="bg-primary-600/10 border border-primary-500/20 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-300">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Class Teacher - Grade 10 Section B</h4>
                      <p className="text-xs text-slate-400">Class Room #304 • Total Students: 38</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                    Today Attendance: 37 / 38 (97.4%)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Period 1 (08:30 AM)</span>
                      <span className="text-emerald-400 font-bold">COMPLETED</span>
                    </div>
                    <p className="text-sm font-bold text-white">Advanced Mathematics</p>
                    <p className="text-xs text-slate-500">Quadratic Equations & Polynomials</p>
                  </div>
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-primary-500/30 shadow-sm shadow-primary-500/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-primary-400 font-bold">Current Period (10:15 AM)</span>
                      <span className="text-primary-400 font-bold animate-pulse">● LIVE</span>
                    </div>
                    <p className="text-sm font-bold text-white">Physics Laboratory</p>
                    <p className="text-xs text-slate-500">Optics & Wave Motion (Lab 2)</p>
                  </div>
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Period 4 (01:00 PM)</span>
                      <span className="text-slate-500 font-bold">UPCOMING</span>
                    </div>
                    <p className="text-sm font-bold text-white">Computer Science</p>
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
                  <div className="lg:col-span-7 bg-slate-950 p-5 rounded-2xl border border-white/10 relative overflow-hidden space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bus size={18} className="text-amber-400" />
                        <span className="text-sm font-bold text-white">Bus #04 • Route North Express</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live GPS (34 km/h)
                      </span>
                    </div>

                    {/* Progress Track Simulation */}
                    <div className="space-y-3 pt-2">
                      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden relative">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-primary-500 w-[68%] rounded-full"></div>
                        <div className="absolute top-1/2 left-[68%] -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-amber-400 rounded-full border-2 border-slate-950 flex items-center justify-center text-[8px] font-black text-slate-950 shadow-lg">
                          🚌
                        </div>
                      </div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                        <span>Terminal (07:15 AM)</span>
                        <span className="text-amber-400 font-bold">Stop #4 (Current: Sector 8)</span>
                        <span>School Gate (ETA 08:10 AM)</span>
                      </div>
                    </div>
                  </div>

                  {/* NFC Live Stream */}
                  <div className="lg:col-span-5 bg-slate-950 p-5 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Radio size={14} className="text-primary-400" /> NFC Boarding Feed
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold">Sub-second sync</span>
                    </div>
                    <div className="space-y-2">
                      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-white">Aryan Mehta (Grade 9-A)</p>
                          <p className="text-[10px] text-slate-400">Stop #4 • Sector 8 Junction</p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Boarded 07:44 AM
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between text-xs opacity-75">
                        <div>
                          <p className="font-bold text-slate-200">Kavya Iyer (Grade 7-C)</p>
                          <p className="text-[10px] text-slate-400">Stop #3 • Palm Heights</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
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
                  <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex items-center space-x-2 text-primary-400">
                      <Bell size={18} />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Morning Transit Alert</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      &quot;Aryan has successfully tapped his NFC card and boarded Bus #04 at Stop #4 (Sector 8). ETA to Campus: 22 mins.&quot;
                    </p>
                    <span className="text-[10px] text-slate-500 block">Sent via SMS & Push Notification</span>
                  </div>

                  <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <DollarSign size={18} />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fee Invoicing</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Term 2 Tuition & Transport fee cleared. Digital PDF tax receipt #REC-8849 generated.
                    </p>
                    <button className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer">
                      Download Receipt PDF <ArrowRight size={12} />
                    </button>
                  </div>

                  <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex items-center space-x-2 text-purple-400">
                      <Award size={18} />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Academic Report</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Midterm Examination Grade: <span className="text-purple-300 font-bold">A+ (94.2%)</span>. Class Rank: #3.
                    </p>
                    <button className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer">
                      View Report Card <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Metrics Banner */}
      <section className="border-y border-white/10 bg-slate-900/40 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <p className="text-3xl sm:text-5xl font-black text-white tracking-tight">450,000+</p>
            <p className="text-xs sm:text-sm font-semibold text-primary-400 uppercase tracking-wider">Students Managed</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-5xl font-black text-white tracking-tight">99.99%</p>
            <p className="text-xs sm:text-sm font-semibold text-emerald-400 uppercase tracking-wider">NFC Scan Accuracy</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-5xl font-black text-white tracking-tight">1,200+</p>
            <p className="text-xs sm:text-sm font-semibold text-amber-400 uppercase tracking-wider">Active Bus Routes</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-5xl font-black text-white tracking-tight">99.2%</p>
            <p className="text-xs sm:text-sm font-semibold text-purple-400 uppercase tracking-wider">Parent Satisfaction</p>
          </div>
        </div>
      </section>

      {/* Core Feature Pillars */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-16 relative z-10 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-primary-400 uppercase tracking-wider">
            <Layers size={14} />
            <span>Modular Institutional Engine</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Every System Your School Needs. Perfectly Synchronized.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Eliminate fragmented spreadsheets and third-party silos. EduManage consolidates all administration into one cohesive platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/10 hover:border-primary-500/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
                <Calendar size={24} />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-primary-300 transition-colors">Zero-Conflict Timetables</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Smart scheduling matrix preventing teacher, room, and section booking clashes. Supports Master Class Accordion matrix views with single-click period swaps.
              </p>
            </div>
            <span className="text-xs font-bold text-primary-400 mt-6 flex items-center gap-1">Academics Core →</span>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/10 hover:border-amber-500/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Bus size={24} />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">Smart Bus & Live GPS</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Road-snapped real-time navigation with OSRM engine. Interactive pin-drop location picker, stop-by-stop ETA calculators, and driver dispatch logs.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-400 mt-6 flex items-center gap-1">Transport Suite →</span>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/10 hover:border-purple-500/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Radio size={24} />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">NFC Gate & Fleet Attendance</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Sub-second smart card verification at school turnstiles and bus boarding gates. Pushes instant SMS and app notification triggers to parents.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-400 mt-6 flex items-center gap-1">Hardware Sync →</span>
          </div>

          {/* Feature 4 */}
          <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/10 hover:border-emerald-500/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <DollarSign size={24} />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">Fee Automation & Stripe</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Custom fee structures by grade and transport tier. Automated digital invoicing, payment reminders, online card collection, and dynamic tax receipts.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-400 mt-6 flex items-center gap-1">Finance Hub →</span>
          </div>

          {/* Feature 5 */}
          <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/10 hover:border-cyan-500/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <QrCode size={24} />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">Digital ID Cards & Skeletons</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Generate high-resolution printable PDF ID cards with dynamic school primary brand themes, barcode integration, and modular single-page student hub.
              </p>
            </div>
            <span className="text-xs font-bold text-cyan-400 mt-6 flex items-center gap-1">ID Generation →</span>
          </div>

          {/* Feature 6 */}
          <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/10 hover:border-rose-500/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-rose-300 transition-colors">Multi-Role Security Guard</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Isolated database schemas and dedicated `/api/school`, `/api/admin`, `/api/teacher`, and `/api/student` controllers preventing data leakage.
              </p>
            </div>
            <span className="text-xs font-bold text-rose-400 mt-6 flex items-center gap-1">Security Standards →</span>
          </div>
        </div>
      </section>

      {/* Interactive School Scale / ROI Estimator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 rounded-3xl p-8 md:p-12 border border-primary-500/20 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center space-x-2 bg-primary-500/20 border border-primary-500/30 px-3 py-1 rounded-full text-xs font-bold text-primary-300 uppercase tracking-wide">
                <Sliders size={14} />
                <span>Interactive Capacity Planner</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black text-white">
                Tailored for Institutions of Any Scale
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Slide to configure your total enrolled student capacity and discover immediate automation benefits for your campus.
              </p>

              {/* Slider Component */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-sm font-bold text-white">
                  <span>Student Enrollment:</span>
                  <span className="text-xl font-black text-primary-400 bg-primary-500/10 px-3 py-1 rounded-xl border border-primary-500/30">
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
                  className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
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
              <div className="bg-slate-950/80 p-5 rounded-2xl border border-white/10 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
                  <Bus size={20} />
                </div>
                <p className="text-3xl font-black text-white">{estimatedBuses}</p>
                <p className="text-xs font-semibold text-slate-400 uppercase">Recommended Smart Buses</p>
              </div>

              <div className="bg-slate-950/80 p-5 rounded-2xl border border-white/10 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 mx-auto flex items-center justify-center">
                  <Users size={20} />
                </div>
                <p className="text-3xl font-black text-white">{estimatedStaff}+</p>
                <p className="text-xs font-semibold text-slate-400 uppercase">Faculty Portals</p>
              </div>

              <div className="bg-slate-950/80 p-5 rounded-2xl border border-emerald-500/30 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
                  <Zap size={20} />
                </div>
                <p className="text-3xl font-black text-emerald-400">~{hoursSavedPerWeek} hrs</p>
                <p className="text-xs font-semibold text-slate-400 uppercase">Admin Hours Saved/Wk</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent SaaS Packages Pricing */}
      <section id="packages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-16 relative z-10 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-primary-400 uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Modular Subscriptions</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Predictable Plans for Every Institution
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Choose standalone transport logistics, pure academic ERP, or the full unified suite.
          </p>

          {/* Billing Switch */}
          <div className="pt-4 flex items-center justify-center space-x-4">
            <span className={`text-xs font-bold ${billingPeriod === 'monthly' ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
            <button 
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
              className="w-14 h-7 rounded-full bg-slate-800 p-1 border border-white/10 relative transition-colors focus:outline-none"
              aria-label="Toggle billing duration"
            >
              <div className={`w-5 h-5 rounded-full bg-primary-500 transition-transform ${billingPeriod === 'annual' ? 'translate-x-7' : 'translate-x-0'}`}></div>
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${billingPeriod === 'annual' ? 'text-white' : 'text-slate-400'}`}>Yearly</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">SAVE 20%</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative border ${
                pkg.popular 
                  ? 'bg-gradient-to-b from-primary-950/40 via-slate-900 to-slate-950 border-primary-500 shadow-2xl shadow-primary-500/20 lg:-translate-y-2' 
                  : 'bg-slate-900/60 border-white/10 hover:border-white/20'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
                  ★ Institutional Recommendation
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${pkg.badgeColor}`}>
                    {pkg.badge}
                  </span>
                  <h3 className="text-2xl font-black text-white mt-3">{pkg.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{pkg.tagline}</p>
                </div>

                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl sm:text-5xl font-black text-white">
                    {billingPeriod === 'annual' ? pkg.priceAnnual : pkg.priceMonthly}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/ school / mo</span>
                </div>

                <div className="border-t border-white/10 pt-6 space-y-3">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Features Included:</p>
                  <ul className="space-y-2.5">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start text-xs text-slate-300 gap-2.5">
                        <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <a 
                  href="#contact"
                  className={`w-full py-3.5 px-4 rounded-xl text-center text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white shadow-lg shadow-primary-500/25'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  Choose {pkg.name} <ArrowRight size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Role Portal Gateway Section */}
      <section id="portals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12 relative z-10 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-primary-400 uppercase tracking-wider">
            <Lock size={14} />
            <span>Role-Based Gateways</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Dedicated Experience for Every User</h2>
          <p className="text-slate-400 text-sm">
            Access your secure login portal below.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <PortalRoleCard
            title="School Administrator"
            role="ADMIN"
            loginHref="/login"
            icon={<Building className="text-primary-400" size={24} />}
            desc="Full command of student registrations, fee collection, staff allocation, and institutional configuration."
          />
          <PortalRoleCard
            title="Class Teacher"
            role="TEACHER"
            loginHref="/teacher/login"
            icon={<GraduationCap className="text-purple-400" size={24} />}
            desc="1-click daily attendance logging, timetable schedule view, grading submissions, and parent notices."
          />
          <PortalRoleCard
            title="Parent & Guardian"
            role="PARENT"
            loginHref="/parent/login"
            icon={<Users className="text-emerald-400" size={24} />}
            desc="Live smart bus route GPS tracker, NFC boarding logs, fee receipts download, and academic milestones."
          />
          <PortalRoleCard
            title="Student Profile"
            role="STUDENT"
            loginHref="/student/login"
            icon={<Smartphone className="text-cyan-400" size={24} />}
            desc="Access daily period timetables, download homework assignments, exam schedules, and library records."
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-black text-white">Trusted by Leading Educators</h2>
          <p className="text-slate-400 text-sm">Hear what principals, transport supervisors, and parents say about EduManage.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-slate-900/60 p-8 rounded-3xl border border-white/10 flex flex-col justify-between space-y-6 shadow-xl">
              <div className="space-y-4">
                <div className="flex text-amber-400 space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  &quot;{t.quote}&quot;
                </p>
              </div>
              <div className="flex items-center space-x-3.5 border-t border-white/10 pt-4">
                <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-primary-500/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{t.name}</h4>
                  <p className="text-xs text-slate-400">{t.role} • {t.school}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12 relative z-10 scroll-mt-24">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 bg-primary-500/10 border border-primary-500/30 px-3 py-1 rounded-full text-xs font-bold text-primary-400 uppercase">
            <HelpCircle size={14} />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-sm">Everything you need to know about deployment, security, and hardware.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-slate-900/60 rounded-2xl border border-white/10 overflow-hidden transition-all duration-300"
            >
              <button 
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left text-sm sm:text-base font-bold text-white hover:bg-white/5 transition duration-200 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown 
                  size={18} 
                  className={`text-slate-400 shrink-0 transition-transform duration-300 ${expandedFaq === index ? 'rotate-180 text-primary-400' : ''}`} 
                />
              </button>
              {expandedFaq === index && (
                <div className="border-t border-white/10 px-6 py-5 bg-slate-950/40 animate-fadeIn">
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact / Book Demo Section */}
      <section id="contact" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 scroll-mt-24">
        <div className="bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 rounded-3xl p-8 sm:p-12 border border-primary-500/30 shadow-2xl relative overflow-hidden">
          <div className="text-center space-y-3 mb-8">
            <h3 className="text-2xl sm:text-4xl font-black text-white">Transform Your School Today</h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-lg mx-auto">
              Schedule a personalized 1-on-1 walkthrough with our campus architects and see live NFC telemetry in action.
            </p>
          </div>

          {contactSubmitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-3 animate-fadeIn">
              <CheckCircle size={48} className="text-emerald-400 mx-auto" />
              <h4 className="text-xl font-bold text-white">Demonstration Request Confirmed!</h4>
              <p className="text-sm text-slate-300">
                Our educational technology consultant will contact your office within 24 hours to coordinate the live interactive demo.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4 max-w-xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Representative Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                    placeholder="Principal / Admin Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                    placeholder="admin@institution.edu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">School / Academy Name</label>
                  <input
                    type="text"
                    required
                    value={formData.school}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                    placeholder="E.g. St. Xavier's Academy"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Primary Module of Interest</label>
                <select
                  value={formData.moduleInterest}
                  onChange={(e) => setFormData({ ...formData, moduleInterest: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-primary-500 transition cursor-pointer"
                >
                  <option value="full_suite">Full Institutional Suite (ERP + Smart Bus + NFC)</option>
                  <option value="transport_only">Smart Bus Fleet & Live GPS Only</option>
                  <option value="school_only">Academic ERP & Fee Management Only</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Additional Requirements / Notes</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition resize-none"
                  placeholder="Tell us about student count, bus count, or custom requirements..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 hover:from-primary-500 hover:to-primary-400 shadow-xl shadow-primary-500/25 hover:scale-[1.01] active:scale-[0.99] transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={16} /> Submit Demonstration Request
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/95 py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center">
                <GraduationCap size={22} className="text-white" />
              </div>
              <span className="text-xl font-black tracking-wider text-white">EduManage</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Next-generation Institutional ERP & Live NFC Bus Telemetry OS. Built for modern schools, academies, and multi-campus universities.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All Cloud Services Operational
            </div>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Platform Links</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <a href="#features" className="block hover:text-white transition">Features & Modules</a>
              <a href="#interactive-simulator" className="block hover:text-white transition">Live Dashboard Simulator</a>
              <a href="#transport" className="block hover:text-white transition">Smart Bus & RFID Hardware</a>
              <a href="#packages" className="block hover:text-white transition">Subscription Plans</a>
              <a href="#faq" className="block hover:text-white transition">FAQ & Help</a>
            </div>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Contact & Support</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <p className="flex items-center gap-2"><Building size={14} className="text-primary-400" /> EduManage Global HQ, Tech Horizon Tower</p>
              <p className="flex items-center gap-2"><Phone size={14} className="text-primary-400" /> +1 (800) 492-8821</p>
              <p className="flex items-center gap-2"><Mail size={14} className="text-primary-400" /> contact@edumanage.cloud</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 EduManage Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/login" className="hover:text-slate-300 transition">Portal Login</Link>
            <a href="#contact" className="hover:text-slate-300 transition">Book Demo</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PortalRoleCard({ title, role, icon, desc, loginHref = '/login' }) {
  return (
    <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/10 hover:border-primary-500/40 flex flex-col justify-between transition-all duration-300 group shadow-lg">
      <div className="space-y-3">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <div>
          <span className="text-[9px] font-black uppercase tracking-wider text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full border border-primary-500/20">
            {role}
          </span>
          <h4 className="text-base font-bold text-white mt-1.5">{title}</h4>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
      </div>
      <Link 
        href={loginHref} 
        className="mt-6 py-2.5 px-4 rounded-xl text-center text-xs font-bold bg-white/5 border border-white/10 hover:bg-primary-600 hover:border-primary-500 hover:text-white text-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
      >
        Sign In <ArrowRight size={12} />
      </Link>
    </div>
  );
}
