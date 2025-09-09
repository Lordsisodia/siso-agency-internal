
import React from "react";
import { useIsClient } from "@/shared/hooks/client/useIsClient";
import { useClientDetails } from "@/shared/hooks/client/useClientDetails";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { Button } from "@/shared/ui/button";
import { Link } from "react-router-dom";
import { Clock, FileText, ListTodo, Folder } from "lucide-react";

/**
 * Component that shows client dashboard content only if user is a client
 */
export function ClientDashboardContent() {
  const { isClient, loading: clientCheckLoading } = useIsClient();
  const { clientData, loading: clientDataLoading } = useClientDetails();
  
  const loading = clientCheckLoading || clientDataLoading;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (!isClient) {
    return (
      <Card className="border border-yellow-600/30 bg-yellow-600/10">
        <CardHeader>
          <CardTitle>Not linked to a client account</CardTitle>
          <CardDescription>You don't have access to client features.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm">
            Your account is not currently linked to a client profile. If you believe this is an error,
            please contact your account manager.
          </p>
          <Button variant="outline" asChild>
            <Link to="/home">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Client dashboard content
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{clientData?.company_name || 'Welcome'}</h1>
          <p className="text-muted-foreground">Your project dashboard</p>
        </div>
        <div>
          <Button className="w-full sm:w-auto">View Project Status</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Folder className="mr-2 h-4 w-4 text-blue-400" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientData?.project_name || "No project"}</div>
            <p className="text-xs text-muted-foreground mt-1">Current project</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <ListTodo className="mr-2 h-4 w-4 text-green-400" />
              Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientData?.todos?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Outstanding tasks</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Clock className="mr-2 h-4 w-4 text-purple-400" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientData ? `${clientData.current_step}/${clientData.total_steps}` : "0/0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Project milestones</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <FileText className="mr-2 h-4 w-4 text-amber-400" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">View</div>
            <p className="text-xs text-muted-foreground mt-1">Project documentation</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
