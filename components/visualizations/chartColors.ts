import * as d3 from 'd3';

export const COLORS = {
  jade:   '#3B82F6', // Blue accent for awards light aesthetic
  amber:  '#F5A623',
  rose:   '#EF4444', // Sleek red
  blue:   '#3B82F6',
  purple: '#8B5CF6',
  mint:   '#F8FAFC', // Light theme slate-50
  canvas: '#FFFFFF', // Clean white
  glass:  'rgba(0,0,0,0.02)',
};

export const STATUS_COLOR: Record<string, string> = {
  'Approved':        '#10B981', // green-500
  'Pending Review':  '#F5A623', // amber-500
  'Critical Case':   '#EF4444', // red-500
};

export const categorical = d3.scaleOrdinal<string, string>()
  .domain(['jade', 'amber', 'rose', 'blue', 'purple'])
  .range([COLORS.jade, COLORS.amber, COLORS.rose, COLORS.blue, COLORS.purple]);
