'use client';
import { useState, useEffect } from 'react';
import { 
  Users, 
  Bus, 
  GraduationCap, 
  Activity, 
  CheckCircle2, 
  Bell, 
  Search, 
  Plus, 
  Sliders, 
  Radio as RadioIcon 
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import Switch from '@/components/ui/Switch';
import Select from '@/components/ui/Select';
import { RadioGroup } from '@/components/ui/Radio';

/**
 * Dashboard Overview Page
 * Showcases statistics, active modules, and dynamic UI control primitives.
 */
export default function Dashboard() {
  const [health, setHealth] = useState({ status: 'Connecting...', message: '' });
  
  // Interactive UI Form states
  const [studentSearch, setStudentSearch] = useState('');
  const [busServiceEnabled, setBusServiceEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState('10');
  const [selectedRoleOption, setSelectedRoleOption] = useState('student');
  const [autoSmsChecked, setAutoSmsChecked] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${apiUrl}/health`)
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch(() => setHealth({ status: 'Error', message: 'Backend is offline' }));
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome Card */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Badge variant="emerald" dot>Campus Online</Badge>
            <Badge variant="primary">Greenwood Intl</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">School Management Workspace</h1>
          <p className="text-slate-400 text-xs md:text-sm max-w-xl leading-relaxed">
            Welcome back, School Admin. Monitor your live student NFC logs, bus transport alerts, and academic operations.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Button variant="secondary" icon={Sliders}>
            Configure
          </Button>
          <Button variant="primary" icon={Plus}>
            New Admission
          </Button>
        </div>
      </div>

      {/* Overview Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total Students" icon={Users} action={<Badge variant="emerald">+12%</Badge>}>
          <p className="text-3xl font-black text-white">1,248</p>
          <p className="text-xs text-slate-400 mt-1">98.2% Daily Gate Attendance</p>
        </Card>

        <Card title="Smart Bus Routes" icon={Bus} action={<Badge variant="amber" dot font-bold>Active</Badge>}>
          <p className="text-3xl font-black text-white">14 Routes</p>
          <p className="text-xs text-amber-400 mt-1">324 NFC Cards Swiped Today</p>
        </Card>

        <Card title="Certified Staff" icon={GraduationCap} action={<Badge variant="blue">Full Staff</Badge>}>
          <p className="text-3xl font-black text-white">86 Teachers</p>
          <p className="text-xs text-slate-400 mt-1">Grade 5-A & 10-B active</p>
        </Card>

        <Card title="Backend API Health" icon={Activity} action={<Badge variant={health.status === 'healthy' ? 'emerald' : 'rose'}>{health.status}</Badge>}>
          <p className="text-sm font-semibold text-white truncate">{health.message || 'Express Node backend'}</p>
          <p className="text-[10px] text-slate-500 mt-1">Port 5000 Connected</p>
        </Card>
      </div>

      {/* Dynamic UI Primitives Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          <Card title="Campus Settings & Quick Form Controls" icon={Sliders} subtitle="Test the newly built dynamic input components">
            <div className="space-y-5">
              {/* Input Primitive */}
              <Input
                label="Student Search & Filter"
                placeholder="Type student name or NFC UID (e.g. 8F3C910B)..."
                icon={Search}
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />

              {/* Select Dropdown Primitive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Grade Filter"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  options={[
                    { label: 'Grade 8 - Primary', value: '8' },
                    { label: 'Grade 9 - Junior High', value: '9' },
                    { label: 'Grade 10 - Secondary', value: '10' },
                    { label: 'Grade 11 - Senior High', value: '11' }
                  ]}
                />

                {/* Switch Primitive */}
                <div className="flex items-center pt-4">
                  <Switch
                    label="Optional Bus Service"
                    description="Enable live GPS & NFC tracking"
                    checked={busServiceEnabled}
                    onChange={setBusServiceEnabled}
                  />
                </div>
              </div>

              <hr className="border-white/5 my-2" />

              {/* Radio Group Primitive */}
              <RadioGroup
                label="Select Access Category"
                value={selectedRoleOption}
                onChange={setSelectedRoleOption}
                options={[
                  { label: 'Student Profile', value: 'student', description: 'NFC card UID enabled' },
                  { label: 'Class Teacher', value: 'teacher', description: 'Attendance logging rights' },
                  { label: 'Parent Account', value: 'parent', description: 'Bus stop SMS notifications' }
                ]}
              />

              <hr className="border-white/5 my-2" />

              {/* Checkbox Primitives */}
              <div className="space-y-3">
                <Checkbox
                  label="Automated SMS Check-in Alerts"
                  description="Send instant parent SMS when student scans NFC card"
                  checked={autoSmsChecked}
                  onChange={(e) => setAutoSmsChecked(e.target.checked)}
                />
                <Checkbox
                  label="Enable Live Notifications"
                  description="Push delayed bus notifications"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Live NFC Activity Feed */}
        <div className="lg:col-span-5 space-y-6">
          <Card title="Live NFC Attendance Feed" icon={RadioIcon} subtitle="Gate & Bus Terminal Stream">
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-primary-500/30 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">UID: 8F3C910B</p>
                  <p className="text-sm font-bold text-white">Rahul Gupta (Grade 5-A)</p>
                  <p className="text-[10px] text-primary-400">Stop #2: Kandivali (7:42 AM)</p>
                </div>
                <Badge variant="emerald">Boarded</Badge>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/40 border border-white/5 flex items-center justify-between opacity-80">
                <div>
                  <p className="text-xs text-slate-500 font-semibold">UID: 2D7B904A</p>
                  <p className="text-xs font-bold text-slate-300">Priya Patel (Grade 5-A)</p>
                  <p className="text-[10px] text-slate-500">School Gate scanner (8:05 AM)</p>
                </div>
                <Badge variant="slate">Gate Entry</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
