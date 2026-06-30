import React, { useMemo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Heart, Activity, ShieldAlert } from 'lucide-react';
import { COLORS } from '@/components/visualizations/chartColors';
import { useChartTooltip } from '@/components/visualizations/useChartTooltip';
import { useResizeObserver } from '@/components/visualizations/useResizeObserver';
import { ChartErrorBoundary } from '@/components/visualizations/ChartErrorBoundary';

// ==========================================
// 1. Viral Load Bullet Chart (D3)
// ==========================================
interface ViralLoadBulletChartProps {
  data: { name: string; value: number }[];
}

const ViralLoadBulletChart = ({ data }: ViralLoadBulletChartProps) => {
  const { ref, width } = useResizeObserver();
  const svgRef = useRef<SVGSVGElement>(null);
  const { show, hide, TooltipDiv } = useChartTooltip();
  const rowSpacing = 48;
  const height = data.length * rowSpacing + 40;
  const margin = { top: 10, right: 30, bottom: 30, left: 180 };

  useEffect(() => {
    if (!svgRef.current || !data?.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = Math.max(width - margin.left - margin.right, 100);
    const innerHeight = Math.max(height - margin.top - margin.bottom, 50);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const maxVal = d3.max(data, d => d.value) || 0;
    const total = d3.sum(data, d => d.value) || 1;

    const xScale = d3.scaleLinear()
      .domain([0, Math.max(maxVal * 1.15, 10)])
      .range([0, innerWidth]);

    const yScale = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, innerHeight])
      .padding(0.35);

    // X Axis grid
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .ticks(5)
        .tickSize(-innerHeight)
        .tickFormat(() => '')
      )
      .selectAll('.tick line')
      .attr('stroke', 'rgba(0,0,0,0.04)')
      .attr('stroke-dasharray', '3,3');

    // Draw rows
    const rows = g.selectAll('.bullet-row')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bullet-row')
      .attr('transform', d => `translate(0, ${yScale(d.name) || 0})`);

    // Row backgrounds
    rows.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', innerWidth)
      .attr('height', yScale.bandwidth())
      .attr('fill', 'rgba(0,0,0,0.02)')
      .attr('rx', 4);

    // Colors
    const getVlColor = (name: string) => {
      const n = name.toLowerCase();
      if (n.includes('excellent') || n.includes('undetectable')) return '#10B981'; // Green
      if (n.includes('good') || n.includes('suppressed')) return '#3B82F6'; // Blue
      if (n.includes('monitor') || n.includes('unsuppressed')) return '#F5A623'; // Amber
      if (n.includes('urgent') || n.includes('high')) return '#EF4444'; // Red
      return '#64748B';
    };

    // Active value bars
    rows.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 0)
      .attr('height', yScale.bandwidth())
      .attr('fill', d => getVlColor(d.name))
      .attr('rx', 4)
      .on('mouseenter', function(event, d) {
        const pct = ((d.value / total) * 100).toFixed(1);
        d3.select(this)
          .transition()
          .duration(150)
          .attr('fill', d3.color(getVlColor(d.name))?.brighter(0.4)?.toString() || getVlColor(d.name));
        show(`<strong>${d.name}</strong><br/>Cases: ${d.value} (${pct}%)`, event);
      })
      .on('mousemove', function(event, d) {
        const pct = ((d.value / total) * 100).toFixed(1);
        show(`<strong>${d.name}</strong><br/>Cases: ${d.value} (${pct}%)`, event);
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('fill', getVlColor(d.name));
        hide();
      })
      .transition()
      .duration(750)
      .attr('width', d => xScale(d.value));

    // Y-Axis Labels
    svg.append('g')
      .attr('transform', `translate(${margin.left - 12}, ${margin.top})`)
      .selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('x', 0)
      .attr('y', d => (yScale(d.name) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', '#475569') // slate-600
      .attr('font-size', '11px')
      .attr('font-family', 'Inter, sans-serif')
      .text(d => d.name);

    // X-Axis Axis line
    const xAxis = d3.axisBottom(xScale).ticks(5);
    const gx = g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis);

    gx.selectAll('text')
      .attr('fill', '#64748B') // slate-500
      .attr('font-size', '10px')
      .attr('font-family', 'Inter, sans-serif');

    gx.selectAll('path, line')
      .attr('stroke', 'rgba(0,0,0,0.06)');

  }, [data, width]);

  return (
    <div ref={ref} className="relative w-full">
      <svg ref={svgRef} width={width} height={height} className="overflow-visible" />
      <TooltipDiv />
    </div>
  );
};

