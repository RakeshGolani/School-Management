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
  AlertCircle,
  FileText,
  Phone,
  Mail,
  Menu,
  X
} from 'lucide-react';

export default function LandingPage() {
  const [activePreviewTab, setActivePreviewTab] = useState('admin');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', school: '', message: '' });

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setFormData({ name: '', email: '', school: '', message: '' });
    }, 4000);
  };

  const faqs = [
    {
      q: "How does the NFC/RFID attendance tracking work?",
      a: "Every student is assigned an NFC/RFID card linked to their student profile (nfc_card_uid). When they board or deboard the bus, or enter/leave the school gate, they scan their card at the terminal. The terminal instantly pushes gate or bus attendance logs, triggering push and SMS notifications to parents in real-time."
    },
    {
      q: "Is the school bus service optional for students?",
      a: "Yes. The bus service is fully optional. Admins can easily enable or disable it for any student profile via the 'is_bus_service_enabled' toggle in the student settings, which dynamically links them to specific bus routes and stops."
    },
    {
      q: "Can parents track the school bus location in real-time?",
      a: "Absolutely. Parents who have the bus service enabled can view live tracking maps, estimated times of arrival (ETA) for their specific stop, driver contact details, and boarding logs through the Parent Portal."
    },
    {
      q: "How secure is student and staff data?",
      a: "EduManage takes data security seriously. We implement secure role-based guards, JWT token authentication, and data isolation. Database profiles for Admins, Teachers, Parents, and Students are kept in completely separate tables to ensure compliance and security."
    },
    {
      q: "Can teachers manage grades and attendance from mobile devices?",
      a: "Yes! The Teacher Portal is built with a responsive glassmorphic interface that adapts perfectly to tablets, phones, and desktops. Teachers can log attendance, submit grades, post homework assignments, and message parents on the go."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden font-sans">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-600/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[180px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[5%] w-[450px] h-[450px] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <BookOpen size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-wider text-white">EduManage</span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-slate-300 hover:text-primary-400 transition-colors">Features</a>
            <a href="#transport" className="text-sm font-medium text-slate-300 hover:text-primary-400 transition-colors">Smart Bus</a>
            <a href="#portals" className="text-sm font-medium text-slate-300 hover:text-primary-400 transition-colors">Portals</a>
            <a href="#faq" className="text-sm font-medium text-slate-300 hover:text-primary-400 transition-colors">FAQ</a>
            <a href="#contact" className="text-sm font-medium text-slate-300 hover:text-primary-400 transition-colors">Contact</a>
          </nav>

          {/* Action Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="text-sm font-semibold px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all">
              Portal Login
            </Link>
            <a href="#contact" className="text-sm font-semibold px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white transition-all shadow-lg hover:shadow-primary-500/10">
              Request Demo
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white transition"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/5 bg-slate-950 px-6 py-6 space-y-4">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-slate-300 hover:text-primary-400 py-2">Features</a>
            <a href="#transport" onClick={() => setMobileMenuOpen(false)} className="block text-slate-300 hover:text-primary-400 py-2">Smart Bus</a>
            <a href="#portals" onClick={() => setMobileMenuOpen(false)} className="block text-slate-300 hover:text-primary-400 py-2">Portals</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-slate-300 hover:text-primary-400 py-2">FAQ</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block text-slate-300 hover:text-primary-400 py-2">Contact</a>
            <hr className="border-white/5 my-4" />
            <div className="flex flex-col gap-3">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 rounded-xl border border-white/10 text-white">
                Portal Login
              </Link>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 rounded-xl bg-primary-600 text-white font-medium">
                Request Demo
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 pb-20 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-8 text-left">
          <div className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/20 px-4 py-1.5 rounded-full text-xs font-semibold text-primary-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>
            <span>Next-Generation School ERP v2.0</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
            Streamline School Operations & <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-teal-400 to-blue-500">Student Safety</span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl">
            A comprehensive, modular workspace connecting Admins, Teachers, Parents, and Students. Features advanced academic records, optional smart bus routes, and NFC-based live tracking updates.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-medium bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 transition-all duration-300 shadow-xl hover:shadow-primary-500/20 flex items-center justify-center group">
              Access Portals <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-xl font-medium border border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition duration-300 flex items-center justify-center">
              Explore Features
            </a>
          </div>
        </div>

        {/* Interactive Dashboard Preview Widget */}
        <div className="lg:col-span-6 w-full">
          <div className="glass-panel rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex bg-slate-950/85 p-1 rounded-xl border border-white/5">
                <button 
                  onClick={() => setActivePreviewTab('admin')} 
                  className={`text-xs px-3.5 py-1.5 rounded-lg transition-all font-medium cursor-pointer ${activePreviewTab === 'admin' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Admin
                </button>
                <button 
                  onClick={() => setActivePreviewTab('teacher')} 
                  className={`text-xs px-3.5 py-1.5 rounded-lg transition-all font-medium cursor-pointer ${activePreviewTab === 'teacher' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Teacher
                </button>
                <button 
                  onClick={() => setActivePreviewTab('bus')} 
                  className={`text-xs px-3.5 py-1.5 rounded-lg transition-all font-medium cursor-pointer ${activePreviewTab === 'bus' ? 'bg-primary-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Bus/NFC
                </button>
              </div>
            </div>

            {/* Admin View */}
            {activePreviewTab === 'admin' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Revenue</p>
                    <p className="text-xl font-bold text-white mt-1">$48,250</p>
                    <span className="text-[10px] text-emerald-400 flex items-center mt-1">↑ 12% from last month</span>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Admissions</p>
                    <p className="text-xl font-bold text-white mt-1">1,248</p>
                    <span className="text-[10px] text-primary-400 flex items-center mt-1">Grade A rank</span>
                  </div>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300">Recent Action logs</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400 border-b border-white/5 pb-2">
                      <span>New Student Added (ID: #4092)</span>
                      <span className="text-slate-500">2m ago</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Term-1 Fees collected - grade 10B</span>
                      <span className="text-slate-500">15m ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Teacher View */}
            {activePreviewTab === 'teacher' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-primary-600/10 border border-primary-500/20 p-4 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <Calendar className="text-primary-400" size={20} />
                    <div>
                      <p className="text-xs text-slate-300 font-semibold">Class Attendance</p>
                      <p className="text-sm text-slate-400">Grade 10 - Section A</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">96.4% logged</span>
                </div>
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300">Pending Actions</h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <span>Grade Science Midterms</span>
                      </div>
                      <span className="text-amber-400 font-medium">Due Today</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        <span>Parent-Teacher Meet notes</span>
                      </div>
                      <span className="text-slate-500">Tomorrow</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bus/NFC View */}
            {activePreviewTab === 'bus' && (
              <div className="space-y-4">
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                      <Bus size={18} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Live Bus Tracker</p>
                      <p className="text-sm font-bold text-white">Route A-12 • Active</p>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
                    On Route
                  </span>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>NFC Swiping Logs</span>
                    <span className="text-[10px] text-slate-500 font-normal">Real-time GPS</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                      <span className="text-slate-300 font-medium">Aarav Patel (Grade 8)</span>
                      <span className="text-emerald-400 font-semibold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full">Boarded Bus (7:42 AM)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
                      <span className="text-slate-300 font-medium">Sneha Rao (Grade 10)</span>
                      <span className="text-emerald-400 font-semibold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded-full">Deboarded Bus (8:05 AM)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="border-y border-white/5 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-white">12,500+</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1.5">Active Students</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-primary-500">99.9%</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1.5">NFC Log Accuracy</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-white">45+</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1.5">Active Bus Routes</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-primary-500">98.5%</p>
            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1.5">Parent Satisfaction</p>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20 space-y-16">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-1.5 bg-primary-500/10 border border-primary-500/20 px-3 py-1 rounded-full text-xs font-semibold text-primary-500 uppercase tracking-wider">
            <span>Modular Architecture</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-wide">All School Modules Unified</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Everything your school administrators, teachers, parents, and students require in a structured dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Smart Transportation */}
          <div className="glass-panel p-8 rounded-3xl relative group hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between border border-white/5 hover:border-primary-500/20">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-all">
                <Bus size={24} />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-primary-450 transition-colors">School Bus & GPS Tracker</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Provide real-time tracking dashboard, ETA estimates for parent stops, driver routes dispatch, and automatic delayed notification alerts.
              </p>
            </div>
            <span className="text-amber-400 text-xs font-semibold mt-4 block">Optional Service module</span>
          </div>

          {/* Academics System */}
          <div className="glass-panel p-8 rounded-3xl relative group hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between border border-white/5 hover:border-primary-500/20">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 group-hover:bg-primary-500/20 transition-all">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-primary-450 transition-colors">Academics & Grading</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Streamline curriculums scheduling, exams grading structure, report cards generator, classroom assignments uploads, and syllabus monitoring.
              </p>
            </div>
            <span className="text-primary-500 text-xs font-semibold mt-4 block">Core ERP module</span>
          </div>

          {/* Multi-role isolation */}
          <div className="glass-panel p-8 rounded-3xl relative group hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between border border-white/5 hover:border-primary-500/20">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-all">
                <Shield size={24} />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-primary-450 transition-colors">Secure Role Isolation</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Data security with separate database tables for Admins, Teachers, Parents, and Students. Role-based guards prevent unauthorized data leaks.
              </p>
            </div>
            <span className="text-blue-400 text-xs font-semibold mt-4 block">Security certified</span>
          </div>

          {/* Parents App Portal */}
          <div className="glass-panel p-8 rounded-3xl relative group hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between border border-white/5 hover:border-primary-500/20">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-all">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-primary-450 transition-colors">Parent Connect Hub</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Keep parents updated on academic milestones, NFC tap-in events, fee dues notifications, and give them instant chatting pathways with class teachers.
              </p>
            </div>
            <span className="text-purple-400 text-xs font-semibold mt-4 block">Mobile responsive</span>
          </div>

          {/* Finance & Fees */}
          <div className="glass-panel p-8 rounded-3xl relative group hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between border border-white/5 hover:border-primary-500/20">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 transition-all">
                <DollarSign size={24} />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-primary-450 transition-colors">Admissions & Fees Pay</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Automate new online admissions workflow, generate custom fee schedules, accept online card payments, and email receipt logs dynamically.
              </p>
            </div>
            <span className="text-teal-400 text-xs font-semibold mt-4 block">Integrated payments</span>
          </div>

          {/* Quick Notifications */}
          <div className="glass-panel p-8 rounded-3xl relative group hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between border border-white/5 hover:border-primary-500/20">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:bg-rose-500/20 transition-all">
                <Bell size={24} />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-primary-450 transition-colors">Instant Alerts Engine</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Send emergency warnings, school calendar adjustments, homework reminders, or transport updates via automated dashboard SMS and push messages.
              </p>
            </div>
            <span className="text-rose-400 text-xs font-semibold mt-4 block">SMS & Push channels</span>
          </div>
        </div>
      </section>

      {/* NFC & Optional School Bus Service Deep-Dive */}
      <section id="transport" className="max-w-7xl mx-auto px-6 py-16 relative">
        <div className="glass-panel rounded-3xl p-8 md:p-12 border border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 rounded-full text-xs font-semibold text-amber-400 uppercase tracking-wide">
              <Bus size={14} className="mr-1.5" />
              <span>Smart RFID Bus Attendance</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white">Live Student Safety & Route Monitoring</h3>
            <p className="text-slate-400 leading-relaxed text-sm md:text-base">
              EduManage features a cutting-edge NFC system. Each student with the optional school bus service has their unique <code className="text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded text-xs">nfc_card_uid</code> tracked dynamically. 
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <CheckCircle size={18} className="text-emerald-400 mt-1 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Dynamic Bus Stops Routing</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Students are mapped to exact bus_route_id and bus_stop_id targets.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle size={18} className="text-emerald-400 mt-1 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Real-Time Swipe Alerts</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Instant alerts when students board (bus check-in) or deboard (bus check-out).</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle size={18} className="text-emerald-400 mt-1 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Optional Toggle Status</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Easily toggle the is_bus_service_enabled status on parent request.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle size={18} className="text-emerald-400 mt-1 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Gate Attendance Sync</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Dual-layer logging integrates both main school gate and bus scanner panels.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual representation of NFC check-in flow */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Live NFC Activity Stream</span>
                <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">ACTIVE SCANNER</span>
              </div>
              
              <div className="space-y-3">
                {/* Active scan item */}
                <div className="flex items-center space-x-3 bg-slate-950/80 p-3.5 rounded-xl border border-primary-500/30 shadow shadow-primary-500/5 relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-400 animate-ping absolute top-3.5 left-3"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 absolute top-4 left-4"></div>
                  <div className="pl-4">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">UID: 8F3C910B</p>
                    <p className="text-sm font-bold text-white">Rohan Verma (Grade 6)</p>
                    <p className="text-[10px] text-primary-500 font-medium mt-0.5 flex items-center">
                      <MapPin size={10} className="mr-1" /> Boarded Stop #12: Sector 5 (7:56 AM)
                    </p>
                  </div>
                </div>

                {/* Historical scans */}
                <div className="flex items-center space-x-3 bg-slate-950/40 p-3 rounded-xl border border-white/5 opacity-70">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">UID: 2D7B904A</p>
                    <p className="text-xs font-semibold text-slate-300">Ananya Sen (Grade 9)</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">Deboarded: School Main Gate (8:08 AM)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Portal Quick Links */}
      <section id="portals" className="max-w-7xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-wide">Portal Role Access Gateway</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Select your administrative role below to access the login terminal and customize your dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <PortalCard
            title="School Admin"
            desc="Manage enrollments, bus routes dispatch, collect fees, control configurations, and track staff activities."
          />
          <PortalCard
            title="Class Teacher"
            desc="Log daily class attendance, assign homeworks, submit midterms and finals marks, and message parents."
          />
          <PortalCard
            title="Parent / Guardian"
            desc="Track real-time bus locations, swipe notifications, download academic report cards, and pay fee bills."
          />
          <PortalCard
            title="Student Profile"
            desc="View schedules, submit homework assignments online, check exam timetables, and download materials."
          />
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-wide">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-sm">Have queries about setup, security, or transportation? Let us help.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="glass-panel rounded-2xl border border-white/5 overflow-hidden transition-all duration-300"
            >
              <button 
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left text-sm md:text-base font-bold text-white hover:bg-white/5 transition duration-300 cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown 
                  size={18} 
                  className={`text-slate-400 transition-transform duration-300 ${expandedFaq === index ? 'rotate-180 text-primary-500' : ''}`} 
                />
              </button>
              <div 
                className={`transition-all duration-300 ease-in-out ${expandedFaq === index ? 'max-h-60 border-t border-white/5 px-6 py-5' : 'max-h-0 overflow-hidden'}`}
              >
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Sales / Book Demo Form */}
      <section id="contact" className="max-w-4xl mx-auto px-6 py-20">
        <div className="glass-panel rounded-3xl p-8 md:p-12 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/5 rounded-bl-full pointer-events-none"></div>
          
          <div className="text-center space-y-4 mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white">Book a Demo / Consult Sales</h3>
            <p className="text-slate-400 text-xs md:text-sm max-w-lg mx-auto">
              Ready to digitize your campus operations? Fill out the details below, and our experts will reach out.
            </p>
          </div>

          {contactSubmitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-3">
              <CheckCircle size={40} className="text-emerald-400 mx-auto" />
              <h4 className="text-lg font-bold text-white">Inquiry Received Successfully!</h4>
              <p className="text-sm text-slate-400">Our representative will email you or call your office within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4 max-w-xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-300"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-300"
                    placeholder="john@school.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase">School Name</label>
                <input
                  type="text"
                  required
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-300"
                  placeholder="Greenwood International School"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Your Message</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-300 resize-none"
                  placeholder="How can we help your institution?"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl text-white font-medium bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 transition-all duration-300 shadow-lg hover:shadow-primary-500/20 active:scale-95 cursor-pointer"
              >
                Send Request
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950 py-16 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-primary-650 flex items-center justify-center">
                <BookOpen size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold tracking-wider text-white">EduManage</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              EduManage is a premium comprehensive School ERP and Safety Monitoring platform. Providing secure database architectures and real-time NFC student tracking logistics.
            </p>
          </div>

          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Navigation</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <a href="#features" className="block hover:text-white transition">Features</a>
              <a href="#transport" className="block hover:text-white transition">Smart Transport</a>
              <a href="#portals" className="block hover:text-white transition">Gateway Portals</a>
              <a href="#faq" className="block hover:text-white transition">FAQ Support</a>
            </div>
          </div>

          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Contact Office</h4>
            <div className="space-y-3 text-xs text-slate-400">
              <p className="flex items-center"><MapPin size={14} className="mr-2 text-primary-500 shrink-0" /> 102 Sector-5, Tech Hub Central, City</p>
              <p className="flex items-center"><Phone size={14} className="mr-2 text-primary-500 shrink-0" /> +1 (555) 019-2834</p>
              <p className="flex items-center"><Mail size={14} className="mr-2 text-primary-500 shrink-0" /> sales@edumanage.com</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 text-center text-xs text-slate-500">
          <p>© 2026 EduManage Inc. All rights reserved. Built with Next.js & Tailwind CSS v4.</p>
        </div>
      </footer>
    </div>
  );
}

function PortalCard({ title, desc }) {
  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border border-white/5 hover:border-primary-500/20 transition-all duration-300">
      <div className="space-y-3">
        <h4 className="text-base font-bold text-white">{title}</h4>
        <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
      </div>
      <Link 
        href="/login" 
        className="mt-6 py-2 px-4 rounded-xl text-center text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-slate-300 transition-all flex items-center justify-center group cursor-pointer"
      >
        Login Portal <ArrowRight size={12} className="ml-1.5 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}
