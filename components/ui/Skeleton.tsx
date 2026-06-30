// components/ui/Skeleton.tsx
import * as React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  ...props
}) => {
  const shapes = {
    text: 'h-4 w-full rounded',
    rect: 'h-full w-full rounded-lg',
    circle: 'rounded-full aspect-square',
  };

  return (
    <div
      className={`animate-pulse bg-zinc-800/60 ${shapes[variant]} ${className}`}
      {...props}
    />
  );
};

export const KPICardSkeleton: React.FC = () => (
  <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-5 flex flex-col gap-3 h-[110px]">
    <Skeleton variant="text" className="w-1/3 h-3 bg-zinc-800" />
    <div className="flex items-baseline justify-between mt-1">
      <Skeleton variant="text" className="w-1/2 h-8 bg-zinc-800" />
      <Skeleton variant="text" className="w-1/5 h-4 bg-zinc-800" />
    </div>
  </div>
);

export const MapSkeleton: React.FC = () => (
  <div className="relative w-full h-full min-h-[400px] bg-zinc-900 border border-zinc-800/80 rounded-xl overflow-hidden flex items-center justify-center">
    <div className="absolute inset-0 bg-radial-gradient from-zinc-800/20 to-transparent pointer-events-none" />
    <div className="flex flex-col items-center gap-3">
      <Skeleton variant="circle" className="w-12 h-12 bg-zinc-800" />
      <Skeleton variant="text" className="w-48 h-3 bg-zinc-800" />
      <Skeleton variant="text" className="w-32 h-2.5 bg-zinc-800" />
    </div>
  </div>
);

export const TableSkeleton: React.FC = () => (
  <div className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl overflow-hidden flex flex-col gap-4 p-5">
    <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
      <Skeleton variant="text" className="w-1/4 h-5 bg-zinc-800" />
      <div className="flex gap-2 w-1/3 justify-end">
        <Skeleton variant="text" className="w-24 h-8 bg-zinc-800" />
        <Skeleton variant="text" className="w-24 h-8 bg-zinc-800" />
      </div>
    </div>
    <div className="flex flex-col gap-3.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <Skeleton variant="text" className="w-[12%] h-4 bg-zinc-800" />
          <Skeleton variant="text" className="w-[20%] h-4 bg-zinc-800" />
          <Skeleton variant="text" className="w-[28%] h-4 bg-zinc-800" />
          <Skeleton variant="text" className="w-[15%] h-4 bg-zinc-800" />
          <Skeleton variant="text" className="w-[15%] h-4 bg-zinc-800" />
          <Skeleton variant="text" className="w-[10%] h-4 bg-zinc-800" />
        </div>
      ))}
    </div>
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="w-full h-[320px] bg-zinc-900 border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between">
    <div className="flex justify-between items-center mb-4">
      <Skeleton variant="text" className="w-1/3 h-4 bg-zinc-800" />
      <Skeleton variant="text" className="w-16 h-3 bg-zinc-800" />
    </div>
    <div className="flex items-end gap-3 h-full pb-2 px-2">
      {Array.from({ length: 12 }).map((_, i) => {
        const heights = ['h-[30%]', 'h-[50%]', 'h-[75%]', 'h-[40%]', 'h-[60%]', 'h-[90%]', 'h-[45%]', 'h-[65%]', 'h-[80%]', 'h-[35%]', 'h-[55%]', 'h-[70%]'];
        return <Skeleton key={i} variant="rect" className={`w-full ${heights[i]} bg-zinc-800/60`} />;
      })}
    </div>
  </div>
);
