'use client';

export default function TeacherFooter({ schoolName }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white px-4 sm:px-8 py-4 text-center text-xs text-slate-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <p>© {year} {schoolName}. All rights reserved.</p>
        <p className="text-[11px] text-slate-400">Teacher Management Workspace</p>
      </div>
    </footer>
  );
}