// ==========================================
// 2. Hemoglobin Diverging Bar Chart (D3)
// ==========================================
interface HemoglobinDivergingChartProps {
  data: { name: string; count: number }[];
}

const HemoglobinDivergingChart = ({ data }: HemoglobinDivergingChartProps) => {
  const { ref, width } = useResizeObserver();
  const svgRef = useRef<SVGSVGElement>(null);
  const { show, hide, TooltipDiv } = useChartTooltip();
  const height = 300;
  const margin = { top: 15, right: 35, bottom: 40, left: 160 };

  useEffect(() => {
    if (!svgRef.current || !data?.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = Math.max(width - margin.left - margin.right, 100);
    const innerHeight = Math.max(height - margin.top - margin.bottom, 50);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const processed = data.map(d => {
      const n = d.name.toLowerCase();
      const isAnemia = n.includes('severe') || n.includes('moderate') || n.includes('mild');
      return {
        name: d.name,
        raw: d.count,
        value: isAnemia ? -d.count : d.count
      };
    });

    const maxAbs = d3.max(processed, d => Math.abs(d.value)) || 1;
    const bound = Math.max(maxAbs * 1.15, 5);

    const xScale = d3.scaleLinear()
      .domain([-bound, bound])
      .range([0, innerWidth]);

    const yScale = d3.scaleBand()
      .domain(processed.map(d => d.name))
      .range([0, innerHeight])
      .padding(0.35);

    // Center Baseline
    g.append('line')
      .attr('x1', xScale(0))
      .attr('y1', 0)
      .attr('x2', xScale(0))
      .attr('y2', innerHeight)
      .attr('stroke', 'rgba(0,0,0,0.15)')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '2,2');

    // Horizontal grid
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => ''))
      .selectAll('.tick line')
      .attr('stroke', 'rgba(0,0,0,0.03)');

    // Bars
    g.selectAll('.diverge-bar')
      .data(processed)
      .enter()
      .append('rect')
      .attr('class', 'diverge-bar')
      .attr('y', d => yScale(d.name) || 0)
      .attr('height', yScale.bandwidth())
      .attr('fill', d => {
        const n = d.name.toLowerCase();
        if (n.includes('severe')) return '#EF4444'; // Red
        if (n.includes('moderate')) return '#F5A623'; // Amber
        if (n.includes('mild')) return '#FCD34D'; // Yellow
        if (n.includes('normal')) return '#10B981'; // Green
        return '#3B82F6'; // Blue
      })
      .attr('rx', 3)
      .attr('x', xScale(0))
      .attr('width', 0)
      .on('mouseenter', function(event, d) {
        d3.select(this).transition().duration(150).attr('opacity', 0.85);
        show(`<strong>${d.name}</strong><br/>Children: ${d.raw}`, event);
      })
      .on('mousemove', function(event, d) {
        show(`<strong>${d.name}</strong><br/>Children: ${d.raw}`, event);
      })
      .on('mouseleave', function() {
        d3.select(this).transition().duration(150).attr('opacity', 1);
        hide();
      })
      .transition()
      .duration(750)
      .attr('x', d => d.value < 0 ? xScale(d.value) : xScale(0))
      .attr('width', d => Math.abs(xScale(d.value) - xScale(0)));

    // Labels
    g.selectAll('.diverge-val')
      .data(processed)
      .enter()
      .append('text')
      .attr('class', 'diverge-val')
      .attr('y', d => (yScale(d.name) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-size', '10px')
      .attr('fill', '#0F172A')
      .attr('opacity', 0)
      .text(d => d.raw)
      .attr('x', d => d.value < 0 ? xScale(d.value) - 15 : xScale(d.value) + 6)
      .attr('text-anchor', d => d.value < 0 ? 'end' : 'start')
      .transition()
      .delay(600)
      .duration(300)
      .attr('opacity', d => d.raw > 0 ? 1 : 0);

    // Left Y Axis Labels
    svg.append('g')
      .attr('transform', `translate(${margin.left - 12}, ${margin.top})`)
      .selectAll('.label')
      .data(processed)
      .enter()
      .append('text')
      .attr('y', d => (yScale(d.name) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', '#475569')
      .attr('font-size', '11px')
      .attr('font-family', 'Inter, sans-serif')
      .text(d => d.name);

    // X Axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(v => Math.abs(Number(v)).toString());

    const gx = g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis);

    gx.selectAll('text')
      .attr('fill', '#64748B')
      .attr('font-size', '10px')
      .attr('font-family', 'Inter, sans-serif');

    gx.selectAll('path, line')
      .attr('stroke', 'rgba(0,0,0,0.06)');

  }, [data, width]);

  return (
    <div ref={ref} className="relative w-full">
      <svg ref={svgRef} width={width} height={height} className="overflow-visible" />
      <TooltipDiv />
    </div>
  );
};

// ==========================================
// 3. Comorbidity Physics Force Graph (D3)
// ==========================================
interface ForceNode extends d3.SimulationNodeDatum {
  id: string;
  value: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface ForceLink extends d3.SimulationLinkDatum<ForceNode> {
  source: string | ForceNode;
  target: string | ForceNode;
  value: number;
}

interface ComorbidityForceGraphProps {
  data: {
    nodes: { id: string; value: number }[];
    links: { source: string; target: string; value: number }[];
  };
}

const ComorbidityForceGraph = ({ data }: ComorbidityForceGraphProps) => {
  const { ref, width } = useResizeObserver();
  const svgRef = useRef<SVGSVGElement>(null);
  const { show, hide, TooltipDiv } = useChartTooltip();
  const height = 280;

  useEffect(() => {
    if (!svgRef.current || !data?.nodes?.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const innerWidth = width;
    const innerHeight = height;

    const nodes: ForceNode[] = data.nodes.map(d => ({ ...d }));
    const links: ForceLink[] = data.links.map(d => ({ ...d }));

    const maxVal = d3.max(nodes, d => d.value) || 1;
    const radiusScale = d3.scaleSqrt()
      .domain([1, maxVal])
      .range([12, 30]);

    const linkForce = d3.forceLink<ForceNode, ForceLink>(links)
      .id(d => d.id)
      .distance(110);

    const simulation = d3.forceSimulation<ForceNode>(nodes)
      .force('link', linkForce)
      .force('charge', d3.forceManyBody().strength(-160))
      .force('center', d3.forceCenter(innerWidth / 2, innerHeight / 2))
      .force('collision', d3.forceCollide<ForceNode>().radius(d => radiusScale(d.value) + 10));

    const linkedByIndex: Record<string, boolean> = {};
    links.forEach(d => {
      const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
      const targetId = typeof d.target === 'object' ? d.target.id : d.target;
      linkedByIndex[`${sourceId},${targetId}`] = true;
      linkedByIndex[`${targetId},${sourceId}`] = true;
    });

    function isConnected(a: string, b: string) {
      return a === b || linkedByIndex[`${a},${b}`];
    }

    // Links lines
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', 'rgba(59,130,246,0.15)')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.max(d.value * 2.5, 1.5));

    // Nodes elements
    const node = svg.append('g')
      .selectAll('.node-group')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .call(d3.drag<SVGGElement, ForceNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any
      );

    // Glowing circle bubbles
    node.append('circle')
      .attr('r', d => radiusScale(d.value))
      .attr('fill', '#FFFFFF')
      .attr('stroke', (d) => {
        const idLower = d.id.toLowerCase();
        if (idLower.includes('tb')) return '#10B981';
        if (idLower.includes('no cond')) return '#F5A623';
        if (idLower.includes('other')) return '#3B82F6';
        if (idLower.includes('anemia') || idLower.includes('malnutrition')) return '#EF4444';
        return '#8B5CF6';
      })
      .attr('stroke-width', 2)
      .style('cursor', 'grab')
      .style('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05))')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('stroke-width', 3.5)
          .attr('fill', '#F8FAFC');

        svg.selectAll('.node-group circle').transition().duration(150)
          .attr('opacity', o => isConnected(d.id, (o as ForceNode).id) ? 1 : 0.25);
        
        svg.selectAll('.node-group text').transition().duration(150)
          .attr('opacity', o => isConnected(d.id, (o as ForceNode).id) ? 1 : 0.25);

        link.transition().duration(150)
          .attr('stroke-opacity', o => {
            const sId = typeof o.source === 'object' ? (o.source as ForceNode).id : o.source;
            const tId = typeof o.target === 'object' ? (o.target as ForceNode).id : o.target;
            return sId === d.id || tId === d.id ? 1.0 : 0.08;
          })
          .attr('stroke', o => {
            const sId = typeof o.source === 'object' ? (o.source as ForceNode).id : o.source;
            const tId = typeof o.target === 'object' ? (o.target as ForceNode).id : o.target;
            return sId === d.id || tId === d.id ? '#3B82F6' : 'rgba(59,130,246,0.15)';
          });

        show(`<strong>${d.id}</strong><br/>Cohort Cases: ${d.value}`, event);
      })
      .on('mousemove', function(event, d) {
        show(`<strong>${d.id}</strong><br/>Cohort Cases: ${d.value}`, event);
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('stroke-width', 2)
          .attr('fill', '#FFFFFF');

        svg.selectAll('.node-group circle').transition().duration(150).attr('opacity', 1);
        svg.selectAll('.node-group text').transition().duration(150).attr('opacity', 1);
        link.transition().duration(150)
          .attr('stroke-opacity', 0.6)
          .attr('stroke', 'rgba(59,130,246,0.15)');

        hide();
      });

    // Node labels inside bubbles
    node.append('text')
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'Inter, sans-serif')
      .attr('fill', '#0F172A')
      .attr('pointer-events', 'none')
      .text(d => d.id.length > 9 ? d.id.substring(0, 8) + '..' : d.id);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as ForceNode).x || 0)
        .attr('y1', d => (d.source as ForceNode).y || 0)
        .attr('x2', d => (d.target as ForceNode).x || 0)
        .attr('y2', d => (d.target as ForceNode).y || 0);

      node.attr('transform', d => {
        const r = radiusScale(d.value) + 2;
        d.x = Math.max(r, Math.min(innerWidth - r, d.x || 0));
        d.y = Math.max(r, Math.min(innerHeight - r, d.y || 0));
        return `translate(${d.x}, ${d.y})`;
      });
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data, width]);

  return (
    <div ref={ref} className="relative w-full">
      <svg ref={svgRef} width={width} height={height} className="overflow-visible" />
      <TooltipDiv />
    </div>
  );
};

