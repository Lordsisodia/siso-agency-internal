import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HelpCircle, Search, Plus, Minus, CreditCard, LockKeyhole, Users, Settings } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

type FaqCategory = 'account' | 'billing' | 'security' | 'features';

interface FaqItem {
  question: string;
  answer: string;
  category: FaqCategory;
}

export function FAQContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FaqCategory | 'all'>('all');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqs: FaqItem[] = [
    {
      question: "How do I change my account password?",
      answer: "You can change your password by going to Profile & Settings > Account Settings. Click on the 'Update Password' button after entering your current password and new password.",
      category: 'account'
    },
    {
      question: "Can I update my email address?",
      answer: "Yes, you can update your email address in Profile & Settings > Account Settings. Please note that you'll need to verify your new email address before the change takes effect.",
      category: 'account'
    },
    {
      question: "How does billing work?",
      answer: "We offer monthly and annual subscription plans. You can view and manage your subscription details in Profile & Settings > Billing. All payments are processed securely through our payment processor.",
      category: 'billing'
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans. You can update your payment method in the Billing section.",
      category: 'billing'
    },
    {
      question: "How secure is my data?",
      answer: "We take security very seriously. All data is encrypted both in transit and at rest. We use industry-standard security measures and regularly conduct security audits.",
      category: 'security'
    },
    {
      question: "Can I invite team members to my account?",
      answer: "Yes, you can invite team members based on your subscription plan. Go to Settings > Team Members to send invitations and manage team access permissions.",
      category: 'features'
    }
  ];

  const toggleItem = (index: number) => {
    if (openItems.includes(index)) {
      setOpenItems(openItems.filter(i => i !== index));
    } else {
      setOpenItems([...openItems, index]);
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: FaqCategory) => {
    switch (category) {
      case 'account':
        return <Users className="h-4 w-4" />;
      case 'billing':
        return <CreditCard className="h-4 w-4" />;
      case 'security':
        return <LockKeyhole className="h-4 w-4" />;
      case 'features':
        return <Settings className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: FaqCategory) => {
    switch (category) {
      case 'account':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'billing':
        return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'security':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'features':
        return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-siso-orange/20 rounded-lg">
        <HelpCircle className="w-8 h-8 text-siso-orange" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Frequently Asked Questions</h1>
          <p className="text-gray-300">Find answers to common questions about our platform</p>
        </div>
      </div>
      
      {/* Search and Filters */}
      <Card className="bg-gradient-to-br from-black/70 to-black/50 border-gray-800 shadow-lg">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Input
                type="text"
                placeholder="Search FAQs..."
                className="pr-10 bg-black/50 border-gray-700 backdrop-blur-sm text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-300" />
            </div>
            
            <div className="flex gap-2 md:col-span-2 overflow-x-auto pb-2">
              <Button 
                variant="outline" 
                size="sm" 
                className={`whitespace-nowrap ${activeCategory === 'all' ? 'bg-siso-orange/30 text-white border-siso-orange/40' : 'bg-black/50 border-gray-700 text-gray-300'}`}
                onClick={() => setActiveCategory('all')}
              >
                All Categories
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={`whitespace-nowrap ${activeCategory === 'account' ? 'bg-blue-500/30 text-white border-blue-500/40' : 'bg-black/50 border-gray-700 text-gray-300'}`}
                onClick={() => setActiveCategory('account')}
              >
                <Users className="mr-1 h-4 w-4" />
                Account
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={`whitespace-nowrap ${activeCategory === 'billing' ? 'bg-purple-500/30 text-white border-purple-500/40' : 'bg-black/50 border-gray-700 text-gray-300'}`}
                onClick={() => setActiveCategory('billing')}
              >
                <CreditCard className="mr-1 h-4 w-4" />
                Billing
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={`whitespace-nowrap ${activeCategory === 'security' ? 'bg-green-500/30 text-white border-green-500/40' : 'bg-black/50 border-gray-700 text-gray-300'}`}
                onClick={() => setActiveCategory('security')}
              >
                <LockKeyhole className="mr-1 h-4 w-4" />
                Security
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className={`whitespace-nowrap ${activeCategory === 'features' ? 'bg-amber-500/30 text-white border-amber-500/40' : 'bg-black/50 border-gray-700 text-gray-300'}`}
                onClick={() => setActiveCategory('features')}
              >
                <Settings className="mr-1 h-4 w-4" />
                Features
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Accordion */}
      <div className="space-y-4 mt-6">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <Card 
              key={index} 
              className={`bg-black/60 border-gray-800 overflow-hidden transition-all shadow-md ${openItems.includes(index) ? 'shadow-lg' : ''}`}
            >
              <div
                className="p-4 cursor-pointer flex justify-between items-center hover:bg-black/80 transition-colors"
                onClick={() => toggleItem(index)}
              >
                <div className="flex items-center gap-3">
                  <Badge className={`${getCategoryColor(faq.category)}`}>
                    {getCategoryIcon(faq.category)}
                    <span className="ml-1 capitalize">{faq.category}</span>
                  </Badge>
                  <h3 className="text-lg font-medium text-white">{faq.question}</h3>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-white hover:bg-black/60">
                  {openItems.includes(index) ? (
                    <Minus className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <AnimatePresence>
                {openItems.includes(index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CardContent className="pt-0 pb-4 border-t border-gray-800/50 bg-black/40">
                      <p className="text-gray-200">{faq.answer}</p>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))
        ) : (
          <Card className="bg-black/60 border-gray-800 p-8 text-center shadow-md">
            <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <CardTitle className="text-xl mb-2 text-white">No Results Found</CardTitle>
            <CardDescription className="text-gray-300">
              No FAQs match your current search criteria. Try adjusting your search or filters.
            </CardDescription>
          </Card>
        )}
      </div>

      {/* Contact Support */}
      <Card className="bg-black/60 border-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-white">Still need help?</CardTitle>
          <CardDescription className="text-gray-300">
            If you can't find the answer you're looking for, our support team is here to help
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button className="flex-1 bg-siso-orange hover:bg-siso-orange/90 text-white shadow-md">
            <HelpCircle className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
          <Button variant="outline" className="flex-1 bg-black/50 border-gray-700 text-white hover:bg-black/70 hover:border-siso-orange/30 hover:text-siso-orange shadow-md">
            Submit a Feature Request
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
