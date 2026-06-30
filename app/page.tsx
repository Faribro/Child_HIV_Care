// app/page.tsx
'use client';

import * as React from 'react';
import { useStore } from '@/lib/store';
import { AuthShell } from '@/components/auth/AuthShell';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function Home() {
  const user = useStore((s) => s.user);
  const authLoading = useStore((s) => s.authLoading);
  const checkSession = useStore((s) => s.checkSession);
  const setTheme = useStore((s) => s.setTheme);

  React.useEffect(() => {
    // Check and resume cookie session on load
    checkSession();
  }, [checkSession]);

  React.useEffect(() => {
    if (user) {
      const savedTheme = (localStorage.getItem('mpac_dashboard_theme') as any) || 'dark';
      setTheme(savedTheme);
    } else {
      // Force dark mode on login screen
      document.body.classList.remove('theme-classic', 'theme-emerald');
      document.body.classList.add('theme-dark');
    }
  }, [user, setTheme]);

  // Render a premium shimmer/loader console while checking sessions
  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-900 via-black to-zinc-950 px-4 select-none">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-650/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-emerald-650/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="z-10 flex flex-col items-center text-center gap-4">
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl flex items-center justify-center text-blue-500 animate-pulse">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-sm font-bold text-white tracking-widest uppercase">MPAC Dashboard</h1>
            <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">
              Decrypting Handshake Signature...
            </p>
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-zinc-600 mt-2" />
        </div>
      </div>
    );
  }

  // Session Guard: Switch between Auth and main Dashboard shell
  if (!user) {
    return <AuthShell />;
  }

  return <DashboardShell />;
}
