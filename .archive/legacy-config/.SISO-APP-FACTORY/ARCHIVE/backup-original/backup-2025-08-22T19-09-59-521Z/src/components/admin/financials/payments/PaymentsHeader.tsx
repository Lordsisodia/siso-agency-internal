
import { Button } from "@/components/ui/button";
import { DownloadCloud, CreditCard } from "lucide-react";

interface PaymentsHeaderProps {
  handleDownloadAll: () => void;
}

export function PaymentsHeader({ handleDownloadAll }: PaymentsHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
      <div>
        <p className="text-2xl font-bold tracking-tight text-purple-900">Financial Management</p>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your expenses and revenue
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleDownloadAll}>
          <DownloadCloud className="mr-2 h-4 w-4" />
          Download All
        </Button>
        
        <Button variant="default" size="sm">
          <CreditCard className="mr-2 h-4 w-4" />
          Manage Payment
        </Button>
      </div>
    </div>
  );
}
