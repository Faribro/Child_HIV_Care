import { useRef, useState, useEffect } from 'react';

export const useResizeObserver = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(300);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect) {
        setWidth(entry.contentRect.width || 600);
        setHeight(entry.contentRect.height || 300);
      }
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return { ref, width, height };
};
