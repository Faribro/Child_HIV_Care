// components/auth/AuthShell.tsx
'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { Activity, Shield, Database, Globe, Lock, Wifi } from 'lucide-react';

/* ── tiny animated grid-dot background ── */
const GridPattern: React.FC = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-[0.035]"
    xmlns="http://www.w3.org/2000/svg"
    style={{ pointerEvents: 'none' }}
  >
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);

/* ── animated floating orb ── */
const Orb: React.FC<{
  className: string;
  delay?: number;
}> = ({ className, delay = 0 }) => (
  <motion.div
    className={`absolute rounded-full blur-[100px] pointer-events-none ${className}`}
    animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.9, 0.6] }}
    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

/* ── Stat badge ── */
const StatBadge: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}> = ({ icon, label, value, color }) => (
  <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border bg-zinc-950/60 backdrop-blur-sm ${color}`}>
    <span className="flex-shrink-0">{icon}</span>
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider leading-none">{label}</span>
      <span className="text-xs text-zinc-200 font-bold font-mono leading-tight mt-0.5">{value}</span>
    </div>
  </div>
);

/* ── Feature pill ── */
const FeaturePill: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
    <span className="text-zinc-600">{icon}</span>
    {text}
  </div>
);

export const AuthShell: React.FC = () => {
  const [mode, setMode] = React.useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen w-full flex items-stretch bg-zinc-950 relative overflow-hidden">
      {/* Background layers */}
      <GridPattern />
      <Orb className="w-[600px] h-[600px] bg-blue-700/20 top-[-100px] right-[-100px]" delay={0} />
      <Orb className="w-[500px] h-[500px] bg-emerald-700/12 bottom-[-80px] left-[-80px]" delay={3} />
      <Orb className="w-[300px] h-[300px] bg-indigo-700/12 top-[40%] left-[15%]" delay={5} />

      {/* ─── Left Panel: Brand + Feature Showcase ─── */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-12 relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3.5"
        >
          <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg p-1.5 flex-shrink-0">
            <Image
              src="/alliance-india-logo.png"
              alt="Alliance India Logo"
              width={34}
              height={34}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-white tracking-tight leading-none">MPAC Dashboard</span>
            <span className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase mt-0.5">Alliance India</span>
          </div>
        </motion.div>

        {/* Hero Text */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex flex-col gap-6 max-w-lg"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-6 bg-blue-500 rounded-full" />
              <span className="text-xs text-blue-400 font-bold uppercase tracking-widest">Model Paperless ART Centre</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.1] tracking-tight">
              Equipment &<br />
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Staffing Intelligence
              </span>
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
              A centralised command centre for tracking equipment,
              staffing, and PLHIV metrics across 500+ ART Centres
              nationwide under the National AIDS Control Programme.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatBadge
              icon={<Shield className="w-4 h-4 text-blue-400" />}
              label="Data Protection"
              value="HMAC-256 Signed"
              color="border-blue-900/40"
            />
            <StatBadge
              icon={<Database className="w-4 h-4 text-emerald-400" />}
              label="Data Source"
              value="Google Sheets API"
              color="border-emerald-900/40"
            />
            <StatBadge
              icon={<Globe className="w-4 h-4 text-indigo-400" />}
              label="Coverage"
              value="29 States / UTs"
              color="border-indigo-900/40"
            />
            <StatBadge
              icon={<Wifi className="w-4 h-4 text-blue-400" />}
              label="Availability"
              value="Offline Capable"
              color="border-blue-900/40"
            />
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 border-t border-zinc-800">
            <FeaturePill icon={<Lock className="w-3 h-3" />} text="Role-Based Access Control" />
            <FeaturePill icon={<Activity className="w-3 h-3" />} text="Real-time Sync" />
            <FeaturePill icon={<Database className="w-3 h-3" />} text="Offline-First PWA" />
            <FeaturePill icon={<Shield className="w-3 h-3" />} text="Audit Trail Logging" />
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-[10px] text-zinc-650 font-medium"
        >
          © 2026 <span className="text-zinc-550 font-bold">Alliance India</span> · HIV/TB Programme · NACP Supported · v1.2.0
        </motion.p>
      </div>

      {/* ─── Vertical Divider ─── */}
      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-zinc-800 to-transparent flex-shrink-0 relative z-10" />

      {/* ─── Right Panel: Auth Form ─── */}
      <div className="w-full lg:w-[460px] xl:w-[520px] flex-shrink-0 flex flex-col items-center justify-center px-6 py-10 md:px-10 lg:px-12 relative z-10">
        {/* Mobile logo (only on small screens) */}
        <div className="flex lg:hidden flex-col items-center gap-2 mb-8 select-none">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg p-1.5">
            <Image src="/alliance-india-logo.png" alt="Alliance India Logo" width={40} height={40} className="object-contain" />
          </div>
          <h1 className="text-lg font-extrabold text-white tracking-tight mt-1">MPAC Dashboard</h1>
          <p className="text-[11px] text-zinc-500 font-medium">Alliance India · Model Paperless ART Centre</p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full max-w-[420px] bg-zinc-900/70 border border-zinc-800/80 rounded-2xl shadow-2xl shadow-black/40 backdrop-blur-sm overflow-hidden"
        >
          {/* Mode Tab switcher */}
          <div className="flex border-b border-zinc-800">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-widest transition-all duration-200 select-none ${
                  mode === m
                    ? 'text-white bg-blue-600/15 border-b-2 border-blue-500'
                    : 'text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Request Access'}
              </button>
            ))}
          </div>

          {/* Form area */}
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                >
                  <LoginForm onSwitchToSignup={() => setMode('signup')} />
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <SignupForm onSwitchToLogin={() => setMode('login')} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Secured by footer */}
          <div className="px-6 pb-5 flex items-center justify-center gap-2 select-none">
            <Lock className="w-3 h-3 text-zinc-600" />
            <span className="text-[10px] text-zinc-600 font-medium">
              Secured with HMAC-256 · All sessions encrypted
            </span>
          </div>
        </motion.div>

        {/* Bottom text (desktop only) */}
        <p className="mt-6 text-[10px] text-zinc-600 text-center hidden lg:block">
          Authorised personnel only · Unauthorised access attempts are logged
        </p>
      </div>
    </div>
  );
};

AuthShell.displayName = 'AuthShell';
export default AuthShell;
