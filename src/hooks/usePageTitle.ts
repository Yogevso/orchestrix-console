import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} · Orchestrix` : 'Orchestrix Console';
    return () => { document.title = prev; };
  }, [title]);
}
