
import { useState } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface SmartEarningSearchProps {
  onSearch: (query: string) => void;
}

export const SmartEarningSearch = ({ onSearch }: SmartEarningSearchProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    
    if (!query.trim()) return;
    
    setIsSearching(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-assistant', {
        body: { 
          message: query,
          systemPrompt: "You are a search assistant for SISO's point earning system. Analyze the user's query and return relevant earning opportunities and strategies."
        },
      });

      if (error) throw error;
      
      onSearch(query);
      
    } catch (error) {
      console.error('Search error:', error);
      toast({
        variant: "destructive",
        title: "Search failed",
        description: "Unable to process your search. Please try again.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSearch}
      className="w-full max-w-2xl mx-auto mb-8"
    >
      <div className="relative">
        <input
          type="search"
          name="search"
          placeholder="Search earning opportunities (e.g. 'quick ways to earn points today')"
          className="w-full h-12 pl-12 pr-4 bg-siso-text/5 border border-siso-text/10 rounded-lg
            text-siso-text placeholder:text-siso-text/50
            focus:outline-none focus:ring-2 focus:ring-siso-orange/50
            hover:bg-siso-text/10 transition-all"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {isSearching ? (
            <div className="w-6 h-6 border-2 border-siso-orange border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-6 h-6 text-siso-text/50" />
          )}
        </div>
      </div>
    </motion.form>
  );
};
