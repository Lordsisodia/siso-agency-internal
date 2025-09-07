
import { ResourceHub } from "../features/resource-hub";
import { Bot, BookOpen, Users, Coins, Newspaper } from "lucide-react";

const tabs = [
  {
    value: "ai-tools",
    icon: <Bot className="h-auto w-4 shrink-0" />,
    label: "AI Analysis",
    content: {
      badge: "Smart Assistant",
      title: "Custom AI Resource Finder",
      description:
        "Use our AI assistant to discover perfect tools for your agency. We analyze our database of successful agencies to suggest solutions that work best in your field. Get data-driven recommendations based on real success stories.",
      buttonText: "Try AI Assistant",
      imageSrc: "/lovable-uploads/9c6a19b7-a212-4e1b-a835-28401a7fb75a.png",
      imageAlt: "AI Chat Demo",
    },
  },
  {
    value: "education",
    icon: <BookOpen className="h-auto w-4 shrink-0" />,
    label: "Education Hub",
    content: {
      badge: "Daily Updates",
      title: "AI-Powered Video Analysis",
      description:
        "Access our daily-updated YouTube content from curated creators. Our AI analyzes videos to extract key takeaways, saving you hours of watching time. Get the most valuable insights 10x faster.",
      buttonText: "Explore Content",
      imageSrc: "/lovable-uploads/2abbfd96-461a-4ccc-87d0-1ec32698671f.png",
      imageAlt: "Education Interface Demo",
    },
  },
  {
    value: "community",
    icon: <Users className="h-auto w-4 shrink-0" />,
    label: "Network",
    content: {
      badge: "1M+ Agency Owners",
      title: "Global Agency Network",
      description:
        "Connect with a million-strong community of agency owners. Find and join the perfect networking groups for your niche, engage in meaningful conversations, and grow your agency through valuable connections.",
      buttonText: "Join Network",
      imageSrc: "/lovable-uploads/2a89d9b1-9fbb-4a86-a53a-36d9f63d1f7a.png",
      imageAlt: "Network Interface Demo",
    },
  },
  {
    value: "economy",
    icon: <Coins className="h-auto w-4 shrink-0" />,
    label: "Economy",
    content: {
      badge: "Earn & Grow",
      title: "Tokenized Rewards System",
      description:
        "Earn points for every platform interaction, convertible to our native cryptocurrency. Use tokens for premium features, rank upgrades, or trade them. Participate in the platform's economic future.",
      buttonText: "View Economy",
      imageSrc: "/lovable-uploads/4ac2a247-8806-47db-9d59-0a0c7bf75136.png",
      imageAlt: "Economy System Demo",
    },
  },
  {
    value: "news",
    icon: <Newspaper className="h-auto w-4 shrink-0" />,
    label: "AI News",
    content: {
      badge: "Daily AI Updates",
      title: "Curated AI Industry News",
      description:
        "Stay informed with daily AI news curated for agency owners. Earn points by engaging with articles and sharing insights. Get personalized news feeds based on your agency's focus.",
      buttonText: "Read News",
      imageSrc: "/lovable-uploads/3b17a23d-630e-4e55-94bf-9d6fef9e6fc4.png",
      imageAlt: "News Interface Demo",
    },
  },
];

export const Feature108 = () => {
  return <ResourceHub tabs={tabs} />;
};
