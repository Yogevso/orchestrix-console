import { useState, useEffect, useCallback } from 'react';

export function useKeyboardNav(itemCount: number, onSelect: (index: number) => void) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    switch (e.key) {
      case 'j':
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, itemCount - 1));
        break;
      case 'k':
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        if (activeIndex >= 0 && activeIndex < itemCount) {
          e.preventDefault();
          onSelect(activeIndex);
        }
        break;
      case 'Escape':
        setActiveIndex(-1);
        break;
    }
  }, [itemCount, activeIndex, onSelect]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (activeIndex >= 0) {
      const row = document.querySelector(`[data-row-index="${activeIndex}"]`);
      row?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeIndex]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [itemCount]);

  return { activeIndex, setActiveIndex };
}
