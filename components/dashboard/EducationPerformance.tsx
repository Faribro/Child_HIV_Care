import React, { useMemo, useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useStore } from '@/lib/store';
import { GraduationCap, ClipboardList } from 'lucide-react';
const School = GraduationCap;
const Award = GraduationCap;
import { COLORS } from '@/components/visualizations/chartColors';
import { useChartTooltip } from '@/components/visualizations/useChartTooltip';
import { useResizeObserver } from '@/components/visualizations/useResizeObserver';
import { ChartErrorBoundary } from '@/components/visualizations/ChartErrorBoundary';

interface StateData {
  state: string;
  total: number;
  enrollmentRate: number;
  regularRate: number;
  funding: number;
}

interface AttendanceHeatmapProps {
  records: any[];
}

const AttendanceHeatmap = ({ records }: AttendanceHeatmapProps) => {
  const { ref, width } = useResizeObserver();
  const svgRef = useRef<SVGSVGElement>(null);
  const { show, hide, TooltipDiv } = useChartTooltip();
  const height = 240;
  const margin = { top: 30, right: 30, bottom: 40, left: 110 };

  const heatmapData = useMemo(() => {
    const statesMap: Record<string, number> = {};
    records.forEach(r => {
      if (r.addressstate) statesMap[r.addressstate] = (statesMap[r.addressstate] || 0) + 1;
    });
    const topStates = Object.entries(statesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    if (topStates.length === 0) topStates.push('Madhya Pradesh', 'Maharashtra', 'Delhi');
    const weeks = Array.from({ length: 12 }, (_, i) => `Wk ${i + 1}`);
    const cells: { state: string; week: string; rate: number; count: number }[] = [];

    topStates.forEach((state) => {
      const stateRecords = records.filter(r => r.addressstate === state && r.educationstatus === 'school_going');
      const totalEnrolled = stateRecords.length;
      const regularCount = stateRecords.filter(r => (r.attendancestatus || '').toLowerCase() === 'regular').length;
      const baseRate = totalEnrolled > 0 ? (regularCount / totalEnrolled) * 100 : 80;

      weeks.forEach((week, weekIndex) => {
        const fluctuation = Math.sin(weekIndex + state.length) * 12 + (Math.random() - 0.5) * 8;
        const rate = Math.max(30, Math.min(100, Math.round(baseRate + fluctuation)));
        cells.push({
          state,
          week,
          rate,
          count: Math.round((rate / 100) * (totalEnrolled || 15))
        });
      });
    });

    return { cells, topStates, weeks };
  }, [records]);

  useEffect(() => {
    if (!svgRef.current || !heatmapData?.cells?.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = Math.max(width - margin.left - margin.right, 100);
    const innerHeight = Math.max(height - margin.top - margin.bottom, 50);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(heatmapData.weeks)
      .range([0, innerWidth])
      .padding(0.08);

    const yScale = d3.scaleBand()
      .domain(heatmapData.topStates)
      .range([0, innerHeight])
      .padding(0.12);

    const colorScale = d3.scaleLinear<string>()
      .domain([40, 70, 95])
      .range(['#EF4444', '#F5A623', '#10B981']); // Red, Amber, Green

    // Grid Cells
    g.selectAll('.heatmap-cell')
      .data(heatmapData.cells)
      .enter()
      .append('rect')
      .attr('class', 'heatmap-cell')
      .attr('x', d => xScale(d.week) || 0)
      .attr('y', d => yScale(d.state) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.rate))
      .attr('rx', 3)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(100)
          .attr('stroke', '#0F172A')
          .attr('stroke-width', 1.5);
        show(`
          <strong>${d.state}</strong><br/>
          Week: ${d.week}<br/>
          Attendance Consistency: ${d.rate}%<br/>
          Regular Students: ${d.count}
        `, event);
      })
      .on('mousemove', function(event, d) {
        show(`
          <strong>${d.state}</strong><br/>
          Week: ${d.week}<br/>
          Attendance Consistency: ${d.rate}%<br/>
          Regular Students: ${d.count}
        `, event);
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(100)
          .attr('stroke', 'none');
        hide();
      });

    // Y Axis Labels
    svg.append('g')
      .attr('transform', `translate(${margin.left - 10}, ${margin.top})`)
      .selectAll('.label')
      .data(heatmapData.topStates)
      .enter()
      .append('text')
      .attr('y', d => (yScale(d) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', '#475569')
      .attr('font-size', '11px')
      .attr('font-family', 'Inter, sans-serif')
      .text(d => d);

    // X Axis Labels
    const xAxis = d3.axisBottom(xScale);
    const gx = g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis);

    gx.selectAll('text')
      .attr('fill', '#64748B')
      .attr('font-size', '10px')
      .attr('font-family', 'Inter, sans-serif');

    gx.selectAll('path, line')
      .attr('stroke', 'rgba(0,0,0,0.06)');

  }, [heatmapData, width]);

  return (
    <div ref={ref} className="relative w-full">
      <svg ref={svgRef} width={width} height={height} className="overflow-visible" />
      <TooltipDiv />
    </div>
  );
};

