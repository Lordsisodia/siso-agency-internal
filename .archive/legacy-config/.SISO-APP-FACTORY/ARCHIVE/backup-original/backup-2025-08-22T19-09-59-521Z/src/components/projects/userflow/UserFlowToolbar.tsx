import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Search, 
  Filter, 
  ZoomIn, 
  ZoomOut, 
  FilePlus, 
  Plus,
  ZapIcon,
  Settings,
  Layout,
  Layers
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/integrations/supabase/client';

export function UserFlowToolbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if user is admin - normally this would be done in a useEffect
  // But simplified here for the example
  const checkIfAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
        
      setIsAdmin(roles?.role === 'admin');
    }
  };
  
  // Simulated check on component mount (you'd normally use useEffect)
  useState(() => {
    checkIfAdmin();
  });
  
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-black/20 border-gray-700 hover:bg-gray-800"
            >
              <Search className="h-4 w-4 text-gray-400" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Search in diagram</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-black/20 border-gray-700 hover:bg-gray-800"
            >
              <Filter className="h-4 w-4 text-gray-400" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Filter nodes</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-black/20 border-gray-700 hover:bg-gray-800"
            >
              <ZoomIn className="h-4 w-4 text-gray-400" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom in</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-black/20 border-gray-700 hover:bg-gray-800"
            >
              <ZoomOut className="h-4 w-4 text-gray-400" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom out</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <div className="h-6 w-px bg-gray-700 mx-1"></div>
      
      {isAdmin && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-indigo-900/30 border-indigo-500/30 text-indigo-300 hover:bg-indigo-800/50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Node
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-gray-700 text-gray-300">
              <DropdownMenuLabel>Add to diagram</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer">
                <Layout className="h-4 w-4 mr-2 text-blue-400" />
                <span>Page Node</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer">
                <ZapIcon className="h-4 w-4 mr-2 text-purple-400" />
                <span>Action Node</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer">
                <Layers className="h-4 w-4 mr-2 text-amber-400" />
                <span>Decision Node</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full bg-black/20 border-gray-700 hover:bg-gray-800"
                >
                  <Settings className="h-4 w-4 text-gray-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Flow settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
    </div>
  );
}
