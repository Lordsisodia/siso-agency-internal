
import { Button } from "@/components/ui/button";
import { Plus, FileText, Bell, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  const handleCreatePlan = () => {
    navigate("/admin/plans/create");
  };
  
  return (
    <div className="flex flex-col space-y-3">
      <h3 className="text-lg font-semibold text-white mb-2">Quick Actions</h3>
      <Button 
        size="sm" 
        className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90 text-white flex gap-2 w-full justify-center"
        onClick={handleCreatePlan}
      >
        <Plus className="h-4 w-4" />
        <span>New Plan</span>
      </Button>
      <div className="grid grid-cols-2 gap-3">
        <Button 
          size="sm" 
          variant="outline"
          className="bg-black/30 border-siso-text/10 hover:bg-siso-bg-alt hover:border-siso-border-hover flex gap-2 justify-center"
        >
          <FileText className="h-4 w-4" />
          <span>Invoice</span>
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          className="bg-black/30 border-siso-text/10 hover:bg-siso-bg-alt hover:border-siso-border-hover flex gap-2 justify-center"
        >
          <Bell className="h-4 w-4" />
          <span>Alerts</span>
        </Button>
      </div>
      <Button 
        size="sm" 
        variant="outline"
        className="bg-black/30 border-siso-text/10 hover:bg-siso-bg-alt hover:border-siso-border-hover flex gap-2 justify-center"
      >
        <Users className="h-4 w-4" />
        <span>Manage Team</span>
      </Button>
    </div>
  );
}
