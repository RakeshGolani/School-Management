'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Printer, 
  School, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Bus, 
  CreditCard,
  CheckCircle2,
  GraduationCap,
  BookOpen,
  User
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { notifyError } from '@/lib/notify';
import { useAcademicYear } from '@/context/AcademicYearContext';
import StudentIdCard from '@/components/ui/StudentIdCard';

export default function StudentIdCardPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params?.id;
  const { activeYear } = useAcademicYear();

  const [student, setStudent] = useState(null);
  const [schoolInfo, setSchoolInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!student) return;
    setDownloading(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const StudentIdCardsPdfDocument = (await import('@/components/modals/StudentIdCardsPdfDocument')).default;
      
      const blob = await pdf(
        <StudentIdCardsPdfDocument 
          students={[student]} 
          classData={student.schoolClass} 
          teacher={student.schoolClass?.classTeacher} 
          schoolInfo={schoolInfo} 
          academicYear={activeYear}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `student_id_card_${(`${student.first_name || ''}_${student.last_name || ''}`).replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (!studentId) return;

    const fetchStudentAndSchool = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiUrl}/students/${studentId}`, { cache: 'no-store' });
        const resData = await res.json();
        const info = resData.data || resData;

        if (info && (info.id || info.first_name)) {
          setStudent(info);

          // Fetch School Profile for Logo & School Name
          const targetSchoolId = info.school_id || info.schoolId || 1;
          const schoolRes = await fetch(`${apiUrl}/school/profile?schoolId=${targetSchoolId}`, { cache: 'no-store' });
          const schoolData = await schoolRes.json();
          if (schoolData.success && schoolData.data) {
            setSchoolInfo(schoolData.data);
          }
        } else {
          notifyError(resData.message || 'Student profile not found');
        }
      } catch (err) {
        console.error('Error loading student for ID card:', err);
        notifyError('Failed to load student details for ID Card');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAndSchool();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Student Not Found</h2>
        <p className="text-slate-500 text-sm mt-1 mb-4">Cannot generate ID Card for missing student record.</p>
        <Button onClick={() => router.push('/students')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Students
        </Button>
      </div>
    );
  }

  const fullName = `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Student Name';
  const className = student.schoolClass 
    ? `${student.schoolClass.class_name} - ${student.schoolClass.section}`
    : (student.grade ? `Grade ${student.grade}` : 'Class N/A');
  const classTeacher = student.schoolClass?.classTeacher;
  const schoolLogo = schoolInfo?.logo;
  const schoolName = schoolInfo?.schoolName || schoolInfo?.name || 'Greenwood International School';

  return (
    <div className="space-y-6 pb-16">
      {/* CSS Print Styles for Exact Standard CR80 ID Card Dimensions (85.6mm x 53.98mm) */}
      <style jsx global>{`
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-id-card-container, #printable-id-card-container * {
            visibility: visible !important;
          }
          #printable-id-card-container {
            position: fixed !important;
            left: 50% !important;
            top: 20px !important;
            transform: translateX(-50%) !important;
            width: auto !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            z-index: 99999 !important;
          }
          #printable-id-card-container .w-\\[320px\\] {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
          }
          @page {
            size: 54mm 86mm portrait;
            margin: 0;
          }
        }
      `}</style>

      {/* Top Controls Header */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={() => router.push(`/students/${studentId}`)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </button>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            icon={Printer} 
            onClick={() => window.print()}
            disabled={downloading}
          >
            Print ID Card Now
          </Button>
          <Button 
            variant="primary" 
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="shadow-md"
          >
            {downloading ? 'Downloading PDF...' : 'Download PDF'}
          </Button>
        </div>
      </div>

      {/* ID Card Display Stage */}
      <StudentIdCard student={student} schoolInfo={schoolInfo} activeYear={activeYear} containerId="printable-id-card-container" />
    </div>
  );
}

