
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { ArrowRightIcon } from 'lucide-react';

interface FunnelStats {
  total: number;
  contacted: number;
  converted: number;
  pending: number;
  conversionRate: number;
}

interface LeadsFunnelChartProps {
  stats: FunnelStats;
}

export function LeadsFunnelChart({ stats }: LeadsFunnelChartProps) {
  const data = [
    { name: 'New Leads', value: stats.pending, color: '#f59e0b' },
    { name: 'Contacted', value: stats.contacted, color: '#3b82f6' },
    { name: 'Converted', value: stats.converted, color: '#10b981' },
  ];

  return (
    <div className="h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={240}
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
          layout="vertical"
        >
          <XAxis type="number" domain={[0, 'dataMax + 5']} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 14 }}
            axisLine={false}
            tickLine={false}
            width={100}
          />
          <Tooltip
            formatter={(value) => [`${value} Leads`, '']}
            labelStyle={{ color: '#111827' }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
          />
          <Bar dataKey="value" minPointSize={2} barSize={30} radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="flex items-center justify-center mt-2 text-sm text-muted-foreground">
        <span className="font-medium">Conversion Rate:</span>
        <span className="ml-1 text-green-500 font-bold">{stats.conversionRate}%</span>
        <ArrowRightIcon className="mx-2 h-4 w-4" />
        <span className="font-medium">Funnel Efficiency:</span>
        <span className="ml-1 font-medium">{stats.converted}/{stats.total} Leads</span>
      </div>
    </div>
  );
}
