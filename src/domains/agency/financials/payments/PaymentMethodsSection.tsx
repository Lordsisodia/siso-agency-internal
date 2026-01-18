
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export function PaymentMethodsSection() {
  return (
    <Card className="bg-black/20 border border-siso-text/10 backdrop-blur-sm mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Payment Methods</CardTitle>
        <Button variant="outline" size="sm">
          <CreditCard className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center p-4 border border-siso-text/10 rounded-lg bg-gradient-to-r from-purple-900/10 to-blue-900/10">
            <div className="pr-4">
              <CreditCard className="h-10 w-10 text-siso-orange" />
            </div>
            <div className="flex-grow">
              <p className="font-medium">**** **** **** 4285</p>
              <p className="text-sm text-muted-foreground">Expires 09/25</p>
            </div>
            <div>
              <Button variant="ghost" size="sm">Change</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
