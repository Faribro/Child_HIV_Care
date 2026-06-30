// components/dashboard/Sidebar.tsx
'use client';

import * as React from 'react';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import {
  LayoutDashboard,
  Mic,
  FolderLock,
  Heart,
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
  Settings as SettingsIcon,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'overview',   label: 'Overview',   icon: LayoutDashboard, badge: null },
  { id: 'voiceform',  label: 'Voice Form',  icon: Mic,             badge: 'New' },
  { id: 'children',   label: 'Registry',   icon: FolderLock,      badge: null },
  { id: 'health',     label: 'Health',     icon: Heart,           badge: null },
  { id: 'education',  label: 'Education',  icon: GraduationCap,   badge: null },
  { id: 'summary',    label: 'Support',    icon: ShieldCheck,     badge: null },
  { id: 'validation', label: 'Validation', icon: AlertTriangle,   badge: null },
  { id: 'settings',   label: 'Settings',   icon: SettingsIcon,    badge: null },
] as const;

export const Sidebar: React.FC = () => {
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 230 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-white border-r border-zinc-200/80 flex flex-col justify-between select-none z-20 flex-shrink-0 overflow-hidden"
    >
      <div className="flex flex-col gap-5 pt-5 px-2.5">
        {/* Brand Logo */}
        <div className={`flex items-center gap-3 px-2 h-9 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-zinc-50 border border-zinc-150 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 p-1">
            <Image
              src="/alliance-india-logo.png"
              alt="Alliance India Logo"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <div className="flex flex-col leading-none text-left">
                  <span className="text-[11px] font-black text-zinc-900 tracking-wide uppercase">Childcare Portal</span>
                  <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-widest mt-0.5">Alliance India</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Section label */}
        <AnimatePresence>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-2 text-[9px] font-bold text-zinc-400 uppercase tracking-widest text-left"
            >
              Navigation
            </motion.p>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <nav role="tablist" aria-label="Dashboard Navigation" className="flex flex-col gap-0.5 -mt-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(item.id)}
                title={collapsed ? item.label : undefined}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all outline-none focus-visible:ring-1 focus-visible:ring-blue-500 cursor-pointer w-full text-left overflow-hidden
                  ${isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                {/* Active background pill */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-bg"
                    className="absolute inset-0 bg-blue-50 border border-blue-100/50 rounded-xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Active left stripe */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-stripe"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <Icon
                  className={`w-[18px] h-[18px] flex-shrink-0 relative z-10 transition-colors ${
                    isActive ? 'text-blue-500' : 'text-zinc-400'
                  }`}
                />

                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 relative z-10 whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Badge */}
                {!collapsed && item.badge && (
                  <span className="relative z-10 text-[9px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full ml-auto">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Collapse toggle */}
      <div className="p-2.5 border-t border-zinc-100">
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-zinc-905 hover:bg-zinc-100 transition-all cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-blue-500 ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed
            ? <PanelLeftOpen className="w-4 h-4" />
            : <PanelLeftClose className="w-4 h-4" />
          }
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[12px] font-semibold whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};

Sidebar.displayName = 'Sidebar';
