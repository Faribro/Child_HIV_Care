// app/page.tsx
'use client';

import * as React from 'react';
import { useStore } from '@/lib/store';
import { LoginForm } from '@/components/auth/LoginForm';
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
  }, []);

  React.useEffect(() => {
    if (user) {
      const savedTheme = (localStorage.getItem('childcare_dashboard_theme') as any) || 'dark';
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
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#071310] px-4 select-none relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[90px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[90px] pointer-events-none animate-pulse" />

        <div className="z-10 flex flex-col items-center text-center gap-4">
          <div className="p-3 bg-black/40 border border-blue-500/20 rounded-2xl shadow-xl flex items-center justify-center text-blue-400 animate-bounce">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-sm font-bold text-blue-200 tracking-widest uppercase">Childcare Dashboard</h1>
            <p className="text-[10px] text-blue-400/70 font-semibold uppercase tracking-wide">
              Decrypting Handshake Signature...
            </p>
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-blue-550 mt-2" />
        </div>
      </div>
    );
  }

  // Session Guard: Switch between Auth and main Dashboard shell
  if (!user) {
    return <LoginForm />;
  }

  return <DashboardShell />;
}
