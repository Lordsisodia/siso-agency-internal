
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const planFormSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  company_name: z.string().min(2, { message: 'Company name is required' }),
  app_name: z.string().min(2, { message: 'App name is required' }),
  industry_type: z.string(),
  estimated_cost: z.coerce.number().min(0),
  estimated_days: z.coerce.number().min(1),
  primary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { 
    message: 'Must be a valid hex color code' 
  }),
  secondary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { 
    message: 'Must be a valid hex color code' 
  })
});

type PlanFormValues = z.infer<typeof planFormSchema>;

interface PlanFormProps {
  onSuccess?: () => void;
  initialData?: PlanFormValues & { id?: string };
  mode?: 'create' | 'edit';
}

export const PlanForm: React.FC<PlanFormProps> = ({ 
  onSuccess, 
  initialData, 
  mode = 'create'
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [industryOptions, setIndustryOptions] = useState<{slug: string, name: string}[]>([]);
  
  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: initialData || {
      username: '',
      company_name: '',
      app_name: '',
      industry_type: 'onlyfans-management',
      estimated_cost: 4997,
      estimated_days: 14,
      primary_color: '#3182CE',
      secondary_color: '#805AD5'
    }
  });
  
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const { data, error } = await supabase
          .from('agency_types')
          .select('name, slug');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setIndustryOptions(data);
        }
      } catch (error) {
        console.error('Error fetching industries:', error);
        // Fallback to basic industries if fetch fails
        setIndustryOptions([
          { slug: 'onlyfans-management', name: 'OnlyFans Management' },
          { slug: 'digital-marketing', name: 'Digital Marketing' },
          { slug: 'content-marketing', name: 'Content Marketing' }
        ]);
      }
    };
    
    fetchIndustries();
  }, []);
  
  const onSubmit = async (values: PlanFormValues) => {
    setIsLoading(true);
    try {
      const planData = {
        username: values.username,
        company_name: values.company_name,
        app_name: values.app_name,
        industry_type: values.industry_type,
        estimated_cost: values.estimated_cost,
        estimated_days: values.estimated_days,
        branding: {
          primary_color: values.primary_color,
          secondary_color: values.secondary_color,
        },
        status: 'draft'
      };
      
      let result;
      
      if (mode === 'create') {
        result = await supabase.from('plans').insert([planData]);
      } else if (initialData?.id) {
        result = await supabase
          .from('plans')
          .update(planData)
          .eq('id', initialData.id);
      }
      
      const { error } = result || {};
      
      if (error) {
        throw error;
      }
      
      toast({
        title: `Plan ${mode === 'create' ? 'Created' : 'Updated'} Successfully`,
        description: `The plan for ${values.company_name} has been ${mode === 'create' ? 'created' : 'updated'}.`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} plan:`, error);
      toast({
        variant: "destructive",
        title: `Error ${mode === 'create' ? 'Creating' : 'Updating'} Plan`,
        description: error.message || 'Please try again later'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create New Plan' : 'Edit Plan'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username (URL Identifier)</FormLabel>
                    <FormControl>
                      <Input placeholder="decora" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="industry_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {industryOptions.map((industry) => (
                          <SelectItem key={industry.slug} value={industry.slug}>
                            {industry.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Decora Agency" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="app_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>App Name</FormLabel>
                    <FormControl>
                      <Input placeholder="OnlyFans Management Suite" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estimated_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Cost ($)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="estimated_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Days</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="primary_color"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Primary Color</FormLabel>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: field.value }}
                      />
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="secondary_color"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Secondary Color</FormLabel>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: field.value }}
                      />
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onSuccess && onSuccess()}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="mr-2 h-4 w-4" />
                  {mode === 'create' ? 'Create Plan' : 'Save Changes'}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
