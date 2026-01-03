import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";

interface CommunitySearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const CommunitySearch = ({ searchQuery, setSearchQuery }: CommunitySearchProps) => {
  return (
    <div className="relative w-full md:w-96">
      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-siso-text/60" />
      <Input
        placeholder="Search community members..."
        className="pl-10 bg-siso-text/5 border-siso-text/10 focus-visible:ring-siso-orange"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};