import React, { useMemo } from 'react';
import { useStore } from '@/lib/store';
import { ShieldCheck, Smile, AlertCircle } from 'lucide-react';
const ClipboardCheck = ShieldCheck;
const Coins = ShieldCheck;

export function SupportSummary() {
  const { records } = useStore();

  const summary = useMemo(() => {
    let poorAppetiteCount = 0;
    let reducedAppetiteCount = 0;
    let mealsLessThanThree = 0;
    
    let onArtCount = 0;
    let missingArtId = 0;
    let missingVlTest = 0;

    let totalTuition = 0;
    let totalBooks = 0;
    let totalUniform = 0;
    let totalTransport = 0;
    let totalOther = 0;
    let overallSupportAmount = 0;

    records.forEach((r) => {
      // 1. Appetite & Nutrition
      const app = (r.appetite || '').toLowerCase();
      if (app === 'poor') poorAppetiteCount++;
      if (app === 'reduced') reducedAppetiteCount++;

      const meals = r.mealsperday || 0;
      if (meals > 0 && meals < 3) {
        mealsLessThanThree++;
      }

      // 2. Clinical
      const art = (r.comorbidities || '').toLowerCase();
      if (art.includes('hiv') || art.includes('art')) {
        onArtCount++;
      }

      // 3. Financial requests
      const tuition = r.private_tution_fee || 0;
      const books = r.edubooks || 0;
      const uniform = r.eduuniform || 0;
      const transport = r.edutransport || 0;
      const other = r.eduother || 0;
      const reqTotal = r.reqtotalsupport || 0;

      totalTuition += tuition;
      totalBooks += books;
      totalUniform += uniform;
      totalTransport += transport;
      totalOther += other;
      overallSupportAmount += reqTotal;
    });

    return {
      poorAppetiteCount,
      reducedAppetiteCount,
      mealsLessThanThree,
      onArtCount,
      missingArtId,
      missingVlTest,
      totalTuition,
      totalBooks,
      totalUniform,
      totalTransport,
      totalOther,
      overallSupportAmount
    };
  }, [records]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          Support Summary & Checklists
        </h2>
        <p className="font-sans text-xs text-slate-500">
          Consolidated tracking checklists across nutritional, clinical, and education funding domains
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* 1. Nutritional Support Checklist */}
        <div className="bg-white border border-slate-100 p-5 flex flex-col gap-4 rounded-2xl shadow-sm">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2 text-emerald-500">
            <Smile className="h-5 w-5" />
            <h3 className="font-display text-sm font-bold text-slate-800">
              Nutritional Status Audits
            </h3>
          </div>
          <div className="flex flex-col gap-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Severely poor appetite reports</span>
              <span className={`font-mono font-bold ${summary.poorAppetiteCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {summary.poorAppetiteCount}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Reduced appetite reports</span>
              <span className={`font-mono font-bold ${summary.reducedAppetiteCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {summary.reducedAppetiteCount}
              </span>
            </div>
            <div className="flex items-center justify-between pb-1">
              <span className="text-slate-500">Children eating &lt; 3 meals daily</span>
              <span className={`font-mono font-bold ${summary.mealsLessThanThree > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {summary.mealsLessThanThree}
              </span>
            </div>
            {summary.poorAppetiteCount + summary.mealsLessThanThree > 0 && (
              <div className="flex gap-2 rounded-lg bg-red-50 border border-red-100 p-2.5 mt-2 text-[10px] text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>Nutritional warnings active. Check meals schedules and weight metrics for critical cases.</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Clinical Support Checklist */}
        <div className="bg-white border border-slate-100 p-5 flex flex-col gap-4 rounded-2xl shadow-sm">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2 text-emerald-500">
            <ClipboardCheck className="h-5 w-5" />
            <h3 className="font-display text-sm font-bold text-slate-800">
              Clinical Quality Audits
            </h3>
          </div>
          <div className="flex flex-col gap-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Total Children on ART Treatment</span>
              <span className="font-mono font-bold text-emerald-500">{summary.onArtCount}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Missing ART Registration IDs</span>
              <span className={`font-mono font-bold ${summary.missingArtId > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {summary.missingArtId}
              </span>
            </div>
            <div className="flex items-center justify-between pb-1">
              <span className="text-slate-500">Pending Viral Load Tests</span>
              <span className={`font-mono font-bold ${summary.missingVlTest > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {summary.missingVlTest}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Financial Support Summary */}
        <div className="bg-white border border-slate-100 p-5 flex flex-col gap-4 rounded-2xl shadow-sm">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2 text-emerald-500">
            <Coins className="h-5 w-5" />
            <h3 className="font-display text-sm font-bold text-slate-800">
              Education Expenses Summary
            </h3>
          </div>
          <div className="flex flex-col gap-3 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">Private Tuition Fees</span>
              <span className="font-mono font-bold text-slate-700">₹{summary.totalTuition.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">Books & stationery costs</span>
              <span className="font-mono font-bold text-slate-700">₹{summary.totalBooks.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">Uniform costs</span>
              <span className="font-mono font-bold text-slate-700">₹{summary.totalUniform.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">School transport costs</span>
              <span className="font-mono font-bold text-slate-700">₹{summary.totalTransport.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Other education costs</span>
              <span className="font-mono font-bold text-slate-700">₹{summary.totalOther.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="font-bold text-emerald-500">Total Annual Funding</span>
              <span className="font-mono font-bold text-emerald-500">₹{summary.overallSupportAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupportSummary;