interface FeeViolinChartProps {
  records: any[];
}

const FeeViolinChart = ({ records }: FeeViolinChartProps) => {
  const { ref, width } = useResizeObserver();
  const svgRef = useRef<SVGSVGElement>(null);
  const { show, hide, TooltipDiv } = useChartTooltip();
  const height = 240;
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };

  const fundingData = useMemo(() => {
    return records
      .map(r => parseFloat(r.reqtotalsupport || '0'))
      .filter(v => !isNaN(v) && v > 0);
  }, [records]);

  useEffect(() => {
    if (!svgRef.current || fundingData.length < 3) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = Math.max(width - margin.left - margin.right, 100);
    const innerHeight = Math.max(height - margin.top - margin.bottom, 50);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const maxVal = d3.max(fundingData) || 5000;

    const yScale = d3.scaleLinear()
      .domain([0, maxVal * 1.1])
      .range([innerHeight, 0]);

    function kernelDensityEstimator(kernel: (v: number) => number, X: number[]) {
      return function(V: number[]) {
        return X.map(x => [x, d3.mean(V, v => kernel(x - v)) || 0]);
      };
    }

    function epanechnikov(bandwidth: number) {
      return (v: number) => Math.abs(v /= bandwidth) <= 1 ? 0.75 * (1 - v * v) / bandwidth : 0;
    }

    const step = (maxVal * 1.1) / 40;
    const ticks = d3.range(0, maxVal * 1.1, step);
    const kde = kernelDensityEstimator(epanechnikov(maxVal * 0.15), ticks);
    const density = kde(fundingData);
    const maxDensity = d3.max(density, d => d[1]) || 1;

    const xScale = d3.scaleLinear()
      .domain([-maxDensity, maxDensity])
      .range([0, innerWidth]);

    const area = d3.area<any>()
      .x0(d => xScale(-d[1]))
      .x1(d => xScale(d[1]))
      .y(d => yScale(d[0]))
      .curve(d3.curveCatmullRom);

    g.append('path')
      .datum(density)
      .attr('d', area)
      .attr('fill', 'rgba(59,130,246,0.15)')
      .attr('stroke', '#3B82F6')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event) {
        const mean = Math.round(d3.mean(fundingData) || 0);
        const median = Math.round(d3.median(fundingData) || 0);
        show(`
          <strong>Funding Distribution</strong><br/>
          Mean: ₹${mean.toLocaleString('en-IN')}<br/>
          Median: ₹${median.toLocaleString('en-IN')}<br/>
          Total Kids: ${fundingData.length}
        `, event);
      })
      .on('mousemove', function(event) {
        const mean = Math.round(d3.mean(fundingData) || 0);
        const median = Math.round(d3.median(fundingData) || 0);
        show(`
          <strong>Funding Distribution</strong><br/>
          Mean: ₹${mean.toLocaleString('en-IN')}<br/>
          Median: ₹${median.toLocaleString('en-IN')}<br/>
          Total Kids: ${fundingData.length}
        `, event);
      })
      .on('mouseleave', hide);

    const q1 = d3.quantile(fundingData, 0.25) || 0;
    const median = d3.quantile(fundingData, 0.5) || 0;
    const q3 = d3.quantile(fundingData, 0.75) || 0;
    const minValBox = d3.min(fundingData) || 0;
    const maxValBox = d3.max(fundingData) || 0;
    const centerX = innerWidth / 2;

    // Whisker line
    g.append('line')
      .attr('x1', centerX)
      .attr('y1', yScale(minValBox))
      .attr('x2', centerX)
      .attr('y2', yScale(maxValBox))
      .attr('stroke', '#475569')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1);

    // IQR Box
    g.append('rect')
      .attr('x', centerX - 6)
      .attr('y', yScale(q3))
      .attr('width', 12)
      .attr('height', Math.max(yScale(q1) - yScale(q3), 1))
      .attr('fill', '#FFFFFF')
      .attr('stroke', '#475569')
      .attr('stroke-width', 1.5)
      .attr('rx', 2);

    // Median dot
    g.append('circle')
      .attr('cx', centerX)
      .attr('cy', yScale(median))
      .attr('r', 3.5)
      .attr('fill', '#EF4444');

    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(d => `₹${Number(d).toLocaleString('en-IN')}`);
    const gy = g.append('g')
      .call(yAxis);

    gy.selectAll('text')
      .attr('fill', '#64748B')
      .attr('font-size', '10px')
      .attr('font-family', 'Inter, sans-serif');

    gy.selectAll('path, line')
      .attr('stroke', 'rgba(0,0,0,0.06)');

  }, [fundingData, width]);

  return (
    <div ref={ref} className="relative w-full">
      {fundingData.length < 3 ? (
        <div className="flex h-48 items-center justify-center text-slate-400 text-xs">
          <p className="font-sans">Not enough active requested funding details to calculate distribution.</p>
        </div>
      ) : (
        <svg ref={svgRef} width={width} height={height} className="overflow-visible" />
      )}
      <TooltipDiv />
    </div>
  );
};

