
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CircleDollarSign, Timer, AlertCircle } from "lucide-react";

interface TotalCostCardProps {
  currentCosts: number;
  predictedCosts?: number;
}

export function TotalCostCard({ currentCosts, predictedCosts }: TotalCostCardProps) {
  return (
    <Card className="bg-black/20 border border-siso-text/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <CircleDollarSign className="h-5 w-5 text-siso-orange" />
          Total App Cost
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-3xl font-bold">£{currentCosts.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Current total expenses</p>
          </div>

          {predictedCosts && predictedCosts > 0 && (
            <div className="pt-4 border-t border-siso-text/10">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-amber-500" />
                <p className="text-sm font-medium">Predicted Additional Costs</p>
              </div>
              <p className="text-xl font-bold mt-1">£{predictedCosts.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Based on recurring expenses</p>
            </div>
          )}

          {predictedCosts && predictedCosts > currentCosts / 2 && (
            <div className="flex items-center gap-2 p-3 bg-amber-900/20 rounded-lg border border-amber-400/50 mt-4">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <p className="text-sm text-amber-200">
                High predicted costs detected. Consider reviewing expenses.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
