
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, MessageSquare, Phone, HelpCircle, ArrowRight } from 'lucide-react';
import { ClientDashboardLayout } from "@/components/client/ClientDashboardLayout";

export default function ClientSupportPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate sending message
    setTimeout(() => {
      toast({
        title: "Message sent",
        description: "We will get back to you shortly",
      });
      setSubject('');
      setMessage('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <ClientDashboardLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-slate-900">Support</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 border border-slate-200">
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <div className="p-3 bg-blue-100 rounded-full w-fit mb-3">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Live Chat</h2>
                <p className="text-slate-600 mb-4">
                  Chat directly with our support team for immediate assistance.
                </p>
              </div>
              <div className="mt-auto">
                <Button className="w-full">
                  Start Chat
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 border border-slate-200">
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <div className="p-3 bg-green-100 rounded-full w-fit mb-3">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Phone Support</h2>
                <p className="text-slate-600 mb-4">
                  Call us directly for personalized assistance with your project.
                </p>
              </div>
              <div className="mt-auto">
                <a href="tel:+1234567890" className="block">
                  <Button className="w-full">
                    Call Support
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        </div>
        
        <Card className="p-6 border border-slate-200 mb-8">
          <div className="flex items-start gap-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-full">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Send a Message</h2>
              <p className="text-slate-600">
                Send us a message and we'll get back to you as soon as possible.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">
                  Subject
                </label>
                <Input 
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What can we help you with?"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
                  Message
                </label>
                <Textarea 
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please provide details about your issue or question"
                  rows={6}
                  required
                />
              </div>
              
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </form>
        </Card>
        
        <Card className="p-6 border border-slate-200">
          <div className="flex items-start gap-3 mb-6">
            <div className="p-3 bg-amber-100 rounded-full">
              <HelpCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">FAQ</h2>
              <p className="text-slate-600">
                Find answers to commonly asked questions.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">What is included in my project?</h3>
              <p className="text-slate-600">
                Your project includes all features and functionalities outlined in your project scope document. 
                This typically includes design, development, testing, and deployment.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">How long does the development process take?</h3>
              <p className="text-slate-600">
                Development timelines vary based on project complexity. Your specific timeline 
                is outlined in your project plan, but typically ranges from 4-12 weeks.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">How do I request changes to my project?</h3>
              <p className="text-slate-600">
                You can request changes through this support portal or by contacting your project 
                manager directly. Changes may affect timeline and cost depending on scope.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </ClientDashboardLayout>
  );
}
