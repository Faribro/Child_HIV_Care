// components/dashboard/Topbar.tsx
'use client';

import * as React from 'react';
import { useStore } from '@/lib/store';
import { SyncIndicator } from '../ui/SyncIndicator';
import { Badge } from '../ui/badge';
import { LogOut, ChevronDown, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Topbar: React.FC = () => {
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const activeTab = useStore((s) => s.activeTab);
  const loadDashboardData = useStore((s) => s.loadDashboardData);
  const dataLoading = useStore((s) => s.dataLoading);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  const [menuOpen, setMenuOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const PAGE_META: Record<string, { title: string; desc: string }> = {
    overview:   { title: 'System Overview', desc: 'Child HIV Care & Growth Snapshot' },
    voiceform:  { title: 'Data Entry Form', desc: 'Multilingual Interactive Voice Registry' },
    records:    { title: 'Child Registry', desc: 'Registry Database for Registered Children' },
    duplicates: { title: 'Deduplication', desc: 'Fuzzy Matching & Duplicate Checks' },
    settings:   { title: 'Settings', desc: 'System Configuration & Reports' },
  };

  const meta = PAGE_META[activeTab] ?? { title: 'Dashboard', desc: 'Child Care Command Centre' };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'Admin':
      case 'SuperAdmin': return 'danger';
      case 'Editor':     return 'warning';
      case 'DataEntry':  return 'success';
      default:           return 'secondary';
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <header className="h-16 border-b border-zinc-200/80 bg-white/80 backdrop-blur-lg px-5 flex items-center justify-between z-10 flex-shrink-0 select-none">
      {/* Left: Breadcrumb */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.18 }}
          className="flex flex-col gap-0 text-left"
        >
          <h2 className="text-sm font-bold text-zinc-950 tracking-tight leading-tight">{meta.title}</h2>
          <span className="text-[10px] text-zinc-500 font-medium leading-tight">{meta.desc}</span>
        </motion.div>
      </AnimatePresence>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Sync Status */}
        <SyncIndicator />

        {/* Manual Refresh */}
        <button
          onClick={() => loadDashboardData(true)}
          disabled={dataLoading}
          title="Force refresh data from Google Sheets"
          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 transition-all cursor-pointer disabled:opacity-40 outline-none focus-visible:ring-1 focus-visible:ring-blue-500"
        >
          <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-zinc-200" />

        {/* User Menu */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 hover:bg-zinc-55 border border-transparent hover:border-zinc-200 rounded-xl transition-all outline-none focus-visible:ring-1 focus-visible:ring-blue-500 cursor-pointer"
            >
              {/* Avatar */}
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-[11px] shadow-md">
                {initials}
              </div>
              <div className="hidden md:flex flex-col items-start min-w-0">
                <span className="text-xs font-bold text-zinc-800 leading-tight">{user.name}</span>
                <span className="text-[9px] text-zinc-400 font-medium leading-tight truncate max-w-[130px]">{user.email}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-60 bg-white border border-zinc-200 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 z-50 text-left"
                >
                  {/* Profile Info */}
                  <div className="px-3.5 py-3 border-b border-zinc-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs font-bold text-zinc-900 leading-tight">{user.name}</p>
                      <p className="text-[10px] text-zinc-450 truncate leading-tight mt-0.5">{user.email}</p>
                      <div className="mt-1.5">
                        <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Theme Selector */}
                  <div className="px-3.5 py-2.5 border-b border-zinc-100 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Dashboard Theme</span>
                    <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200/50">
                      <button
                        onClick={() => setTheme('classic')}
                        className={`flex-1 text-[10px] font-bold py-1 px-1.5 rounded-lg transition-colors cursor-pointer text-center ${theme === 'classic' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
                      >
                        Classic
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`flex-1 text-[10px] font-bold py-1 px-1.5 rounded-lg transition-colors cursor-pointer text-center ${theme === 'dark' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
                      >
                        Dark
                      </button>
                      <button
                        onClick={() => setTheme('emerald')}
                        className={`flex-1 text-[10px] font-bold py-1 px-1.5 rounded-lg transition-colors cursor-pointer text-center ${theme === 'emerald' ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
                      >
                        Emerald
                      </button>
                    </div>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors font-semibold outline-none cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
};

Topbar.displayName = 'Topbar';
