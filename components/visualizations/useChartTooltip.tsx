import React, { useRef } from 'react';

export const useChartTooltip = () => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  const show = (html: string, event: MouseEvent | React.MouseEvent) => {
    if (!tooltipRef.current) return;
    const t = tooltipRef.current;
    t.innerHTML = html;
    t.style.opacity = '1';
    
    // Position relative to cursor
    t.style.left = `${(event as any).offsetX + 12}px`;
    t.style.top  = `${(event as any).offsetY - 8}px`;
  };

  const hide = () => {
    if (tooltipRef.current) {
      tooltipRef.current.style.opacity = '0';
    }
  };

  const TooltipDiv = () => (
    <div 
      ref={tooltipRef} 
      style={{
        position: 'absolute', 
        opacity: 0, 
        pointerEvents: 'none',
        transition: 'opacity 0.15s ease, left 0.05s ease, top 0.05s ease',
        background: 'rgba(255,255,255,0.96)',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: '12px', 
        padding: '10px 14px',
        fontSize: '12px', 
        color: '#0F172A',
        fontFamily: 'Inter, sans-serif',
        backdropFilter: 'blur(10px)', 
        zIndex: 50,
        maxWidth: '240px', 
        lineHeight: '1.6',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
      }} 
    />
  );

  return { show, hide, TooltipDiv };
};
