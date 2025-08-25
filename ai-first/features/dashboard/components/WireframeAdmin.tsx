import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash, Save, Loader2 } from 'lucide-react';
import { Wireframe } from "../wireframes/WireframeNavigation";

interface WireframeAdminProps {
  projectId?: string;
}

export function WireframeAdmin({ projectId }: WireframeAdminProps) {
  const [wireframes, setWireframes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedWireframe, setSelectedWireframe] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'page',
    notion_link: '',
    wireframe_status: 'planned',
    specs_status: 'pending',
    dev_status: 'pending'
  });

  useEffect(() => {
    if (projectId) {
      fetchWireframes();
    }
  }, [projectId]);

  const fetchWireframes = async () => {
    try {
      setLoading(true);
      
      if (!projectId) {
        toast({
          title: "Error loading wireframes",
          description: "No project ID provided",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('project_wireframes')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setWireframes(data || []);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load wireframes';
      toast({
        title: "Error loading wireframes",
        description: errorMessage,
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleAdd = () => {
    setSelectedWireframe(null);
    setFormData({
      title: '',
      description: '',
      category: 'page',
      notion_link: '',
      wireframe_status: 'planned',
      specs_status: 'pending',
      dev_status: 'pending'
    });
  };

  const handleEdit = (wireframe: any) => {
    setSelectedWireframe(wireframe);
    setFormData({
      title: wireframe.title,
      description: wireframe.description || '',
      category: wireframe.category,
      notion_link: wireframe.notion_link || '',
      wireframe_status: wireframe.wireframe_status,
      specs_status: wireframe.specs_status,
      dev_status: wireframe.dev_status
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('project_wireframes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Wireframe deleted",
        description: "The wireframe has been removed successfully."
      });

      fetchWireframes();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete wireframe';
      toast({
        title: "Error deleting wireframe",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId) {
      toast({
        title: "Error saving wireframe",
        description: "No project ID provided",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSaving(true);
      
      const wireframeData = {
        ...formData,
        project_id: projectId
      };
      
      let response;
      
      if (selectedWireframe) {
        // Update existing wireframe
        response = await supabase
          .from('project_wireframes')
          .update(wireframeData)
          .eq('id', selectedWireframe.id);
      } else {
        // Add new wireframe
        response = await supabase
          .from('project_wireframes')
          .insert(wireframeData);
      }
      
      if (response.error) throw response.error;
      
      toast({
        title: selectedWireframe ? "Wireframe updated" : "Wireframe added",
        description: selectedWireframe
          ? "The wireframe has been updated successfully."
          : "A new wireframe has been added successfully."
      });
      
      // Reset form and refetch
      setFormData({
        title: '',
        description: '',
        category: 'page',
        notion_link: '',
        wireframe_status: 'planned',
        specs_status: 'pending',
        dev_status: 'pending'
      });
      setSelectedWireframe(null);
      fetchWireframes();
      setSaving(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save wireframe';
      toast({
        title: "Error saving wireframe",
        description: errorMessage,
        variant: "destructive"
      });
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-emerald-600">Complete</Badge>;
      case 'approved':
        return <Badge className="bg-blue-600">Approved</Badge>;
      case 'in-progress':
        return <Badge className="bg-amber-600">In Progress</Badge>;
      case 'planned':
      case 'pending':
      default:
        return <Badge className="bg-gray-600">Pending</Badge>;
    }
  };

  return (
    <Tabs defaultValue="list" className="space-y-6">
      <TabsList className="bg-black/40 border border-gray-800">
        <TabsTrigger value="list">Wireframe List</TabsTrigger>
        <TabsTrigger value="edit">
          {selectedWireframe ? 'Edit Wireframe' : 'Add Wireframe'}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="list" className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Project Wireframes</h3>
          <Button 
            variant="default" 
            onClick={handleAdd}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Wireframe
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="space-y-4">
            {wireframes.length === 0 ? (
              <Card className="bg-black/20 border-gray-800">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-400">No wireframes found. Create one to get started.</p>
                </CardContent>
              </Card>
            ) : (
              wireframes.map(wireframe => (
                <Card key={wireframe.id} className="bg-black/20 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between">
                      <span>{wireframe.title}</span>
                      <Badge className="bg-slate-700">{wireframe.category}</Badge>
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {wireframe.description || 'No description provided'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Wireframe Status</p>
                        {getStatusBadge(wireframe.wireframe_status)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Specs Status</p>
                        {getStatusBadge(wireframe.specs_status)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Dev Status</p>
                        {getStatusBadge(wireframe.dev_status)}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <div className="text-xs text-gray-400">
                      {wireframe.notion_link ? (
                        <a 
                          href={wireframe.notion_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          View Notion Doc
                        </a>
                      ) : (
                        <span>No Notion link provided</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(wireframe)}
                        className="h-8 px-2 text-blue-400 border-blue-900/50 hover:bg-blue-900/20"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(wireframe.id)}
                        className="h-8 px-2 text-red-400 border-red-900/50 hover:bg-red-900/20"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="edit">
        <Card className="bg-black/20 border-gray-800">
          <CardHeader>
            <CardTitle>
              {selectedWireframe ? 'Edit Wireframe' : 'Add New Wireframe'}
            </CardTitle>
            <CardDescription>
              {selectedWireframe 
                ? 'Update the details for this wireframe' 
                : 'Create a new wireframe for the project'
              }
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Title</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter wireframe title"
                  className="bg-black/30 border-gray-700"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Description</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter wireframe description"
                  className="bg-black/30 border-gray-700 min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger className="bg-black/30 border-gray-700">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-gray-700">
                    <SelectItem value="page">Page</SelectItem>
                    <SelectItem value="component">Component</SelectItem>
                    <SelectItem value="layout">Layout</SelectItem>
                    <SelectItem value="user-flow">User Flow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Notion Link</label>
                <Input
                  name="notion_link"
                  value={formData.notion_link}
                  onChange={handleInputChange}
                  placeholder="Enter Notion document URL"
                  className="bg-black/30 border-gray-700"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Wireframe Status</label>
                  <Select
                    value={formData.wireframe_status}
                    onValueChange={(value) => handleSelectChange('wireframe_status', value)}
                  >
                    <SelectTrigger className="bg-black/30 border-gray-700">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-gray-700">
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Specs Status</label>
                  <Select
                    value={formData.specs_status}
                    onValueChange={(value) => handleSelectChange('specs_status', value)}
                  >
                    <SelectTrigger className="bg-black/30 border-gray-700">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-gray-700">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-review">In Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Development Status</label>
                  <Select
                    value={formData.dev_status}
                    onValueChange={(value) => handleSelectChange('dev_status', value)}
                  >
                    <SelectTrigger className="bg-black/30 border-gray-700">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-gray-700">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedWireframe(null);
                  setFormData({
                    title: '',
                    description: '',
                    category: 'page',
                    notion_link: '',
                    wireframe_status: 'planned',
                    specs_status: 'pending',
                    dev_status: 'pending'
                  });
                }}
                className="border-gray-700"
              >
                Cancel
              </Button>
              
              <Button 
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {selectedWireframe ? 'Update Wireframe' : 'Save Wireframe'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
