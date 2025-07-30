
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { NavLink } from "@/components/ui/nav-link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TotalCostCard } from "@/components/admin/financials/TotalCostCard";
import { ExpenseCreditCard } from "@/components/admin/financials/ExpenseCreditCard";
import { AreaChart } from "@/components/admin/financials/Charts";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, AlertCircle } from "lucide-react";

const financialSummaryData = {
  totalDue: 2000,
  totalCost: 6000,
  recommendedPrice: 100000,
  paymentStatus: "overdue", // "overdue", "due-soon", "up-to-date"
  lastPayment: {
    amount: 1500,
    date: "2025-04-01"
  },
  expenses: [
    { name: "Developer Fees", amount: 1200, date: "2025-04-01", category: "Development" },
    { name: "UI/UX Design", amount: 800, date: "2025-03-25", category: "Design" },
    { name: "Infrastructure Setup", amount: 500, date: "2025-03-15", category: "Infrastructure" },
    { name: "Security Audit", amount: 1000, date: "2025-04-10", category: "Security" }
  ],
  futureExpenses: [
    { milestone: "MVP Delivery", estimatedCost: 1500, expectedDate: "2025-05-01" },
    { milestone: "Beta Testing", estimatedCost: 800, expectedDate: "2025-05-15" },
    { milestone: "Final Deployment", estimatedCost: 1200, expectedDate: "2025-06-01" }
  ],
  paymentHistory: [
    { date: "2025-03-10", amount: 2000, method: "Stripe", status: "completed" },
    { date: "2025-04-01", amount: 1500, method: "Bank Transfer", status: "completed" },
    { date: "2025-04-15", amount: 500, method: "Stripe", status: "pending" }
  ],
  financialChart: [
    { name: "Jan", revenue: 0, expense: 500 },
    { name: "Feb", revenue: 2000, expense: 700 },
    { name: "Mar", revenue: 1500, expense: 1300 },
    { name: "Apr", revenue: 500, expense: 2200 },
    { name: "May", revenue: 0, expense: 1500 },
    { name: "Jun", revenue: 0, expense: 1200 }
  ]
};

