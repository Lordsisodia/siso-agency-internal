
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Book, MessageSquare, Mail, Video, FileText } from 'lucide-react';

export function DashboardHelpCenter() {
  return (
    <section>
      <h2 className="text-3xl font-bold text-gradient-to-r from-siso-red to-siso-orange mb-6 mt-10">
        Help & Support
      </h2>
      
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-siso-text/50" />
          <Input 
            placeholder="Search help articles..." 
            className="pl-10 bg-black/30 border border-siso-text/10 text-siso-text"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <HelpCard
          icon={<Book className="h-8 w-8 text-siso-orange" />}
          title="Documentation"
          description="Browse comprehensive guides and documentation."
          buttonText="View Docs"
        />
        <HelpCard
          icon={<MessageSquare className="h-8 w-8 text-siso-orange" />}
          title="Chat Support"
          description="Get help from our support team through chat."
          buttonText="Start Chat"
        />
        <HelpCard
          icon={<Video className="h-8 w-8 text-siso-orange" />}
          title="Video Tutorials"
          description="Watch tutorials on how to use our platform."
          buttonText="Watch Videos"
        />
        <HelpCard
          icon={<FileText className="h-8 w-8 text-siso-orange" />}
          title="Submit a Ticket"
          description="Create a support ticket for complex issues."
          buttonText="Submit Ticket"
        />
      </div>
      
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-siso-text-bold mb-4">Frequently Asked Questions</h3>
        <Card className="bg-black/30 border border-siso-text/10">
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              <FaqItem
                question="How do I create my first project?"
                answer="To create your first project, navigate to the Plan Builder from the Dashboard. Click on 'Create New Plan' and follow the guided process to set up your project details, requirements, and budget."
              />
              <FaqItem
                question="How do I earn points on the platform?"
                answer="You can earn points by completing projects, participating in the community, referring new users, and maintaining a streak of daily logins. Visit the 'How to Earn' page for more detailed information on earning opportunities."
              />
              <FaqItem
                question="How do I change my account settings?"
                answer="To change your account settings, go to the Settings page from the sidebar menu. There you can update your profile information, notification preferences, privacy settings, and appearance options."
              />
              <FaqItem
                question="How do payments work on the platform?"
                answer="Our platform uses a token-based payment system. You can convert your earned points to tokens on the Payments page, and then use these tokens to pay for services or withdraw them to external wallets. We support multiple payment methods for security and convenience."
              />
              <FaqItem
                question="How can I contact customer support?"
                answer="You can contact our customer support team through the chat option on this page, by submitting a support ticket, or by emailing support@example.com. Our support team is available 24/7 to assist you with any issues or questions."
              />
            </Accordion>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-gradient-to-r from-siso-red/10 to-siso-orange/10 border border-siso-text/10">
        <CardHeader>
          <CardTitle>Still Need Help?</CardTitle>
          <CardDescription className="text-siso-text">
            Our support team is available 24/7 to assist you with any questions or issues.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90">
            Contact Support
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}

function HelpCard({ icon, title, description, buttonText }) {
  return (
    <Card className="bg-black/30 border border-siso-text/10 hover:border-siso-orange/50 transition-all duration-300">
      <CardHeader>
        <div className="flex justify-center mb-2">
          {icon}
        </div>
        <CardTitle className="text-center">{title}</CardTitle>
        <CardDescription className="text-center text-siso-text">
          {description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-center pb-6">
        <Button variant="outline" className="border-siso-orange/30 text-siso-orange hover:bg-siso-orange/10">
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}

function FaqItem({ question, answer }) {
  return (
    <AccordionItem value={question.toLowerCase().replace(/\s+/g, '-')}>
      <AccordionTrigger className="text-siso-text-bold hover:text-siso-orange">
        {question}
      </AccordionTrigger>
      <AccordionContent className="text-siso-text">
        {answer}
      </AccordionContent>
    </AccordionItem>
  );
}
