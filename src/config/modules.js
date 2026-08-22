/**
 * Central System Modules Registry (School Portal)
 */

export const SYSTEM_MODULES = [
  {
    key: 'students',
    label: 'Students',
    icon: 'Users',
    path: '/students',
    description: 'Student profiles, parent contact & NFC IDs',
    isCore: true
  },
  {
    key: 'transport',
    label: 'Smart Bus',
    icon: 'Bus',
    path: '/transport',
    description: 'Fleet GPS live tracking, routes, stops, and bus NFC driver logs'
  },
  {
    key: 'academics',
    label: 'Classes & Sections',
    icon: 'BookOpen',
    path: '/classes',
    description: 'Classes, sections, and class teacher allocations'
  },
  {
    key: 'teachers',
    label: 'Teachers',
    icon: 'GraduationCap',
    path: '/teachers',
    description: 'Faculty profiles and workload assignments'
  },
  {
    key: 'attendance',
    label: 'Attendance',
    icon: 'Calendar',
    path: '/attendance',
    description: 'Daily classroom attendance logs and NFC access'
  },
  {
    key: 'timetable',
    label: 'Timetable & Periods',
    icon: 'Clock',
    path: '/timetable',
    description: 'Class-wise master timetable grid and substitute proxies'
  },
  {
    key: 'fees',
    label: 'Student Fees',
    icon: 'Landmark',
    path: '/fees',
    description: 'Fee categories, invoices, allocations, and payment tracking'
  },
  {
    key: 'academic_years',
    label: 'Academic Year',
    icon: 'CalendarDays',
    path: '/academic-years',
    description: 'Session terms and academic calendar'
  }
];

export const getModuleInfo = (key) => {
  return SYSTEM_MODULES.find(m => m.key === key) || { key, label: key, icon: 'Layers' };
};
