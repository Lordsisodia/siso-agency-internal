
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface CustomFeatureInputProps {
  onAddFeature: (name: string, description: string) => void;
  onRemoveFeature: (index: number) => void;
  customFeatures: Array<{ name: string; description: string }>;
}

export const CustomFeatureInput: React.FC<CustomFeatureInputProps> = ({
  onAddFeature,
  onRemoveFeature,
  customFeatures
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast({
        title: "Feature name required",
        description: "Please enter a name for your custom feature",
        variant: "destructive"
      });
      return;
    }

    onAddFeature(name, description);
    setName('');
    setDescription('');
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-black/30 rounded-lg p-4 border border-siso-text/10">
        <h3 className="text-white text-lg font-medium mb-3">Add Custom Feature</h3>
        
        <div className="space-y-3">
          <div>
            <label htmlFor="feature-name" className="block text-sm font-medium text-siso-text mb-1">
              Feature Name*
            </label>
            <Input
              id="feature-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter feature name"
              className="bg-black/20 border-siso-text/20"
            />
          </div>
          
          <div>
            <label htmlFor="feature-description" className="block text-sm font-medium text-siso-text mb-1">
              Description (optional)
            </label>
            <Textarea
              id="feature-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this feature should do"
              className="bg-black/20 border-siso-text/20 min-h-[80px]"
              rows={3}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Feature
          </Button>
        </div>
      </form>
      
      {customFeatures.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-white text-lg font-medium">Your Custom Features</h3>
          
          <div className="space-y-2">
            {customFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="bg-black/20 border border-siso-text/10 rounded-lg p-3 flex justify-between items-start"
              >
                <div>
                  <h4 className="text-white font-medium">{feature.name}</h4>
                  {feature.description && (
                    <p className="text-sm text-siso-text mt-1">{feature.description}</p>
                  )}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-siso-text hover:text-siso-red" 
                  onClick={() => onRemoveFeature(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
