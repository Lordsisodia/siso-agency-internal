import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FinancialTransaction } from "@/utils/financial";
import { formatCurrency } from "@/lib/formatters";
import { Clock, Check, AlertCircle, Calendar, ArrowRight, PlusCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateExpenseDialog } from "./expense/CreateExpenseDialog";

interface FinancialPipelineProps {
  expenses: FinancialTransaction[];
  revenues: FinancialTransaction[];
  isLoading: boolean;
  onDataChange: () => Promise<void>;
}

export function FinancialPipeline({ expenses, revenues, isLoading, onDataChange }: FinancialPipelineProps) {
  const [pipelineView, setPipelineView] = useState<"kanban" | "list">("kanban");
  
  // Group expenses by status
  const expensesByStatus = useMemo(() => {
    const pending = [];
    const upcoming = [];
    const completed = [];
    
    expenses.forEach(expense => {
      const today = new Date();
      const expenseDate = new Date(expense.date);
      
      if (expense.status === "completed") {
        completed.push(expense);
      } else if (expenseDate < today) {
        pending.push(expense);
      } else {
        upcoming.push(expense);
      }
    });
    
    return { pending, upcoming, completed };
  }, [expenses]);
  
  // Calculate totals
  const pendingTotal = expensesByStatus.pending.reduce((sum, expense) => sum + expense.amount, 0);
  const upcomingTotal = expensesByStatus.upcoming.reduce((sum, expense) => sum + expense.amount, 0);
  const completedTotal = expensesByStatus.completed.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate days until next expense
  const daysUntilNextExpense = () => {
    if (expensesByStatus.upcoming.length === 0) return null;
    
    const today = new Date();
    let closestDate = Infinity;
    
    expensesByStatus.upcoming.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const diffTime = expenseDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0 && diffDays < closestDate) {
        closestDate = diffDays;
      }
    });
    
    return closestDate === Infinity ? null : closestDate;
  };
  
  const nextExpenseDays = daysUntilNextExpense();

  const renderExpenseCard = (expense: FinancialTransaction) => {
    return (
      <Card key={expense.id} className="mb-3 bg-siso-bg-alt/50 border-siso-border/50 hover:bg-siso-bg-alt/80 transition-colors">
        <CardContent className="pt-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-siso-text">{expense.description}</h3>
            <div className="text-right">
              <div className="font-bold text-siso-text-bold">{formatCurrency(expense.amount, "GBP")}</div>
              <div className="text-xs text-siso-text-muted">{new Date(expense.date).toLocaleDateString()}</div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-3">
            {expense.category && (
              <div className="px-2 py-1 rounded-md bg-siso-orange/10 text-siso-orange text-xs border border-siso-orange/20">
                {expense.category.name || "Uncategorized"}
              </div>
            )}
            
            {expense.recurring_type && expense.recurring_type !== "one-time" && (
              <div className="text-xs text-siso-orange flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {expense.recurring_type}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h2 className="text-2xl font-semibold text-siso-text-bold">Financial Pipeline</h2>
          <p className="text-siso-text-muted">Track and manage your financial expenses</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Tabs defaultValue="kanban" onValueChange={(v) => setPipelineView(v as any)}>
            <TabsList>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <CreateExpenseDialog onDataChange={onDataChange} />
        </div>
      </div>
      
      {/* Progress indicator */}
      <Card className="bg-siso-bg-alt/50 border-siso-border/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-siso-orange/20 flex items-center justify-center border border-siso-orange/30">
                <AlertCircle className="h-6 w-6 text-siso-orange" />
              </div>
              <div>
                <p className="text-sm text-siso-text-muted">Pending</p>
                <p className="text-lg font-bold text-siso-text-bold">{formatCurrency(pendingTotal, "GBP")}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-siso-orange/10 flex items-center justify-center border border-siso-orange/20">
                <Calendar className="h-6 w-6 text-siso-orange" />
              </div>
              <div>
                <p className="text-sm text-siso-text-muted">Upcoming</p>
                <p className="text-lg font-bold text-siso-text-bold">{formatCurrency(upcomingTotal, "GBP")}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-900/30 flex items-center justify-center border border-green-500/30">
                <Check className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-siso-text-muted">Completed</p>
                <p className="text-lg font-bold text-siso-text-bold">{formatCurrency(completedTotal, "GBP")}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between mb-2">
              <p className="text-sm text-siso-text">Financial health</p>
              <p className="text-sm font-medium text-siso-text-bold">{Math.round((completedTotal / (pendingTotal + upcomingTotal + completedTotal)) * 100) || 0}%</p>
            </div>
            <Progress value={(completedTotal / (pendingTotal + upcomingTotal + completedTotal)) * 100 || 0} className="h-2" />
          </div>
          
          {nextExpenseDays !== null && (
            <div className="mt-4 py-2 px-4 rounded-md bg-siso-orange/20 border border-siso-orange/30 flex items-center">
              <Clock className="h-4 w-4 text-siso-orange mr-2" />
              <span className="text-siso-text">Next expense due in {nextExpenseDays} day{nextExpenseDays === 1 ? '' : 's'}</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {pipelineView === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Column */}
          <Card className="bg-siso-bg-alt/50 border-siso-border/50">
            <CardHeader className="pb-2 border-b border-siso-border/30">
              <CardTitle className="flex items-center text-siso-orange">
                <AlertCircle className="h-4 w-4 mr-2" />
                Pending ({expensesByStatus.pending.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 overflow-auto max-h-[calc(100vh-400px)]">
              {isLoading ? (
                <div className="py-8 text-center text-siso-text-muted">Loading...</div>
              ) : expensesByStatus.pending.length === 0 ? (
                <div className="py-8 text-center text-siso-text-muted">No pending expenses</div>
              ) : (
                expensesByStatus.pending.map(renderExpenseCard)
              )}
              
              <Button variant="ghost" className="w-full mt-2 border border-dashed border-siso-border/50 flex items-center justify-center text-siso-text hover:text-siso-orange">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </CardContent>
          </Card>
          
          {/* Upcoming Column */}
          <Card className="bg-siso-bg-alt/50 border-siso-border/50">
            <CardHeader className="pb-2 border-b border-siso-border/30">
              <CardTitle className="flex items-center text-siso-orange">
                <Calendar className="h-4 w-4 mr-2" />
                Upcoming ({expensesByStatus.upcoming.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 overflow-auto max-h-[calc(100vh-400px)]">
              {isLoading ? (
                <div className="py-8 text-center text-siso-text-muted">Loading...</div>
              ) : expensesByStatus.upcoming.length === 0 ? (
                <div className="py-8 text-center text-siso-text-muted">No upcoming expenses</div>
              ) : (
                expensesByStatus.upcoming.map(renderExpenseCard)
              )}
              
              <Button variant="ghost" className="w-full mt-2 border border-dashed border-siso-border/50 flex items-center justify-center text-siso-text hover:text-siso-orange">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </CardContent>
          </Card>
          
          {/* Completed Column */}
          <Card className="bg-siso-bg-alt/50 border-siso-border/50">
            <CardHeader className="pb-2 border-b border-siso-border/30">
              <CardTitle className="flex items-center text-green-400">
                <Check className="h-4 w-4 mr-2" />
                Completed ({expensesByStatus.completed.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 overflow-auto max-h-[calc(100vh-400px)]">
              {isLoading ? (
                <div className="py-8 text-center text-siso-text-muted">Loading...</div>
              ) : expensesByStatus.completed.length === 0 ? (
                <div className="py-8 text-center text-siso-text-muted">No completed expenses</div>
              ) : (
                expensesByStatus.completed.slice(0, 10).map(renderExpenseCard)
              )}
              
              {expensesByStatus.completed.length > 10 && (
                <Button variant="ghost" className="w-full mt-2 text-siso-text hover:text-siso-orange">
                  View {expensesByStatus.completed.length - 10} more
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="bg-siso-bg-alt/50 border-siso-border/50">
          <CardHeader>
            <CardTitle className="text-siso-text-bold">Financial Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Upcoming expenses timeline */}
              <div className="relative">
                {expensesByStatus.upcoming.slice(0, 5).map((expense, index) => (
                  <div key={expense.id} className="relative pl-6 pb-6">
                    <div className="absolute left-0 top-0 h-full">
                      <div className="h-full w-px bg-siso-border/30"></div>
                    </div>
                    <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-siso-orange"></div>
                    
                    <div className="flex items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-siso-text">{expense.description}</h4>
                        <div className="text-sm text-siso-text-muted">
                          Due {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-siso-text-bold">{formatCurrency(expense.amount, "GBP")}</div>
                        {expense.category && (
                          <div className="text-xs text-siso-orange">{expense.category.name}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* View all button */}
              <Button variant="outline" className="w-full border-siso-border text-siso-text hover:bg-siso-orange/10 hover:text-siso-orange">
                View All Expenses
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Linked Task Section */}
      <Card className="bg-siso-bg-alt/50 border-siso-border/50">
        <CardHeader>
          <CardTitle className="text-siso-text-bold">Linked Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-siso-text-muted">
              Connect your expenses to tasks for better tracking
            </p>
            <Button className="mt-4 bg-gradient-to-r from-siso-red to-siso-orange text-white hover:opacity-90">
              View Task Manager
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Client Base Integration */}
      <Card className="bg-siso-bg-alt/50 border-siso-border/50">
        <CardHeader>
          <CardTitle className="text-siso-text-bold">Client Financials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-siso-text-muted">
              Link your expenses to clients to track project profitability
            </p>
            <Button className="mt-4 bg-gradient-to-r from-siso-red to-siso-orange text-white hover:opacity-90">
              View Client Base
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
