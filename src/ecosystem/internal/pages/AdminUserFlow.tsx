import { useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowDownToLine, Expand, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function AdminUserFlow() {
  const { projectId } = useParams<{ projectId: string }>();
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Card className="bg-black/20 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-2xl font-bold text-white">Admin User Flow Editor</CardTitle>
                <CardDescription className="text-gray-400">
                  Create and manage user journey diagrams for client projects
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-black/30 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                  onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "Full screen mode will be available in the next update.",
                    });
                  }}
                >
                  <Expand className="w-4 h-4 mr-2" />
                  <span>Full Screen</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-black/30 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                  onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "Export functionality will be available in the next update.",
                    });
                  }}
                >
                  <ArrowDownToLine className="w-4 h-4 mr-2" />
                  <span>Export</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 bg-black/20 rounded-lg border border-blue-500/20">
                <p className="text-sm text-gray-300">
                  This admin tool allows you to create user flow diagrams for client projects. 
                  <span className="ml-1 text-blue-400">The diagram editor is currently being implemented.</span>
                </p>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600/80">Live</Badge>
                  <Badge className="bg-amber-600/80">In Development</Badge>
                  <Badge className="bg-slate-600/80">Planned</Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-center h-[600px] bg-black/20 rounded-lg border border-gray-800">
                <div className="p-6 text-center">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Admin Flow Editor Coming Soon</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    We're implementing a powerful flow diagram editor for creating user journey visualizations.
                    This feature will be available in the next update.
                  </p>
                  <Button 
                    variant="outline" 
                    className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border-indigo-500/30"
                    onClick={() => {
                      toast({
                        title: "Coming Soon",
                        description: "The User Flow editor is currently being implemented.",
                      });
                    }}
                  >
                    Check Status
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
