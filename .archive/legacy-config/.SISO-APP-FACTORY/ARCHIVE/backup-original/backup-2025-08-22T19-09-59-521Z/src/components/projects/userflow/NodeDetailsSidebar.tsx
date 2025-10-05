import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { X, ExternalLink, MessageSquare, Save, Monitor, Edit } from 'lucide-react';

interface NodeDetailsSidebarProps {
  node: any;
  onClose: () => void;
}

export function NodeDetailsSidebar({ node, onClose }: NodeDetailsSidebarProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    label: node.label,
    description: node.description || '',
    status: node.status || 'planned',
    docs_url: node.docs_url || ''
  });
  
  // Fetch user role to determine admin status
  useEffect(() => {
    const fetchUserRole = async () => {
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
    
    fetchUserRole();
  }, []);
  
  // Fetch comments for this node
  useEffect(() => {
    const fetchComments = async () => {
      if (!node || !node.id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('flow_comments')
          .select(`
            id,
            comment,
            created_at,
            user_id,
            profiles:user_id (full_name, avatar_url)
          `)
          .eq('node_id', node.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setComments(data || []);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load comments';
        toast({
          title: "Error loading comments",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComments();
  }, [node]);
  
  // Handle comment submission
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('flow_comments')
        .insert({
          node_id: node.id,
          user_id: user.id,
          comment: newComment
        });
        
      if (error) throw error;
      
      setNewComment('');
      
      // Refresh comments
      const { data, error: fetchError } = await supabase
        .from('flow_comments')
        .select(`
          id,
          comment,
          created_at,
          user_id,
          profiles:user_id (full_name, avatar_url)
        `)
        .eq('node_id', node.id)
        .order('created_at', { ascending: false });
        
      if (fetchError) throw fetchError;
      
      setComments(data || []);
      
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add comment';
      toast({
        title: "Error adding comment",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle node details update (admin only)
  const handleNodeUpdate = async () => {
    if (!isAdmin) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('flow_nodes')
        .update({
          label: editFormData.label,
          description: editFormData.description,
          status: editFormData.status,
          docs_url: editFormData.docs_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', node.id);
        
      if (error) throw error;
      
      setIsEditing(false);
      
      toast({
        title: "Node updated",
        description: "The node details have been updated successfully"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update node';
      toast({
        title: "Error updating node",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-emerald-600">Live</Badge>;
      case 'development':
        return <Badge className="bg-amber-600">In Development</Badge>;
      case 'planned':
      default:
        return <Badge className="bg-slate-600">Planned</Badge>;
    }
  };
  
  return (
    <Card className="bg-black/20 border-gray-800 h-[calc(100vh-220px)] flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-white">
              {isEditing ? 'Edit Node' : node.label}
            </CardTitle>
            {!isEditing && getStatusBadge(node.status)}
          </div>
          {!isEditing && (
            <CardDescription className="text-gray-400">
              {node.description || 'No description provided'}
            </CardDescription>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="mt-1">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4 flex-grow overflow-auto pb-0">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 block mb-2">Node Name</label>
              <input
                type="text"
                value={editFormData.label}
                onChange={(e) => setEditFormData({ ...editFormData, label: e.target.value })}
                className="w-full bg-black/30 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-2">Description</label>
              <textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                className="w-full bg-black/30 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-2">Status</label>
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                className="w-full bg-black/30 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="planned">Planned</option>
                <option value="development">In Development</option>
                <option value="live">Live</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-2">Documentation URL</label>
              <input
                type="text"
                value={editFormData.docs_url}
                onChange={(e) => setEditFormData({ ...editFormData, docs_url: e.target.value })}
                className="w-full bg-black/30 border border-gray-700 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://notion.so/..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(false)}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleNodeUpdate}
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Node Details Section */}
            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-800">
                <h3 className="text-sm font-medium text-indigo-400 flex items-center mb-2">
                  <Monitor className="w-4 h-4 mr-1" />
                  Node Details
                </h3>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="text-white">{node.node_type === 'action' ? 'Action' : 'Page'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-white capitalize">{node.status}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Last Updated</p>
                    <p className="text-white">{node.updated_at ? formatDate(node.updated_at) : 'N/A'}</p>
                  </div>
                  
                  {node.docs_url && (
                    <div className="col-span-2">
                      <a 
                        href={node.docs_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 mt-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>View Documentation</span>
                      </a>
                    </div>
                  )}
                </div>
                
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditing(true)}
                    className="mt-3 bg-black/30 border-indigo-500/30 text-indigo-400 hover:bg-indigo-900/20"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit Node
                  </Button>
                )}
              </div>
            </div>
            
            {/* Comments Section */}
            <div>
              <h3 className="text-sm font-medium text-indigo-400 flex items-center mb-3">
                <MessageSquare className="w-4 h-4 mr-1" />
                Comments & Feedback
              </h3>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {comments.length === 0 ? (
                  <div className="text-center py-6 px-4 bg-black/20 rounded-md border border-gray-800">
                    <p className="text-gray-400 text-sm">No comments yet</p>
                    <p className="text-gray-500 text-xs mt-1">Be the first to leave feedback</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-black/20 rounded-md border border-gray-800">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-indigo-800 flex items-center justify-center text-xs text-white mr-2">
                            {comment.profiles?.full_name?.charAt(0) || 'U'}
                          </div>
                          <span className="text-white text-sm">{comment.profiles?.full_name || 'User'}</span>
                        </div>
                        <span className="text-gray-500 text-xs">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">{comment.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      {!isEditing && (
        <CardFooter className="border-t border-gray-800 pt-3">
          <div className="w-full space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] bg-black/30 border-gray-700 text-white resize-none"
            />
            <div className="flex justify-end">
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleCommentSubmit}
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={isLoading || !newComment.trim()}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Posting...
                  </>
                ) : (
                  'Post Comment'
                )}
              </Button>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
