import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

export function useUrlFilters<T extends Record<string, string>>(defaults: T) {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {} as T;
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    filters[key] = (searchParams.get(key as string) ?? defaults[key]) as T[keyof T];
  }

  const setFilter = useCallback((key: keyof T, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === '' || value === defaults[key]) {
        next.delete(key as string);
      } else {
        next.set(key as string, value);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams, defaults]);

  return { filters, setFilter };
}
