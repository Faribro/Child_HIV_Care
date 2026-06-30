// components/dashboard/DashboardShell.tsx
'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '@/lib/store';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { OfflineBanner } from '../pwa/OfflineBanner';
import { InstallPrompt } from '../pwa/InstallPrompt';
import { TableSkeleton, MapSkeleton, ChartSkeleton } from '../ui/Skeleton';
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load dashboard tabs to optimize loading and chunk sizes
const OverviewTab = dynamic(() => import('./Overview'), {
  loading: () => <ChartSkeleton />,
});
const RecordsTab = dynamic(() => import('./Records'), {
  loading: () => <TableSkeleton />,
});
const DuplicatesTab = dynamic(() => import('./DataValidation'), {
  loading: () => <TableSkeleton />,
});
const SettingsTab = dynamic(() => import('./Settings'), {
  loading: () => <TableSkeleton />,
});
const VoiceFormTab = dynamic(() => import('./VoiceForm'), {
  loading: () => <TableSkeleton />,
});
const HealthTab = dynamic(() => import('./HealthAnalytics'), {
  loading: () => <ChartSkeleton />,
});
const EducationTab = dynamic(() => import('./EducationPerformance'), {
  loading: () => <ChartSkeleton />,
});
const SummaryTab = dynamic(() => import('./SupportSummary'), {
  loading: () => <TableSkeleton />,
});

export const DashboardShell: React.FC = () => {
  const activeTab = useStore((s) => s.activeTab);
  const loadDashboardData = useStore((s) => s.loadDashboardData);
  const dataError = useStore((s) => s.dataError);
  const dataLoading = useStore((s) => s.dataLoading);

  React.useEffect(() => {
    // Initial fetch of dashboard data
    loadDashboardData();
  }, [loadDashboardData]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'voiceform':
        return <VoiceFormTab />;
      case 'children':
        return <RecordsTab />;
      case 'health':
        return <HealthTab />;
      case 'education':
        return <EducationTab />;
      case 'summary':
        return <SummaryTab />;
      case 'validation':
        return <DuplicatesTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-zinc-800 flex-col">
      {/* PWA offline warning bar */}
      <OfflineBanner />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Work Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-925/40">
          {/* Header Bar */}
          <Topbar />

          {/* Scrollable Content Container */}
          <main className="flex-1 overflow-y-auto px-6 py-6 focus:outline-none" id="main-content" tabIndex={-1}>
            {dataError && (
              <div className="mb-6 p-4 bg-red-950/20 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 select-none">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-semibold">Synchronization Conflict</h4>
                  <p className="text-xs text-red-400/80 leading-normal">{dataError}</p>
                </div>
              </div>
            )}

            {/* Smooth Page transition container */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full"
              >
                {renderActiveTab()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* PWA Add to Home Screen Prompt */}
      <InstallPrompt />
    </div>
  );
};

DashboardShell.displayName = 'DashboardShell';
export default DashboardShell;
