import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle } from "lucide-react";
import { FinancialTransaction } from "@/utils/financial";

interface ExpensesTimelineProps {
  expenses: FinancialTransaction[];
}

export function ExpensesTimeline({ expenses }: ExpensesTimelineProps) {
  // Sort expenses by date
  const sortedExpenses = [...expenses].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  // Get upcoming expenses (next 30 days)
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const upcomingExpenses = sortedExpenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= today && expenseDate <= thirtyDaysFromNow;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card className="bg-black/20 border border-siso-text/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2 text-white">
          <Clock className="h-5 w-5 text-siso-orange" />
          Upcoming Expenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingExpenses.length > 0 ? (
          <div className="space-y-4">
            {upcomingExpenses.map((expense) => (
              <div 
                key={expense.id}
                className="flex items-center justify-between p-3 rounded-lg border border-siso-text/10 hover:bg-siso-text/5 transition-colors"
              >
                <div>
                  <p className="font-medium text-white">{expense.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-300">Due: {formatDate(expense.date)}</p>
                    {expense.recurring_type && (
                      <Badge variant="outline" className="bg-blue-100/10 text-blue-400 border-blue-400/20">
                        {expense.recurring_type}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="font-bold text-white">£{expense.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-white">
            No upcoming expenses in the next 30 days
          </div>
        )}
      </CardContent>
    </Card>
  );
}
