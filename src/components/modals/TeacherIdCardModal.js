'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Printer, 
  School, 
  CheckCircle2, 
  GraduationCap,
  Award,
  BookOpen
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAcademicYear } from '@/context/AcademicYearContext';
import TeacherIdCard from '@/components/ui/TeacherIdCard';

export default function TeacherIdCardModal({ isOpen, onClose, teacher, schoolInfo }) {
  if (!isOpen || !teacher) return null;

  const fullName = teacher.name || `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || 'Teacher Name';
  const schoolLogo = schoolInfo?.logo;
  const schoolName = schoolInfo?.schoolName || schoolInfo?.name || 'Greenwood International School';
  const subject = teacher.subject || 'Faculty Member';
  const { activeYear } = useAcademicYear();
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const TeacherIdCardPdfDocument = (await import('./TeacherIdCardPdfDocument')).default;
      
      const blob = await pdf(
        <TeacherIdCardPdfDocument 
          teacher={teacher} 
          schoolInfo={schoolInfo} 
          academicYear={activeYear}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `teacher_id_card_${fullName.replace(/\s+/g, '_')}.pdf`;
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

  const modalContent = (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* CSS Print Styles for Exact Teacher ID Card Printing */}
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
          #teacher-modal-id-card-printable, #teacher-modal-id-card-printable * {
            visibility: visible !important;
          }
          #teacher-modal-id-card-printable {
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
          #teacher-modal-id-card-printable .w-\\[320px\\] {
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

      {/* Modal Dialog Card */}
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-6 animate-scaleUp relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary-600" />
              <span>Teacher ID Card Preview</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Faculty identity credential badge</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 dark:bg-slate-800 cursor-pointer transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Printable Teacher ID Card Container */}
        <TeacherIdCard teacher={teacher} schoolInfo={schoolInfo} activeYear={activeYear} containerId="teacher-modal-id-card-printable" />

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" onClick={onClose} disabled={downloading}>
            Close
          </Button>
          <Button variant="outline" icon={Printer} onClick={() => window.print()} disabled={downloading}>
            Print ID Card
          </Button>
          <Button variant="primary" onClick={handleDownloadPDF} disabled={downloading}>
            {downloading ? 'Downloading PDF...' : 'Download PDF'}
          </Button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