// ==========================================
// 4. Appetite Radar Spider Web Chart (D3)
// ==========================================
interface AppetiteRadarChartProps {
  data: { name: string; value: number }[];
}

const AppetiteRadarChart = ({ data }: AppetiteRadarChartProps) => {
  const { ref, width } = useResizeObserver();
  const svgRef = useRef<SVGSVGElement>(null);
  const { show, hide, TooltipDiv } = useChartTooltip();
  const height = 240;

  useEffect(() => {
    if (!svgRef.current || !data?.length) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.min(width, height) / 2 - 40;

    const color = '#3B82F6'; // Blue

    const defs = svg.append('defs');
    const radarGrad = defs.append('radialGradient')
      .attr('id', 'radar-gradient')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', maxR)
      .attr('gradientUnits', 'userSpaceOnUse');
    
    radarGrad.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.25);
    
    radarGrad.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.02);

    const g = svg.append('g')
      .attr('transform', `translate(${cx}, ${cy})`);

    const maxVal = d3.max(data, d => d.value) || 1;
    const rScale = d3.scaleLinear()
      .domain([0, maxVal])
      .range([0, maxR]);

    const numAxes = data.length;
    const angleSlice = (Math.PI * 2) / numAxes;

    // Grid ticks
    const ticks = [0.25, 0.5, 0.75, 1];
    ticks.forEach(t => {
      const radius = maxR * t;
      const points = data.map((_, i) => {
        const x = radius * Math.sin(i * angleSlice);
        const y = -radius * Math.cos(i * angleSlice);
        return `${x},${y}`;
      }).join(' ');

      g.append('polygon')
        .attr('points', points)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(0,0,0,0.05)')
        .attr('stroke-width', 1);

      g.append('text')
        .attr('x', 5)
        .attr('y', -radius + 3)
        .attr('fill', '#64748B')
        .attr('font-size', '8px')
        .attr('font-family', 'Inter, sans-serif')
        .text(Math.round(maxVal * t));
    });

    // Radial axis lines
    const axis = g.selectAll('.axis')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'axis');

    axis.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d, i) => rScale(maxVal) * Math.sin(i * angleSlice))
      .attr('y2', (d, i) => -rScale(maxVal) * Math.cos(i * angleSlice))
      .attr('stroke', 'rgba(0,0,0,0.06)')
      .attr('stroke-width', 1);

    // Labels
    axis.append('text')
      .attr('x', (d, i) => rScale(maxVal * 1.15) * Math.sin(i * angleSlice))
      .attr('y', (d, i) => -rScale(maxVal * 1.15) * Math.cos(i * angleSlice))
      .attr('text-anchor', (d, i) => {
        const sin = Math.sin(i * angleSlice);
        if (Math.abs(sin) < 0.1) return 'middle';
        return sin > 0 ? 'start' : 'end';
      })
      .attr('dy', (d, i) => {
        const cos = Math.cos(i * angleSlice);
        return cos > 0.8 ? '0.9em' : cos < -0.8 ? '-0.4em' : '0.35em';
      })
      .attr('fill', '#334155')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .attr('font-family', 'Inter, sans-serif')
      .text(d => d.name);

    // Radar radial line
    const radarLine = d3.lineRadial<any>()
      .radius(d => rScale(d.value))
      .angle((d, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    g.append('path')
      .datum(data)
      .attr('d', radarLine)
      .attr('fill', 'url(#radar-gradient)')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('fill-opacity', 0)
      .transition()
      .duration(750)
      .attr('fill-opacity', 1);

    // Dots
    g.selectAll('.radar-dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'radar-dot')
      .attr('cx', (d, i) => rScale(d.value) * Math.sin(i * angleSlice))
      .attr('cy', (d, i) => -rScale(d.value) * Math.cos(i * angleSlice))
      .attr('r', 4)
      .attr('fill', '#FFFFFF')
      .attr('stroke', color)
      .attr('stroke-width', 1.5)
      .on('mouseenter', function(event, d) {
        d3.select(this).transition().duration(150).attr('r', 6).attr('fill', color);
        show(`<strong>${d.name}</strong><br/>Cases: ${d.value}`, event);
      })
      .on('mousemove', function(event, d) {
        show(`<strong>${d.name}</strong><br/>Cases: ${d.value}`, event);
      })
      .on('mouseleave', function() {
        d3.select(this).transition().duration(150).attr('r', 4).attr('fill', '#FFFFFF');
        hide();
      });

  }, [data, width]);

  return (
    <div ref={ref} className="relative w-full flex justify-center">
      <svg ref={svgRef} width={width} height={height} className="overflow-visible" />
      <TooltipDiv />
    </div>
  );
};

