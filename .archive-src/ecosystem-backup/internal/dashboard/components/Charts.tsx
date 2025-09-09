
import { ResponsiveContainer, AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

type ChartData = {
  name: string;
  revenue: number;
  expense: number;
};

interface AreaChartProps {
  data: ChartData[];
}

export function AreaChart({ data }: AreaChartProps) {
  // If no data is provided, create some placeholder data
  const chartData = data.length > 0 ? data : [
    { name: 'Jan', revenue: 0, expense: 0 },
    { name: 'Feb', revenue: 0, expense: 0 },
    { name: 'Mar', revenue: 0, expense: 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RechartsAreaChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#111827', 
            border: '1px solid #374151',
            borderRadius: '6px'
          }} 
          labelStyle={{ color: '#F9FAFB' }} 
        />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stroke="#10B981" 
          fillOpacity={1} 
          fill="url(#colorRevenue)" 
          name="Revenue"
        />
        <Area 
          type="monotone" 
          dataKey="expense" 
          stroke="#EF4444" 
          fillOpacity={1} 
          fill="url(#colorExpense)"
          name="Expense" 
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
