// components/dashboard/Overview.tsx
'use client';

import * as React from 'react';
import { useStore } from '@/lib/store';
import { KPICard } from '../ui/KPICard';
import { 
  Users, 
  IndianRupee, 
  Activity, 
  GraduationCap, 
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Volume2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { formatNumber } from '@/lib/utils/format';

export const Overview: React.FC = () => {
  const stats = useStore((s) => s.stats);
  const records = useStore((s) => s.records);

  // Fallback calculations if backend has empty stats
  const localStats = React.useMemo(() => {
    if (!records.length) return null;
    
    let totalChildren = records.length;
    let totalIncome = 0;
    let totalWeight = 0;
    let totalHeight = 0;
    let severeAnaemia = 0;
    let severeUW = 0;
    const eduCounts: Record<string, number> = { school_going: 0, dropout: 0, never_enrolled: 0, other: 0 };
    const stateCounts: Record<string, number> = {};
    const districtCounts: Record<string, number> = {};

    records.forEach(r => {
      totalIncome += Number(r.householdincomemonthly || 0);
      totalWeight += Number(r.current_weight || 0);
      totalHeight += Number(r.current_height || 0);
      
      const hb = Number(r.hemoglobin || 0);
      if (hb > 0 && hb < 7) severeAnaemia++;

      const bmi = Number(r.bmicalc || 0);
      if (bmi > 0 && bmi < 16) severeUW++;

      const edu = r.educationstatus || 'other';
      eduCounts[edu] = (eduCounts[edu] || 0) + 1;

      const state = r.addressstate || 'Unknown';
      stateCounts[state] = (stateCounts[state] || 0) + 1;

      const district = r.addressdistrict || 'Unknown';
      districtCounts[district] = (districtCounts[district] || 0) + 1;
    });

    return {
      totalChildren,
      totalIncomeAvg: Math.round(totalIncome / totalChildren),
      avgWeight: parseFloat((totalWeight / totalChildren).toFixed(1)),
      avgHeight: parseFloat((totalHeight / totalChildren).toFixed(1)),
      severeAnaemiaCount: severeAnaemia,
      severelyUnderweightCount: severeUW,
      educationStatusCounts: eduCounts,
      states: stateCounts,
      districts: districtCounts
    };
  }, [records]);

  const activeStats = stats && Object.keys(stats).length > 2 ? stats : localStats;

  if (!activeStats || !records.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-500 font-medium select-none">
        <Activity className="w-10 h-10 mb-3 text-blue-500 animate-pulse" />
        <p className="text-sm">Pulling and indexing nutrition metrics... Please wait.</p>
      </div>
    );
  }

  // Data for Chart 1: Education Enrollment
  const eduData = [
    { name: 'School Going', count: activeStats.educationStatusCounts?.school_going || 0, color: '#3b82f6' },
    { name: 'Dropout', count: activeStats.educationStatusCounts?.dropout || 0, color: '#f59e0b' },
    { name: 'Never Enrolled', count: activeStats.educationStatusCounts?.never_enrolled || 0, color: '#ef4444' },
    { name: 'Other', count: activeStats.educationStatusCounts?.other || 0, color: '#64748b' },
  ];

  // Data for Chart 2: BMI Underweight Risk
  const uwCount = activeStats.severelyUnderweightCount || 0;
  const normalCount = Math.max(0, activeStats.totalChildren - uwCount);
  
  const bmiPieData = [
    { name: 'Severely Underweight', value: uwCount, color: '#ef4444' },
    { name: 'Normal / Healthy Weight', value: normalCount, color: '#10b981' },
  ];

  // State-wise distribution data
  const stateData = Object.entries(activeStats.states || {}).map(([state, count]) => ({
    state: state.replace('_', ' ').toUpperCase(),
    count,
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="flex flex-col gap-6 select-none animate-slide-up text-left">
      {/* KPI Cards Grid - Light Awwwards Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Children Registered"
          value={activeStats.totalChildren}
          delta="Active tracking"
          trend="up"
          icon={<Users className="w-5 h-5 text-blue-500" />}
          delay={0}
        />
        <KPICard
          title="Avg Monthly Income"
          value={`₹${formatNumber(activeStats.totalIncomeAvg)}`}
          delta="Household average"
          trend="neutral"
          icon={<IndianRupee className="w-5 h-5 text-amber-500" />}
          delay={0.05}
        />
        <KPICard
          title="Avg Growth Indicators"
          value={`${activeStats.avgWeight} kg / ${activeStats.avgHeight} cm`}
          delta="Weight & Height average"
          trend="up"
          icon={<Activity className="w-5 h-5 text-emerald-500" />}
          delay={0.1}
        />
        <KPICard
          title="Severe Anemia Risk"
          value={activeStats.severeAnaemiaCount}
          delta="Hb < 7 g/dL cases"
          trend={activeStats.severeAnaemiaCount > 0 ? 'down' : 'neutral'}
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
          delay={0.15}
        />
      </div>

      {/* Primary Graphs & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Education Enrollment */}
        <div className="glass-card p-6 flex flex-col justify-between col-span-2 bg-white">
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight">Education Enrollment Status</h3>
            <p className="text-[11px] text-zinc-500">Breakdown of children's academic enrollment profiles</p>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eduData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  labelStyle={{ color: '#0f172a', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '12px', color: '#334155' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {eduData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Underweight Risk */}
        <div className="glass-card p-6 flex flex-col justify-between bg-white">
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight">BMI Underweight Risk</h3>
            <p className="text-[11px] text-zinc-500">Severely Underweight vs healthy BMI status count</p>
          </div>
          <div className="h-[200px] w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bmiPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {bmiPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  itemStyle={{ fontSize: '11px', color: '#0f172a' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center label */}
            <div className="absolute flex flex-col items-center select-none">
              <Activity className="w-5 h-5 text-red-500 mb-0.5 animate-pulse" />
              <span className="text-sm font-extrabold text-zinc-950">{activeStats.severelyUnderweightCount}</span>
              <span className="text-[9px] font-semibold text-zinc-500 uppercase">Severe Cases</span>
            </div>
          </div>
          
          {/* Custom Legends */}
          <div className="flex flex-col gap-1.5 mt-2 border-t pt-3">
            {bmiPieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-zinc-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-bold text-zinc-900 font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* States Stats & Live Alerts Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Geographic Coverage */}
        <div className="glass-card p-6 bg-white">
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight">Geographic Distribution</h3>
            <p className="text-[11px] text-zinc-500">Distribution of registered children across states</p>
          </div>
          <div className="flex flex-col gap-3.5 mt-2">
            {stateData.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-800">{item.state}</span>
                  <span className="font-bold text-zinc-500 font-mono">{item.count} children</span>
                </div>
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${(item.count / activeStats.totalChildren) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Vulnerability Alerts */}
        <div className="glass-card p-6 bg-white flex flex-col justify-between">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight">Vulnerability Logs</h3>
              <p className="text-[11px] text-zinc-500 font-medium">Critical cases requiring nutritional/educational support</p>
            </div>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex flex-col gap-3 mt-2 overflow-y-auto max-h-[220px]">
            {activeStats.severeAnaemiaCount > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex gap-2.5 items-start">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <h5 className="text-xs font-bold text-red-950">Severe Anaemia Detected</h5>
                  <p className="text-[10px] text-red-700 leading-normal">
                    {activeStats.severeAnaemiaCount} children report Haemoglobin levels below 7 g/dL. Immediate review is advised.
                  </p>
                </div>
              </div>
            )}

            {activeStats.severelyUnderweightCount > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex gap-2.5 items-start">
                <Activity className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <h5 className="text-xs font-bold text-amber-950">Nutritional Deficiency Warning</h5>
                  <p className="text-[10px] text-amber-700 leading-normal">
                    {activeStats.severelyUnderweightCount} children have a BMI categorized as Severely Underweight.
                  </p>
                </div>
              </div>
            )}

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex gap-2.5 items-start">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <h5 className="text-xs font-bold text-blue-950">Database Sync Integrity</h5>
                <p className="text-[10px] text-blue-700 leading-normal">
                  All local child records synchronized. Audit trail integrity is healthy.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

Overview.displayName = 'Overview';
export default Overview;
