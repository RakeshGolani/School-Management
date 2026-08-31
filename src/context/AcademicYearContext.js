'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { getAcademicYearsAction } from '@/actions/school/academicYearActions';

const AcademicYearContext = createContext(null);

export function AcademicYearProvider({ children }) {
  const [academicYears, setAcademicYears] = useState([]);
  const [activeYear, setActiveYear] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      const data = await getAcademicYearsAction();
      
      if (data.success && Array.isArray(data.data)) {
        setAcademicYears(data.data);
        
        // Find saved active year or default active year
        const savedYearId = typeof window !== 'undefined' ? localStorage.getItem('selected_academic_year_id') : null;
        let selected = null;
        
        if (savedYearId) {
          selected = data.data.find(y => y.id.toString() === savedYearId.toString());
        }
        
        if (!selected) {
          selected = data.data.find(y => y.is_active) || data.data[0] || null;
        }

        setActiveYear(selected);
      }
    } catch (err) {
      console.error('Failed to fetch academic years in context:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const changeActiveYear = (year) => {
    setActiveYear(year);
    if (year && typeof window !== 'undefined') {
      localStorage.setItem('selected_academic_year_id', year.id.toString());
      window.dispatchEvent(new CustomEvent('academicYearChanged', { detail: year }));
    }
  };

  return (
    <AcademicYearContext.Provider
      value={{
        academicYears,
        activeYear,
        loading,
        fetchAcademicYears,
        changeActiveYear
      }}
    >
      {children}
    </AcademicYearContext.Provider>
  );
}

export function useAcademicYear() {
  const context = useContext(AcademicYearContext);
  if (!context) {
    return {
      academicYears: [],
      activeYear: null,
      loading: false,
      fetchAcademicYears: () => {},
      changeActiveYear: () => {}
    };
  }
  return context;
}
