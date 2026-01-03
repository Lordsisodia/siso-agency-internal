
import React from 'react';
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { AdminLayout } from "@/domains/admin/dashboard/components";
import { PlansList } from "@/domains/admin/dashboard/components";
import { PlanForm } from "@/domains/admin/dashboard/components";
import { BulkPlanCreation } from "@/domains/admin/dashboard/components";
import { toast } from "sonner";
import { AdminPageTitle } from "@/domains/admin/dashboard/components";
import { Users } from "lucide-react";

const AdminPlans = () => {
  const [activeTab, setActiveTab] = React.useState("plans-list");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handlePlanCreated = () => {
    toast.success("Plan created successfully");
    setActiveTab("plans-list");
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4">
        <AdminPageTitle
          icon={Users}
          title="Plans Management"
          subtitle="Manage your plans, create or import new plan templates"
        />
        
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="plans-list">Plans List</TabsTrigger>
            <TabsTrigger value="create-plan">Create Plan</TabsTrigger>
            <TabsTrigger value="bulk-create">Bulk Creation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plans-list">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Available Plans</h2>
                  <Button 
                    variant="default" 
                    onClick={() => setActiveTab("create-plan")}
                  >
                    Add New Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <PlansList />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="create-plan">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Create New Plan</h2>
              </CardHeader>
              <CardContent>
                <PlanForm onSuccess={handlePlanCreated} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bulk-create">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Bulk Plan Creation</h2>
              </CardHeader>
              <CardContent>
                <BulkPlanCreation />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPlans;
