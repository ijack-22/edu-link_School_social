import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export interface ClassInfo {
  id: string;
  name: string;
  teacher: string;
  room: string;
  students: number;
}

/**
 * Hook to fetch classes for the logged‑in user.
 */
export const useClasses = () => {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchClasses = async () => {
      try {
        const response = await apiClient.get('academics/classes/');
        if (isMounted) setClasses(response.data);
      } catch (err: any) {
        if (isMounted) setError(err.response?.data?.detail || 'Failed to load classes');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchClasses();
    return () => {
      isMounted = false;
    };
  }, []);

  return { classes, loading, error };
};
