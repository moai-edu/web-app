// components/ScrollHandler.tsx
'use client';

import { UpArrowSvg } from '@/components/Svgs';
import { useEffect, useState } from 'react';

export function ScrollHandler() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const updateScrollY = () => setScrollY(globalThis.scrollY ?? scrollY);
    updateScrollY();
    document.addEventListener('scroll', updateScrollY);
    return () => document.removeEventListener('scroll', updateScrollY);
  }, [scrollY]);

  return (
    <>
      {scrollY > 100 && (
        <button
          className="absolute right-4 flex h-14 w-14 items-center justify-center self-end rounded-2xl border-2 border-b-4 border-gray-200 bg-white transition hover:bg-gray-50 hover:brightness-90 md:right-0"
          onClick={() => scrollTo(0, 0)}
        >
          <span className="sr-only">Jump to top</span>
          <UpArrowSvg />
        </button>
      )}
    </>
  );
}