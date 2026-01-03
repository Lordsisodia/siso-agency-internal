
import { FinancialSummary } from '../types';

/**
 * Creates monthly revenue data suitable for charts
 */
export function createMonthlyRevenueData(
  data: { [key: string]: { revenue: number; expense: number } },
  monthNames: string[]
) {
  return Object.entries(data)
    .map(([date, values]) => {
      // For monthly view (with days)
      if (date.split('-').length === 3) {
        const [year, month, day] = date.split('-').map(Number);
        return {
          name: `${day}/${month}`,
          revenue: values.revenue,
          expense: values.expense
        };
      }
      // For yearly view (with months)
      else {
        const [year, month] = date.split('-').map(Number);
        return {
          name: monthNames[month - 1],
          revenue: values.revenue,
          expense: values.expense
        };
      }
    })
    .sort((a, b) => {
      // Ensure proper sorting by date
      const aDate = a.name.split('/');
      const bDate = b.name.split('/');
      
      // If it's in day/month format
      if (aDate.length > 1 && bDate.length > 1) {
        const aMonth = parseInt(aDate[1]);
        const bMonth = parseInt(bDate[1]);
        if (aMonth !== bMonth) return aMonth - bMonth;
        
        const aDay = parseInt(aDate[0]);
        const bDay = parseInt(bDate[0]);
        return aDay - bDay;
      }
      
      // If it's in month name format
      return monthNames.indexOf(a.name) - monthNames.indexOf(b.name);
    });
}

/**
 * Calculates profit margin percentage
 */
export function calculateProfitMargin(revenue: number, expenses: number): number {
  if (revenue === 0) return 0;
  return ((revenue - expenses) / revenue) * 100;
}

/**
 * Creates default summary with zero values
 */
export function createDefaultSummary(): FinancialSummary {
  return {
    totalRevenue: 0,
    totalExpenses: 0,
    profitMargin: 0,
    outstandingAmount: 0,
    revenueByMonth: []
  };
}
