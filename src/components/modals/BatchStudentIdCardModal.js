'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, School, CreditCard } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAcademicYear } from '@/context/AcademicYearContext';
import StudentIdCard from '@/components/ui/StudentIdCard';

export default function BatchStudentIdCardModal({ isOpen, onClose, students, classData, teacher, schoolInfo }) {
  if (!isOpen || !Array.isArray(students) || students.length === 0) return null;

  const { activeYear } = useAcademicYear();

  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const StudentIdCardsPdfDocument = (await import('./StudentIdCardsPdfDocument')).default;
      
      const blob = await pdf(
        <StudentIdCardsPdfDocument 
          students={students} 
          classData={classData} 
          teacher={teacher} 
          schoolInfo={schoolInfo} 
          academicYear={activeYear}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `students_id_cards_${(classData?.class_name || 'class').replace(/\s+/g, '_')}.pdf`;
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
      {/* batch CSS print styles */}
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
          /* Make sure the modal background, scrollable wrappers, and target content are visible */
          .fixed.inset-0, .max-w-4xl, .flex-1, #print-batch-ids-container, #print-batch-ids-container * {
            visibility: visible !important;
            overflow: visible !important;
          }
          #print-batch-ids-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            z-index: 99999 !important;
            display: block !important;
            background: #ffffff !important;
          }
          .printable-id-badge-item {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            width: 320px !important;
            margin: 0 auto !important;
          }
          .print-page-wrapper {
            width: 100% !important;
            height: 297mm !important; /* Force A4 height per card */
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important; /* Vertically center */
            align-items: center !important; /* Horizontally center */
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: always !important;
            break-after: page !important;
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }
          @page {
            size: A4 portrait !important;
            margin: 0 !important;
          }
        }
        /* CSS classes for HTML2PDF execution wrapper */
        @media print {
          .html2pdf-page {
            width: 210mm;
            height: 297mm;
            display: flex;
            align-items: center;
            justify-content: center;
            page-break-after: always;
            box-sizing: border-box;
            background: #ffffff;
          }
        }
      `}</style>

      {/* Modal Container */}
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col p-6 space-y-6 animate-scaleUp relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary-600" />
              <span>Batch Student ID Cards Preview ({students.length} Students)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Print cards for class {classData?.class_name || 'selected class'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 dark:bg-slate-800 cursor-pointer transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Preview Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center py-2 bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800" id="print-batch-ids-container">
            {students.map((st) => (
              <StudentIdCard key={st.id} student={st} schoolInfo={schoolInfo} activeYear={activeYear} teacher={teacher} containerId={`batch-card-${st.id}`} />
            ))}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <Button variant="secondary" onClick={onClose} disabled={downloading}>
            Close
          </Button>
          <Button variant="primary" icon={Printer} onClick={handleDownloadPDF} disabled={downloading}>
            {downloading ? 'Downloading PDF...' : 'Download ID Cards PDF'}
          </Button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
