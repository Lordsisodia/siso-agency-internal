
import { motion } from 'framer-motion';
import { EarningCategory } from '@/components/earn/EarningCategory';
import { EarningDetails } from '@/components/earn/EarningDetails';
import { earningSections } from '@/data/earningCategories';
import { MainContentProps } from '@/types/earning';

export const EarnContent = ({ 
  selectedCategory, 
  setSelectedCategory, 
  pointConfigs, 
  isLoading 
}: MainContentProps) => {
  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="animate-pulse"
      >
        <div className="h-12 w-48 bg-siso-text/10 rounded mb-4 mx-auto"></div>
        <div className="h-6 w-96 bg-siso-text/10 rounded mb-8 mx-auto"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-siso-text/10 rounded"></div>
            ))}
          </div>
          <div className="lg:col-span-8">
            <div className="h-96 bg-siso-text/10 rounded"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-4 
          scrollbar-thin scrollbar-thumb-siso-border scrollbar-track-transparent"
      >
        {earningSections.map((section, index) => (
          <EarningCategory
            key={index}
            title={section.title}
            description={section.description}
            icon={section.icon}
            items={section.items}
            isSelected={selectedCategory === index}
            onClick={() => setSelectedCategory(index)}
            progress={{ 
              completed: pointConfigs?.filter(pc => 
                section.items.some(item => 
                  pc.action === item.action.toLowerCase().replace(/ /g, '_')
                )
              )?.length || 0,
              total: section.items.length 
            }}
          />
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-8"
      >
        <EarningDetails
          title={earningSections[selectedCategory].title}
          description={earningSections[selectedCategory].description}
          items={earningSections[selectedCategory].items}
        />
      </motion.div>
    </div>
  );
};
