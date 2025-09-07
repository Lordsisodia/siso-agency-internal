
import { supabase } from '@/integrations/supabase/client';
import { FinancialSummary } from './types';
import { SummaryPeriod, SummaryFilters } from './types/summaryTypes';
import { createMonthlyRevenueData, calculateProfitMargin, createDefaultSummary } from './utils/summaryTransformers';

/**
 * Fetches financial summary data
 */
export async function getFinancialSummary(period: SummaryPeriod = 'month', filters: SummaryFilters = {}): Promise<FinancialSummary> {
  try {
    // Calculate date range based on period
    const today = new Date();
    let startDate: Date;
    
    if (period === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else { // year
      startDate = new Date(today.getFullYear(), 0, 1);
    }
    
    // Format dates for Supabase query
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = today.toISOString().split('T')[0];
    
    // Fetch revenue transactions
    const { data: revenueData, error: revenueError } = await supabase
      .from('financial_transactions')
      .select('amount, date')
      .eq('type', 'revenue')
      .gte('date', startDateStr)
      .lte('date', endDateStr);
      
    if (revenueError) throw revenueError;
    
    // Fetch expense transactions
    const { data: expenseData, error: expenseError } = await supabase
      .from('financial_transactions')
      .select('amount, date')
      .eq('type', 'expense')
      .gte('date', startDateStr)
      .lte('date', endDateStr);
      
    if (expenseError) throw expenseError;
    
    // Fetch outstanding invoices
    const { data: outstandingInvoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('amount')
      .eq('status', 'pending');
      
    if (invoicesError) throw invoicesError;
    
    // Calculate totals
    const totalRevenue = (revenueData || []).reduce((sum, item) => sum + Number(item.amount), 0);
    const totalExpenses = (expenseData || []).reduce((sum, item) => sum + Number(item.amount), 0);
    const outstandingAmount = (outstandingInvoices || []).reduce((sum, item) => sum + Number(item.amount), 0);
    const profitMargin = calculateProfitMargin(totalRevenue, totalExpenses);
    
    // Group transactions by month for chart data
    const transactionsByMonth: { [key: string]: { revenue: number; expense: number } } = {};
    
    // Initialize with empty data for all months in range
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (period === 'month') {
      // For monthly view, initialize days
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const day = i < 10 ? `0${i}` : `${i}`;
        transactionsByMonth[`${today.getFullYear()}-${today.getMonth() + 1}-${day}`] = { revenue: 0, expense: 0 };
      }
    } else {
      // For yearly view, initialize months
      for (let i = 0; i < 12; i++) {
        const month = i + 1 < 10 ? `0${i + 1}` : `${i + 1}`;
        transactionsByMonth[`${today.getFullYear()}-${month}`] = { revenue: 0, expense: 0 };
      }
    }
    
    // Process revenue data
    (revenueData || []).forEach(item => {
      const date = new Date(item.date);
      const key = period === 'month' 
        ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
        : `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? '0' : ''}${date.getMonth() + 1}`;
      
      if (!transactionsByMonth[key]) {
        transactionsByMonth[key] = { revenue: 0, expense: 0 };
      }
      
      transactionsByMonth[key].revenue += Number(item.amount);
    });
    
    // Process expense data
    (expenseData || []).forEach(item => {
      const date = new Date(item.date);
      const key = period === 'month' 
        ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
        : `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? '0' : ''}${date.getMonth() + 1}`;
      
      if (!transactionsByMonth[key]) {
        transactionsByMonth[key] = { revenue: 0, expense: 0 };
      }
      
      transactionsByMonth[key].expense += Number(item.amount);
    });
    
    // Convert to array format for charts and sort by date
    const revenueByMonth = createMonthlyRevenueData(transactionsByMonth, monthNames);
    
    return {
      totalRevenue,
      totalExpenses,
      profitMargin,
      outstandingAmount,
      revenueByMonth
    };
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    return createDefaultSummary();
  }
}