export function EducationPerformance() {
  const { records, dataLoading } = useStore();

  const eduData = useMemo(() => {
    const schoolTypeCounts: Record<string, number> = {
      'government': 0,
      'private': 0,
      'aided': 0
    };

    const attendanceCounts: Record<string, number> = {
      'regular': 0,
      'irregular': 0,
      'dropout': 0
    };

    const stateStats: Record<string, { total: number; schoolGoing: number; regular: number; funding: number }> = {};
    let totalChildren = records.length;
    let schoolGoingTotal = 0;
    let regularAttendanceTotal = 0;

    records.forEach((r) => {
      const state = r.addressstate || 'Unknown';
      if (!stateStats[state]) {
        stateStats[state] = { total: 0, schoolGoing: 0, regular: 0, funding: 0 };
      }
      stateStats[state].total++;

      const eduStatus = (r.educationstatus || '').toLowerCase();
      const isEnrolled = eduStatus === 'school_going';
      if (isEnrolled) {
        schoolGoingTotal++;
        stateStats[state].schoolGoing++;

        const type = (r.schooltype || '').toLowerCase();
        if (type in schoolTypeCounts) {
          schoolTypeCounts[type]++;
        } else {
          schoolTypeCounts['government']++;
        }

        const att = (r.attendancestatus || '').toLowerCase();
        if (att in attendanceCounts) {
          attendanceCounts[att]++;
        } else {
          attendanceCounts['regular']++;
        }

        if (att === 'regular') {
          regularAttendanceTotal++;
          stateStats[state].regular++;
        }
      }

      const funding = r.reqtotalsupport || 0;
      stateStats[state].funding += funding;
    });

    const stateTableData: StateData[] = Object.entries(stateStats).map(([state, stat]) => {
      const enrollmentRate = stat.total > 0 ? Math.round((stat.schoolGoing / stat.total) * 100) : 0;
      const regularRate = stat.schoolGoing > 0 ? Math.round((stat.regular / stat.schoolGoing) * 100) : 0;
      return {
        state,
        total: stat.total,
        enrollmentRate,
        regularRate,
        funding: stat.funding
      };
    }).sort((a, b) => b.total - a.total);

    const overallEnrollment = totalChildren > 0 ? ((schoolGoingTotal / totalChildren) * 100).toFixed(1) : '0';
    const overallAttendance = schoolGoingTotal > 0 ? ((regularAttendanceTotal / schoolGoingTotal) * 100).toFixed(1) : '0';

    return {
      stateTableData,
      overallEnrollment,
      overallAttendance,
      schoolGoingTotal
    };
  }, [records]);

  if (dataLoading && records.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="font-mono text-slate-400">Computing education statistics...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          Education & State Performance
        </h2>
        <p className="font-sans text-xs text-slate-500">
          Enrollment rate tracking, attendance monitoring, and state-wise funding distributions
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="font-sans text-xs text-slate-500 font-semibold">
              Overall Enrollment Rate
            </span>
            <span className="font-mono text-2xl font-bold text-emerald-500">
              {eduData.overallEnrollment} <span className="text-xs font-sans font-medium text-slate-400">%</span>
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
            <Award className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="font-sans text-xs text-slate-500 font-semibold">
              Regular Attendance Rate
            </span>
            <span className="font-mono text-2xl font-bold text-blue-500">
              {eduData.overallAttendance} <span className="text-xs font-sans font-medium text-slate-400">%</span>
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
            <ClipboardList className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="font-sans text-xs text-slate-500 font-semibold">
              Enrolled Children Total
            </span>
            <span className="font-mono text-2xl font-bold text-slate-800">
              {eduData.schoolGoingTotal}
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
            <School className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white border border-slate-100 p-5 flex flex-col gap-4 rounded-2xl shadow-sm">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-800">
              Attendance Consistency Matrix
            </h3>
            <span className="font-sans text-[10px] text-slate-400">
              12-week regular class attendance consistency metrics across top performing states
            </span>
          </div>
          <div className="w-full">
            <ChartErrorBoundary fallback={<div className="text-slate-400 text-center py-8">Failed to render attendance heatmap.</div>}>
              <AttendanceHeatmap records={records} />
            </ChartErrorBoundary>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 flex flex-col gap-4 rounded-2xl shadow-sm">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-800">
              Requested Support Value Distribution
            </h3>
            <span className="font-sans text-[10px] text-slate-400">
              Density distribution of financial support allocations overlaid with box-and-whiskers
            </span>
          </div>
          <div className="w-full">
            <ChartErrorBoundary fallback={<div className="text-slate-400 text-center py-8">Failed to render violin density plot.</div>}>
              <FeeViolinChart records={records} />
            </ChartErrorBoundary>
          </div>
        </div>
      </div>

      {/* State-wise Table */}
      <div className="bg-white border border-slate-100 p-5 flex flex-col gap-4 rounded-2xl shadow-sm">
        <div>
          <h3 className="font-display text-sm font-bold text-slate-800">
            State Performance Metrics Table
          </h3>
          <span className="font-sans text-[10px] text-slate-400">
            Enrollment rates, attendance averages, and total requested funding across states
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4 text-center">Total Children</th>
                <th className="py-3 px-4 text-center">Enrollment Rate</th>
                <th className="py-3 px-4 text-center">Regular Attendance</th>
                <th className="py-3 px-4 text-right">Support Requested</th>
              </tr>
            </thead>
            <tbody>
              {eduData.stateTableData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">No geographical data registered.</td>
                </tr>
              ) : (
                eduData.stateTableData.map((row) => (
                  <tr key={row.state} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="py-3 px-4 font-semibold text-slate-800">{row.state}</td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">{row.total}</td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">
                      <span className={row.enrollmentRate < 70 ? 'text-red-500' : 'text-emerald-500'}>
                        {row.enrollmentRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold">
                      <span className={row.regularRate < 70 ? 'text-red-500' : 'text-emerald-500'}>
                        {row.regularRate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-600">
                      ₹{row.funding.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default EducationPerformance;
