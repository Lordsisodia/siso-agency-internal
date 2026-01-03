import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Book, MessageSquare, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function HelpSupportCard() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card className="border-siso-border bg-black/30 hover:border-siso-orange/30 transition-all duration-300 h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold flex items-center text-white">
            <HelpCircle className="mr-2 h-5 w-5 text-siso-orange" />
            Help & Support
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline"
              className="flex flex-col items-center justify-center h-20 bg-black/20 border-siso-text/10 hover:bg-siso-red/5 hover:border-siso-red/20"
              onClick={() => navigate('/resources/help/documentation')}
            >
              <Book className="h-5 w-5 mb-1 text-siso-text" />
              <span className="text-xs text-white">Documentation</span>
            </Button>
            <Button 
              variant="outline"
              className="flex flex-col items-center justify-center h-20 bg-black/20 border-siso-text/10 hover:bg-siso-red/5 hover:border-siso-red/20"
              onClick={() => navigate('/resources/help/faq')}
            >
              <FileText className="h-5 w-5 mb-1 text-siso-text" />
              <span className="text-xs text-white">Guides & FAQs</span>
            </Button>
            <Button 
              variant="outline"
              className="flex flex-col items-center justify-center h-20 bg-black/20 border-siso-text/10 hover:bg-siso-red/5 hover:border-siso-red/20"
              onClick={() => navigate('/resources/help/getting-started')}
            >
              <MessageSquare className="h-5 w-5 mb-1 text-siso-text" />
              <span className="text-xs text-white">Live Chat</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col items-center justify-center h-20 bg-black/20 border-siso-text/10 hover:bg-siso-red/5 hover:border-siso-red/20"
              onClick={() => navigate('/resources')}
            >
              <HelpCircle className="h-5 w-5 mb-1 text-siso-text" />
              <span className="text-xs text-white">Support Center</span>
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-3 text-siso-orange hover:text-siso-red hover:bg-transparent"
            onClick={() => navigate('/resources')}
          >
            Browse all resources
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
