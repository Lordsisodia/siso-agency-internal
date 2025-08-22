import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PortfolioItem, PortfolioCategory } from '@/types/portfolio';
import { useToast } from '@/hooks/use-toast';

const defaultProjects: PortfolioItem[] = [
  {
    id: '1',
    title: 'Gritness Gym',
    description: 'A modern gym website showcasing fitness programs and facilities',
    technologies: ['Next.js', 'React', 'Tailwind CSS'],
    live_url: 'https://gritnessgym.vercel.app/',
    client_name: 'Gritness Gym',
    development_status: 'completed',
    highlights: ['Modern UI/UX design', 'Responsive layout', 'Performance optimized'],
    user_id: '1',
    image_url: '/placeholder.svg'
  },
  {
    id: '2',
    title: 'NM Construction',
    description: 'Construction company website highlighting services and projects',
    technologies: ['React', 'Tailwind CSS', 'Framer Motion'],
    live_url: 'https://nm-construction.vercel.app/',
    client_name: 'NM Construction',
    development_status: 'completed',
    highlights: ['Portfolio showcase', 'Service listings', 'Contact forms'],
    user_id: '1',
    image_url: '/placeholder.svg'
  },
  {
    id: '3',
    title: 'OPTIMAL CONSTRUCTION',
    description: 'Building maintenance and construction services platform',
    technologies: ['React', 'Tailwind CSS', 'Node.js'],
    live_url: 'https://optimal-building-maintenance.vercel.app/',
    client_name: 'Optimal Construction',
    development_status: 'completed',
    highlights: ['Service booking', 'Project gallery', 'Testimonials'],
    user_id: '1',
    image_url: '/placeholder.svg'
  },
  {
    id: '4',
    title: 'UbahCryp',
    description: 'Web3 trading platform with cryptocurrency integration',
    technologies: ['React', 'Web3.js', 'Tailwind CSS'],
    live_url: 'https://ubahcrypcom.vercel.app/',
    client_name: 'UbahCryp',
    development_status: 'completed',
    highlights: ['Crypto trading', 'Wallet integration', 'Real-time data'],
    user_id: '1',
    image_url: '/placeholder.svg'
  },
  {
    id: '5',
    title: 'Elementree',
    description: 'Modern restaurant website with online ordering capabilities',
    technologies: ['React', 'Tailwind CSS', 'Firebase'],
    live_url: 'https://elementree.vercel.app/',
    client_name: 'Elementree Restaurant',
    development_status: 'completed',
    highlights: ['Menu display', 'Online ordering', 'Reservation system'],
    user_id: '1',
    image_url: '/placeholder.svg'
  },
  {
    id: '6',
    title: 'Trojan MMA',
    description: 'Mixed Martial Arts gym website with class schedules and membership info',
    technologies: ['React', 'Tailwind CSS'],
    live_url: 'https://trojan-mma.vercel.app/',
    client_name: 'Trojan MMA',
    development_status: 'completed',
    highlights: ['Class scheduling', 'Membership plans', 'Trainer profiles'],
    user_id: '1',
    image_url: '/placeholder.svg'
  },
  {
    id: '7',
    title: 'Lets Go',
    description: 'Modern web application for event planning and coordination',
    technologies: ['React', 'Next.js', 'Tailwind CSS'],
    live_url: 'https://lets-go-u7hh.vercel.app/',
    client_name: 'Lets Go',
    development_status: 'completed',
    highlights: ['Event creation', 'User profiles', 'Interactive UI'],
    user_id: '1',
    image_url: '/placeholder.svg'
  },
  {
    id: '8',
    title: 'Mu Shin',
    description: 'Self-defense course platform with video lessons and training materials',
    technologies: ['React', 'Tailwind CSS', 'Video API'],
    live_url: 'https://siso-mu-shin.vercel.app/',
    client_name: 'Mu Shin Defense',
    development_status: 'completed',
    highlights: ['Course management', 'Video lessons', 'Progress tracking'],
    user_id: '1',
    image_url: '/placeholder.svg'
  },
  {
    id: '9',
    title: '5 Star Hire',
    description: 'Premium car hire service website with booking system',
    technologies: ['React', 'Tailwind CSS', 'Booking API'],
    live_url: 'https://5-star-hire.vercel.app/',
    client_name: '5 Star Hire',
    development_status: 'completed',
    highlights: ['Vehicle catalog', 'Online booking', 'Customer reviews'],
    user_id: '1',
    image_url: '/placeholder.svg'
  }
];

const defaultCategories: PortfolioCategory[] = [
  {
    id: '1',
    name: 'Fitness',
    slug: 'fitness',
    description: 'Gym and fitness related projects'
  },
  {
    id: '2',
    name: 'Construction',
    slug: 'construction',
    description: 'Construction and building maintenance projects'
  },
  {
    id: '3',
    name: 'Web3',
    slug: 'web3',
    description: 'Blockchain and cryptocurrency projects'
  },
  {
    id: '4',
    name: 'Food & Beverage',
    slug: 'food-beverage',
    description: 'Restaurant and food service projects'
  },
  {
    id: '5',
    name: 'Sports',
    slug: 'sports',
    description: 'Sports and martial arts related projects'
  },
  {
    id: '6',
    name: 'Application',
    slug: 'application',
    description: 'Web and mobile applications'
  }
];

export const usePortfolioData = () => {
  const [items, setItems] = useState<PortfolioItem[]>(defaultProjects);
  const [categories, setCategories] = useState<PortfolioCategory[]>(defaultCategories);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true);
        
        // Fetch portfolio items from Supabase
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('portfolio_items')
          .select('*')
          .order('created_at', { ascending: false });

        // Fetch categories from Supabase
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('portfolio_categories')
          .select('*')
          .order('name', { ascending: true });

        if (portfolioError) {
          console.warn('Portfolio fetch error:', portfolioError);
          // Use default data if database fetch fails
          setItems(defaultProjects);
        } else if (portfolioData && portfolioData.length > 0) {
          // Transform Supabase data to match PortfolioItem interface
          const transformedItems: PortfolioItem[] = portfolioData.map(item => ({
            id: item.id,
            title: item.title || 'Untitled Project',
            description: item.description || 'No description available',
            technologies: Array.isArray(item.technologies) ? item.technologies : ['React', 'Tailwind CSS'],
            live_url: item.live_url || '#',
            client_name: item.client_name || 'Client',
            development_status: item.development_status || 'completed',
            highlights: Array.isArray(item.highlights) ? item.highlights : ['Custom Development'],
            user_id: item.user_id || '1',
            image_url: item.image_url || '/placeholder.svg',
            category_id: item.category_id
          }));
          setItems(transformedItems);
        } else {
          // Use default data if no items found in database
          setItems(defaultProjects);
        }

        if (categoriesError) {
          console.warn('Categories fetch error:', categoriesError);
          setCategories(defaultCategories);
        } else if (categoriesData && categoriesData.length > 0) {
          const transformedCategories: PortfolioCategory[] = categoriesData.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug
          }));
          setCategories(transformedCategories);
        } else {
          setCategories(defaultCategories);
        }

      } catch (error) {
        console.error('Error fetching portfolio data:', error);
        toast({
          title: "Data Loading",
          description: "Using cached portfolio data. Some information may not be current.",
          variant: "default"
        });
        // Fallback to default data
        setItems(defaultProjects);
        setCategories(defaultCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [toast]);

  return { items, categories, loading };
};