export function FinancialSummarySection() {
  const [activeTab, setActiveTab] = useState("expenses");
  
  const totalExpenses = financialSummaryData.expenses.reduce(
    (sum, expense) => sum + expense.amount, 0
  );
  
  const totalFutureExpenses = financialSummaryData.futureExpenses.reduce(
    (sum, expense) => sum + expense.estimatedCost, 0
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue":
        return "text-red-500";
      case "due-soon":
        return "text-yellow-500";
      case "up-to-date":
        return "text-green-500";
      default:
        return "text-white";
    }
  };

  return (
    <Card className="p-6 bg-black/30 border-siso-text/10">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">Financial Summary</h3>
        <NavLink href="/financial/payments" className="flex items-center gap-2 text-[#9b87f5] hover:text-[#9b87f5]/80">
          <span>View Full Financials</span>
          <ArrowRight className="w-4 h-4" />
        </NavLink>
      </div>

      {/* Financial Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-black/20 border-siso-text/10 p-4">
          <p className="text-sm text-gray-400 mb-1">Total Balance Owed</p>
          <p className={`text-2xl font-bold ${getStatusColor(financialSummaryData.paymentStatus)}`}>
            £{financialSummaryData.totalDue.toLocaleString()}
          </p>
          {financialSummaryData.paymentStatus === "overdue" && (
            <div className="flex items-center mt-2 text-xs text-red-400">
              <AlertCircle className="h-3 w-3 mr-1" />
              <span>Payment overdue</span>
            </div>
          )}
        </Card>

        <Card className="bg-black/20 border-siso-text/10 p-4">
          <p className="text-sm text-gray-400 mb-1">Total Project Cost</p>
          <p className="text-2xl font-bold text-white">£{financialSummaryData.totalCost.toLocaleString()}</p>
          <div className="w-full bg-gray-700 h-1.5 rounded-full mt-2">
            <div 
              className="bg-[#9b87f5] h-1.5 rounded-full" 
              style={{ width: `${((financialSummaryData.totalCost - financialSummaryData.totalDue) / financialSummaryData.totalCost) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {Math.round(((financialSummaryData.totalCost - financialSummaryData.totalDue) / financialSummaryData.totalCost) * 100)}% paid
          </p>
        </Card>

        <Card className="bg-black/20 border-siso-text/10 p-4">
          <p className="text-sm text-gray-400 mb-1">Recommended Retail Price (RRP)</p>
          <p className="text-2xl font-bold text-blue-400">£{financialSummaryData.recommendedPrice.toLocaleString()}</p>
          <p className="text-xs text-blue-300 mt-1">Estimated market value</p>
        </Card>
      </div>

      {/* Financial Details Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="expenses">Current Expenses</TabsTrigger>
          <TabsTrigger value="future">Future Expenses</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="expenses">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="pb-2 font-medium">Expense Name</th>
                  <th className="pb-2 font-medium">Category</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {financialSummaryData.expenses.map((expense, index) => (
                  <tr key={index} className="border-b border-gray-800 last:border-0">
                    <td className="py-3">{expense.name}</td>
                    <td className="py-3">
                      <Badge variant="outline" className="bg-gray-800 text-gray-300">
                        {expense.category}
                      </Badge>
                    </td>
                    <td className="py-3">{expense.date}</td>
                    <td className="py-3 text-right">£{expense.amount.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="bg-black/30">
                  <td colSpan={3} className="py-3 font-medium">Total Expenses</td>
                  <td className="py-3 font-bold text-right">£{totalExpenses.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>
        
        <TabsContent value="future">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="pb-2 font-medium">Milestone</th>
                  <th className="pb-2 font-medium">Expected Date</th>
                  <th className="pb-2 font-medium text-right">Estimated Cost</th>
                </tr>
              </thead>
              <tbody>
                {financialSummaryData.futureExpenses.map((expense, index) => (
                  <tr key={index} className="border-b border-gray-800 last:border-0">
                    <td className="py-3">{expense.milestone}</td>
                    <td className="py-3">{expense.expectedDate}</td>
                    <td className="py-3 text-right">£{expense.estimatedCost.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="bg-black/30">
                  <td colSpan={2} className="py-3 font-medium">Total Future Expenses</td>
                  <td className="py-3 font-bold text-right">£{totalFutureExpenses.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>
        
        <TabsContent value="payments">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="pb-2 font-medium">Payment Date</th>
                  <th className="pb-2 font-medium">Method</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {financialSummaryData.paymentHistory.map((payment, index) => (
                  <tr key={index} className="border-b border-gray-800 last:border-0">
                    <td className="py-3">{payment.date}</td>
                    <td className="py-3">{payment.method}</td>
                    <td className="py-3">
                      <Badge variant="outline" className={
                        payment.status === "completed" ? "bg-green-500/20 text-green-400" :
                        payment.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }>
                        {payment.status === "completed" ? "Completed" : 
                         payment.status === "pending" ? "Pending" : "Failed"}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">£{payment.amount.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      {payment.status === "completed" && (
                        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                          <Download className="h-3 w-3 mr-1" />
                          Invoice
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Financial Chart */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-400 mb-2">Financial Trend</h4>
        <div className="bg-black/20 p-4 rounded-lg border border-gray-800">
          <AreaChart data={financialSummaryData.financialChart} />
        </div>
      </div>

      {/* Extra Actions */}
      <div className="mt-6 flex flex-wrap gap-4">
        <Button variant="outline" className="bg-black/30">
          <Download className="h-4 w-4 mr-2" />
          Download All Invoices
        </Button>
        <Button variant="outline" className="bg-black/30 text-[#9b87f5]">
          <ArrowRight className="h-4 w-4 mr-2" />
          View Leaderboard
        </Button>
      </div>
    </Card>
  );
}
