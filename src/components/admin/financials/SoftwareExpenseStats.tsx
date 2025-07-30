import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialTransaction } from "@/utils/financial";
import { getExpensesByCategory, SOFTWARE_CATEGORIES } from "@/utils/financial/expenseCategories"; 
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/formatters";

interface SoftwareExpenseStatsProps {
  expenses: FinancialTransaction[];
}

interface CategoryData {
  total: number;
  count: number;
  expenses: FinancialTransaction[];
}

export function SoftwareExpenseStats({ expenses }: SoftwareExpenseStatsProps) {
  const categorizedExpenses = getExpensesByCategory(expenses);
  
  // Filter only software categories
  const softwareCategories = Object.values(SOFTWARE_CATEGORIES);
  const softwareExpenses = Object.entries(categorizedExpenses)
    .filter(([category]) => softwareCategories.includes(category))
    .map(([category, data]) => ({
      name: category,
      value: (data as CategoryData).total,
      count: (data as CategoryData).count
    }))
    .sort((a, b) => b.value - a.value);
  
  // Calculate total software expense
  const totalSoftwareExpense = softwareExpenses.reduce((sum, item) => sum + item.value, 0);
  
  // Colors for the pie chart - SISO theme colors
  const COLORS = [
    '#FFA726', '#FF5722', '#FF8A65', '#FFCC80', '#FFB74D', 
    '#FF7043', '#FFAB40', '#FFB300', '#FF6F00', '#E65100'
  ];

  return (
    <Card className="bg-siso-bg-alt border-siso-border">
      <CardHeader>
        <CardTitle className="text-lg text-siso-text-bold">Software Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-siso-text-muted">Total Software Expenses</p>
            <p className="text-2xl font-bold text-siso-text-bold">{formatCurrency(totalSoftwareExpense, "GBP")}</p>
          </div>
          <div>
            <p className="text-sm text-siso-text-muted">Categories</p>
            <p className="text-lg text-siso-text-bold">{softwareExpenses.length}</p>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={softwareExpenses}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#FFA726"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {softwareExpenses.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatCurrency(value as number, "GBP")} 
                contentStyle={{ 
                  backgroundColor: '#1C1C1E', 
                  border: '1px solid #FFA726', 
                  borderRadius: '8px',
                  color: '#FFFFFF'
                }}
              />
              <Legend 
                wrapperStyle={{ color: '#FFFFFF' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-2 mt-4">
          {softwareExpenses.map((category, index) => (
            <div key={category.name} className="flex justify-between items-center">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                />
                <span className="text-sm text-siso-text">{category.name}</span>
              </div>
              <div className="text-sm font-medium text-siso-text-bold">
                {formatCurrency(category.value, "GBP")}
                <span className="text-xs text-siso-text-muted ml-1">({category.count})</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