// ==========================================
// 5. Main Health Analytics Component
// ==========================================
export function HealthAnalytics() {
  const { records, dataLoading } = useStore();

  const healthData = useMemo(() => {
    const vlCounts: Record<string, number> = {
      'Undetectable (Excellent)': 0,
      'Suppressed (Good)': 0,
      'Unsuppressed - Monitor': 0,
      'High Viral Load - Urgent Review': 0,
      'Test Not Done': 0
    };

    const appetiteCounts: Record<string, number> = {
      'good': 0,
      'reduced': 0,
      'poor': 0
    };

    const hbCounts: Record<string, number> = {
      'Severe Anaemia': 0,
      'Moderate Anaemia': 0,
      'Mild Anaemia': 0,
      'Normal': 0,
      'High - Review Advised': 0
    };

    const comorbidityCounts: Record<string, number> = {};
    const cooccurrences: Record<string, number> = {};
    
    let totalChildren = records.length;
    let criticalHiv = 0;
    let criticalAnaemia = 0;
    let totalHb = 0;
    let countedHb = 0;

    records.forEach((r) => {
      // 1. Viral Load Category
      const vlCat = r.bmicategory || 'Test Not Done'; // Fallback mapping
      if (vlCat in vlCounts) {
        vlCounts[vlCat]++;
      } else {
        vlCounts['Test Not Done']++;
      }

      // 2. Appetite
      const app = (r.appetite || '').toLowerCase();
      if (app in appetiteCounts) {
        appetiteCounts[app]++;
      } else {
        appetiteCounts['good']++;
      }

      // 3. Hemoglobin
      const hb = r.hemoglobin || 0;
      if (hb > 0) {
        totalHb += hb;
        countedHb++;
      }

      const hbCat = r.hb_category || 'Normal';
      if (hbCat in hbCounts) {
        hbCounts[hbCat]++;
      } else {
        hbCounts['Normal']++;
      }

      if (hbCat.includes('Severe') || (hb > 0 && hb < 7)) {
        criticalAnaemia++;
      }
    });

    const vlChartData = Object.entries(vlCounts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);

    const appetiteChartData = Object.entries(appetiteCounts).map(([name, value]) => ({ 
      name: name === 'good' ? 'Good Appetite' : name === 'reduced' ? 'Reduced Appetite' : 'Poor Appetite', 
      value 
    })).filter(item => item.value > 0);
    
    const hbChartData = Object.entries(hbCounts).map(([name, count]) => ({ name, count }));
    
    // Nodes
    const comorbidityNodes = [
      { id: 'Tuberculosis', value: records.filter(r => r.comorbidities?.includes('TB')).length },
      { id: 'Malnutrition', value: records.filter(r => r.bmicategory?.includes('Underweight')).length },
      { id: 'Anaemia', value: criticalAnaemia },
      { id: 'None', value: records.filter(r => !r.comorbidities).length }
    ].filter(n => n.value > 0);

    const averageHb = countedHb > 0 ? (totalHb / countedHb).toFixed(1) : 'N/A';

    return {
      vlChartData,
      appetiteChartData,
      hbChartData,
      comorbidityGraph: { nodes: comorbidityNodes, links: [] },
      criticalHiv,
      criticalAnaemia,
      averageHb,
      totalChildren
    };
  }, [records]);

  if (dataLoading && records.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="font-mono text-slate-400">Loading clinical metrics...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          Health & HIV Analytics
        </h2>
        <p className="font-sans text-xs text-slate-500">
          Clinical tracking parameters, viral load suppression rates, and comorbidity breakdowns
        </p>
      </div>

      {/* Clinical KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="font-sans text-xs text-slate-500 font-semibold">
              Critical Cases
            </span>
            <span className="font-mono text-2xl font-bold text-red-500">
              {healthData.criticalAnaemia}
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="font-sans text-xs text-slate-500 font-semibold">
              Total Cohort Size
            </span>
            <span className="font-mono text-2xl font-bold text-blue-500">
              {healthData.totalChildren}
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="font-sans text-xs text-slate-500 font-semibold">
              Average Hemoglobin (Hb)
            </span>
            <span className="font-mono text-2xl font-bold text-emerald-500">
              {healthData.averageHb} <span className="text-xs font-sans font-medium text-slate-400">g/dL</span>
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
            <Heart className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4 shadow-sm">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-800">
              BMI Status Distribution (D3 Bullet)
            </h3>
            <span className="font-sans text-[10px] text-slate-400">
              Overview of BMI categories within the child nutrition cohort
            </span>
          </div>
          <div className="w-full">
            {healthData.vlChartData.length === 0 ? (
              <p className="font-sans text-xs text-slate-400 py-8 text-center">No BMI data recorded.</p>
            ) : (
              <ChartErrorBoundary fallback={<div className="text-slate-400 text-center py-8">Failed to render BMI chart.</div>}>
                <ViralLoadBulletChart data={healthData.vlChartData} />
              </ChartErrorBoundary>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4 shadow-sm">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-800">
              Hemoglobin Classification Spread (D3 Diverging)
            </h3>
            <span className="font-sans text-[10px] text-slate-400">
              Severe, moderate, mild anemia (left) vs normal and high ranges (right)
            </span>
          </div>
          <div className="w-full">
            <ChartErrorBoundary fallback={<div className="text-slate-400 text-center py-8">Failed to render Hemoglobin chart.</div>}>
              <HemoglobinDivergingChart data={healthData.hbChartData} />
            </ChartErrorBoundary>
          </div>
        </div>
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4 shadow-sm">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-800">
              Nutritional Appetite Status (D3 Radar Web)
            </h3>
            <span className="font-sans text-[10px] text-slate-400">
              Appetite metrics reported during case worker home screenings
            </span>
          </div>
          <div className="w-full">
            {healthData.appetiteChartData.length === 0 ? (
              <p className="font-sans text-xs text-slate-400 py-8 text-center">No appetite details recorded.</p>
            ) : (
              <ChartErrorBoundary fallback={<div className="text-slate-400 text-center py-8">Failed to render Appetite chart.</div>}>
                <AppetiteRadarChart data={healthData.appetiteChartData} />
              </ChartErrorBoundary>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-4 shadow-sm">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-800">
              Comorbidities breakdown
            </h3>
            <span className="font-sans text-[10px] text-slate-400">
              Concurrent health conditions affecting the cohort
            </span>
          </div>
          <div className="w-full">
            {healthData.comorbidityGraph.nodes.length === 0 ? (
              <p className="font-sans text-xs text-slate-400 py-8 text-center">No comorbidities reported in the cohort.</p>
            ) : (
              <div className="flex flex-col gap-3 py-4">
                {healthData.comorbidityGraph.nodes.map(node => (
                  <div key={node.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-semibold text-xs text-slate-700">{node.id}</span>
                    <span className="font-mono text-xs font-bold text-slate-800">{node.value} cases</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthAnalytics;
