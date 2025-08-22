import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CircleDollarSign, Clock, Wallet, PieChart, CreditCard } from "lucide-react";

interface PaymentsSummaryCardsProps {
  activeExpenses: any[];
  invoices: any[];
  financialSummary: any;
  nextPaymentDue: any;
  formatDate: (date: string) => string;
}

export function PaymentsSummaryCards({
  activeExpenses,
  invoices,
  financialSummary,
  nextPaymentDue,
  formatDate
}: PaymentsSummaryCardsProps) {
  const totalCurrentExpenses = activeExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const totalOutstandingInvoices = (invoices || [])
    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-black/20 border border-siso-text/10 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
            <CreditCard className="h-4 w-4 text-siso-orange" />
            Total Current Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-white">{activeExpenses[0]?.currency || '£'} {totalCurrentExpenses.toFixed(2)}</p>
          <p className="text-xs text-gray-300">Monthly recurring expenses</p>
        </CardContent>
      </Card>
      
      <Card className="bg-black/20 border border-siso-text/10 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
            <Wallet className="h-4 w-4 text-siso-orange" />
            Outstanding Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-white">£ {totalOutstandingInvoices.toFixed(2)}</p>
          <p className="text-xs text-gray-300">
            {invoices?.filter(i => i.status === 'pending' || i.status === 'overdue').length || 0} pending invoices
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-black/20 border border-siso-text/10 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
            <PieChart className="h-4 w-4 text-siso-orange" />
            Total App Cost
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-white">£ {(financialSummary?.totalExpenses || 0).toFixed(2)}</p>
          <p className="text-xs text-gray-300">Total investment to date</p>
        </CardContent>
      </Card>
      
      <Card className="bg-black/20 border border-siso-text/10 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
            <Clock className="h-4 w-4 text-siso-orange" />
            Next Payment Due
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nextPaymentDue ? (
            <>
              <p className="text-2xl font-bold text-white">{formatDate(nextPaymentDue.due_date)}</p>
              <p className="text-xs text-gray-300">
                £{nextPaymentDue.amount.toFixed(2)} ({nextPaymentDue.invoice_number})
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-white">No payments due</p>
              <p className="text-xs text-gray-300">All invoices are paid</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
