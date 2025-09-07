import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash, 
  Play, 
  CheckCircle, 
  Clock, 
  Filter,
  Search,
  BarChart3,
  RefreshCw,
  Upload,
  Download,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface ProjectPrompt {
  id: number;
  prompt: string;
  prompt_cycle_number: number;
  is_done: boolean;
  times_used: number;
  last_used: string | null;
  created_at: string;
  project: string;
}

export default function AdminPrompts() {
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<ProjectPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterCycle, setFilterCycle] = useState<string>('all');
  const [selectedPrompts, setSelectedPrompts] = useState<number[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    totalUsage: 0,
    maxCycle: 0
  });

  // Load prompts
  const loadPrompts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_prompts')
        .select('*')
        .eq('project', 'Ubahcrypt')
        .order('id', { ascending: true });

      if (error) throw error;

      setPrompts(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const completed = data?.filter(p => p.is_done).length || 0;
      const pending = total - completed;
      const totalUsage = data?.reduce((sum, p) => sum + (p.times_used || 0), 0) || 0;
      const maxCycle = Math.max(...(data?.map(p => p.prompt_cycle_number || 0) || [0]));
      
      setStats({ total, completed, pending, totalUsage, maxCycle });
      
    } catch (error) {
      console.error('Error loading prompts:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load prompts"
      });
    } finally {
      setLoading(false);
    }
  };

  // Mark prompt as done/undone
  const togglePromptStatus = async (promptId: number, currentStatus: boolean) => {
    try {
      const updates: any = { is_done: !currentStatus };
      
      if (!currentStatus) {
        // Marking as done - increment usage
        const prompt = prompts.find(p => p.id === promptId);
        updates.times_used = (prompt?.times_used || 0) + 1;
        updates.last_used = new Date().toISOString();
      }

      const { error } = await supabase
        .from('project_prompts')
        .update(updates)
        .eq('id', promptId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Prompt marked as ${!currentStatus ? 'completed' : 'pending'}`
      });
      
      loadPrompts();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update prompt status"
      });
    }
  };

  // Reset all prompts
  const resetAllPrompts = async () => {
    if (!confirm('Are you sure you want to reset ALL prompts? This will mark them as pending and reset usage stats.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('project_prompts')
        .update({ 
          is_done: false, 
          times_used: 0, 
          last_used: null 
        })
        .eq('project', 'Ubahcrypt');

      if (error) throw error;

      toast({
        title: "Success",
        description: "All prompts have been reset"
      });
      
      loadPrompts();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reset prompts"
      });
    }
  };

  // Bulk operations
  const bulkMarkDone = async () => {
    if (selectedPrompts.length === 0) return;

    try {
      const { error } = await supabase
        .from('project_prompts')
        .update({ 
          is_done: true,
          last_used: new Date().toISOString()
        })
        .in('id', selectedPrompts);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedPrompts.length} prompts marked as completed`
      });
      
      setSelectedPrompts([]);
      loadPrompts();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update prompts"
      });
    }
  };

  // Filter prompts
  const filteredPrompts = prompts.filter(prompt => {
    // Search filter
    const matchesSearch = prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.id.toString().includes(searchTerm);
    
    // Status filter
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'completed' && prompt.is_done) ||
                         (filterStatus === 'pending' && !prompt.is_done);
    
    // Cycle filter
    const matchesCycle = filterCycle === 'all' || 
                        prompt.prompt_cycle_number?.toString() === filterCycle;
    
    return matchesSearch && matchesStatus && matchesCycle;
  });

  // Get unique cycles for filter
  const cycles = [...new Set(prompts.map(p => p.prompt_cycle_number).filter(Boolean))].sort();

  useEffect(() => {
    loadPrompts();
  }, []);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <AdminPageTitle
          icon={MessageSquare}
          title="Prompt Management System"
          subtitle="Manage your 210+ UbahCrypt prompts with cycle tracking and execution control"
        />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-300">Total Prompts</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-300">Completed</p>
                  <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-300">Pending</p>
                  <p className="text-2xl font-bold text-orange-400">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-300">Total Usage</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.totalUsage}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cyan-300">Max Cycle</p>
                  <p className="text-2xl font-bold text-cyan-400">{stats.maxCycle}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="bg-black/30 border-white/10">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <CardTitle className="text-white">Prompt Controls</CardTitle>
                <CardDescription>Search, filter, and manage your prompts</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={loadPrompts} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={resetAllPrompts} variant="destructive" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset All
                </Button>
                {selectedPrompts.length > 0 && (
                  <Button onClick={bulkMarkDone} className="bg-siso-orange hover:bg-siso-orange/80" size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark {selectedPrompts.length} Done
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCycle} onValueChange={setFilterCycle}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cycles</SelectItem>
                  {cycles.map(cycle => (
                    <SelectItem key={cycle} value={cycle.toString()}>
                      Cycle {cycle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-sm text-gray-400 flex items-center">
                Showing {filteredPrompts.length} of {stats.total} prompts
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prompts Table */}
        <Card className="bg-black/30 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Prompt Database</CardTitle>
            <CardDescription>All prompts with execution status and usage statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedPrompts.length === filteredPrompts.length && filteredPrompts.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPrompts(filteredPrompts.map(p => p.id));
                          } else {
                            setSelectedPrompts([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Cycle</TableHead>
                    <TableHead>Prompt Preview</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Loading prompts...
                      </TableCell>
                    </TableRow>
                  ) : filteredPrompts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                        No prompts found matching your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPrompts.map(prompt => (
                      <TableRow key={prompt.id} className="hover:bg-white/5">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedPrompts.includes(prompt.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPrompts([...selectedPrompts, prompt.id]);
                              } else {
                                setSelectedPrompts(selectedPrompts.filter(id => id !== prompt.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">#{prompt.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            Cycle {prompt.prompt_cycle_number || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="truncate text-sm text-gray-300">
                            {prompt.prompt.substring(0, 100)}...
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={prompt.is_done ? "default" : "secondary"}
                            className={prompt.is_done ? "bg-green-600" : "bg-orange-600"}
                          >
                            {prompt.is_done ? 'Completed' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {prompt.times_used || 0}x
                        </TableCell>
                        <TableCell className="text-sm text-gray-400">
                          {prompt.last_used 
                            ? new Date(prompt.last_used).toLocaleDateString()
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => togglePromptStatus(prompt.id, prompt.is_done)}
                            >
                              {prompt.is_done ? (
                                <>
                                  <Clock className="h-4 w-4 mr-1" />
                                  Mark Pending
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Mark Done
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 