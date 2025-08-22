
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const clientFormSchema = z.object({
  contact_name: z.string().min(2, 'Contact name is required'),
  company_name: z.string().min(2, 'Company name is required'),
  website_url: z.string().url('Please enter a valid URL').or(z.string().length(0)),
  company_niche: z.string().min(2, 'Company niche/industry is required'),
  project_name: z.string().min(2, 'Project name is required'),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientAddFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ClientAddForm({ open, onOpenChange, onSuccess }: ClientAddFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      contact_name: '',
      company_name: '',
      website_url: '',
      company_niche: '',
      project_name: '',
    },
  });

  const onSubmit = async (values: ClientFormValues) => {
    setIsLoading(true);
    
    try {
      console.log('Submitting client form with values:', values);
      
      const { data, error } = await supabase
        .from('client_onboarding')
        .insert({
          contact_name: values.contact_name,
          company_name: values.company_name,
          website_url: values.website_url || null,
          company_niche: values.company_niche,
          project_name: values.project_name,
          status: 'pending',
          current_step: 1,
          total_steps: 5,
          completed_steps: []
        })
        .select();
      
      if (error) {
        console.error('Error adding client:', error);
        throw error;
      }
      
      console.log('Client added successfully:', data);
      
      toast({
        title: 'Client added successfully',
        description: `${values.company_name} has been added to your clients.`,
      });
      
      form.reset();
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error in form submission:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to add client',
        description: error.message || 'There was an error adding the client. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="contact_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
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
                    <Input placeholder="Acme Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="website_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="company_niche"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry/Niche</FormLabel>
                  <FormControl>
                    <Input placeholder="E-commerce, Healthcare, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="project_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Website Redesign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Client'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
