import { useState, useEffect } from 'react';
import { FinancialLayout } from '@/components/layout/FinancialLayout';
import { useQuery } from '@tanstack/react-query';
import { fetchInvoices, fetchInvoiceById } from '@/utils/financial/invoicesApi';
import { fetchTransactions, getFinancialSummary } from '@/utils/financial';
import { TotalCostCard } from '@/components/admin/financials/TotalCostCard';
import { ExpensesTimeline } from '@/components/admin/financials/ExpensesTimeline';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Wallet, FileText, AlertCircle, Download, CreditCard, 
  Clock, DownloadCloud, Filter, ChevronDown, PieChart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Invoice, FinancialTransaction } from '@/utils/financial/types';
import { PaymentsSummaryCards } from '@/components/admin/financials/payments/PaymentsSummaryCards';
import { PaymentsHeader } from '@/components/admin/financials/payments/PaymentsHeader';
import { PaymentMethodsSection } from '@/components/admin/financials/payments/PaymentMethodsSection';
import { ExpenseCreditCard } from '@/components/admin/financials/ExpenseCreditCard';
import { PaymentProgress } from '@/components/admin/financials/payments/PaymentProgress';
import { InvoiceManagement } from '@/components/admin/financials/payments/InvoiceManagement';
import { TokenUsageTracker } from '@/components/admin/financials/payments/TokenUsageTracker';

export default function PaymentsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Fetch invoices
  const { 
    data: invoices, 
    isLoading: isLoadingInvoices, 
    error: invoicesError 
  } = useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
  });

  // Fetch transactions for expenses
  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    error: transactionsError
  } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });

  // Fetch financial summary
  const {
    data: financialSummary,
    isLoading: isLoadingSummary,
    error: summaryError
  } = useQuery({
    queryKey: ['financialSummary'],
    queryFn: () => getFinancialSummary('month'),
  });

  const isLoading = isLoadingInvoices || isLoadingTransactions || isLoadingSummary;
  const error = invoicesError || transactionsError || summaryError;
  
  // Filter active expenses (paid by agency for client)
  const activeExpenses = transactions?.filter(tx => 
    tx.type === 'expense' && tx.status === 'completed'
  ) || [];
  
  // Calculate upcoming payments (due in next 7 days)
  const upcomingPayments = invoices?.filter(invoice => {
    if (invoice.status !== 'pending' && invoice.status !== 'overdue') return false;
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }) || [];
  
  // Group expenses by category
  const expensesByCategory = activeExpenses.reduce((acc, expense) => {
    const category = expense.category?.name || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(expense);
    return acc;
  }, {} as Record<string, FinancialTransaction[]>);
  
  // Calculate totals
  const totalCurrentExpenses = activeExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalOutstandingInvoices = (invoices || [])
    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + Number(inv.amount), 0);
  
  // Find next payment due
  const nextPaymentDue = upcomingPayments.length > 0 
    ? upcomingPayments.reduce((earliest, inv) => {
        return new Date(inv.due_date) < new Date(earliest.due_date) ? inv : earliest;
      }) 
    : null;

  const handlePayNow = (invoice: Invoice) => {
    toast({
      title: "Payment Initiated",
      description: `Processing payment for invoice ${invoice.invoice_number}`,
    });
    // Here you would implement actual payment processing
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: "Downloading Invoice",
      description: "Your invoice will begin downloading shortly.",
    });
    // Here you would implement the download functionality
  };

  const handleDownloadAll = () => {
    toast({
      title: "Downloading All Invoices",
      description: "Your invoices will begin downloading shortly.",
    });
    // Here you would implement batch download functionality
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      'Hosting': 'bg-blue-500',
      'Software': 'bg-purple-500',
      'API Services': 'bg-green-500',
      'Infrastructure': 'bg-orange-500',
      'Support': 'bg-cyan-500',
      'Development': 'bg-indigo-500',
    };
    
    return categoryColors[category] || 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Calculate total current costs from expenses
  const totalCurrentCosts = activeExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  // Calculate predicted costs (recurring expenses for the next month)
  const predictedMonthlyCosts = activeExpenses
    .filter(expense => expense.recurring_type === 'monthly')
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  // Calculate total of upcoming expenses
  const upcomingExpensesTotal = upcomingPayments.reduce((total, invoice) => total + invoice.amount, 0);

  // Define the total project cost and paid amount
  const totalProjectCost = 4000; // £4,000 total cost
  const paidAmount = 500; // £500 paid so far
  
  return (
    <FinancialLayout title="Payments & Billing">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ExpenseCreditCard 
          currentCosts={totalCurrentCosts}
          predictedCosts={predictedMonthlyCosts}
        />
        <ExpensesTimeline expenses={activeExpenses} />
      </div>

      <PaymentsHeader handleDownloadAll={handleDownloadAll} />

      {upcomingPayments.length > 0 && (
        <Card className="mb-6 bg-amber-900/20 border border-amber-400/50">
          <div className="p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-amber-400 mr-2" />
            <span className="text-amber-200 font-medium">
              {`£${upcomingExpensesTotal.toFixed(2)} in upcoming expenses due in the next 7 days`}
            </span>
          </div>
        </Card>
      )}

      <Tabs defaultValue="overview" className="mt-6" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payment_methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="token_usage">Token Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-siso-orange"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-siso-text">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-siso-red" />
              <p>There was an error loading your financial data.</p>
            </div>
          ) : (
            <>
        <PaymentsSummaryCards
          activeExpenses={activeExpenses}
          invoices={invoices}
          financialSummary={financialSummary}
          nextPaymentDue={nextPaymentDue}
          formatDate={formatDate}
        />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <PaymentProgress 
                  totalAmount={totalProjectCost}
                  paidAmount={paidAmount}
                />
                
                <Card className="bg-black/20 border border-siso-text/10 backdrop-blur-sm">
        <CardHeader>
                    <CardTitle className="text-lg text-white">Upcoming Payments</CardTitle>
        </CardHeader>
        <CardContent>
                    {upcomingPayments.length > 0 ? (
          <div className="space-y-4">
                        {upcomingPayments.slice(0, 3).map(invoice => (
                          <div key={invoice.id} className="flex items-center justify-between p-4 border border-siso-text/10 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-siso-orange/20 rounded-full">
                                <Clock className="h-4 w-4 text-siso-orange" />
            </div>
                <div>
                                <p className="font-medium text-white">{invoice.invoice_number}</p>
                                <p className="text-sm text-gray-300">Due {formatDate(invoice.due_date)}</p>
              </div>
            </div>
                <div>
                              <Badge variant="outline" className={getStatusBadgeClass(invoice.status)}>
                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                              </Badge>
              </div>
            </div>
                        ))}
                </div>
                    ) : (
                      <div className="text-center py-4 text-white">
                        <p>No upcoming payments due</p>
              </div>
                    )}
        </CardContent>
      </Card>
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="invoices">
          <InvoiceManagement 
            invoices={invoices || []}
            onView={(invoice) => {
              toast({
                title: "Invoice Details",
                description: `Viewing invoice ${invoice.invoice_number}`,
              });
            }}
            onDownload={handleDownloadInvoice}
          />
        </TabsContent>
        
        <TabsContent value="payment_methods">
          <PaymentMethodsSection />
        </TabsContent>
        
        <TabsContent value="token_usage">
          <TokenUsageTracker totalTokens={800} />
        </TabsContent>
      </Tabs>
      </FinancialLayout>
  );
}
