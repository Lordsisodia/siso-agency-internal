import { memo } from 'react';
import { Briefcase, Book, MessageCircle, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

interface RequirementItem {
  title: string;
  description: string;
  icon: React.ElementType;
  level: 'Required' | 'Preferred' | 'Helpful';
}

const requirements: RequirementItem[] = [
  {
    title: 'Basic Business Acumen',
    description: 'Understanding of client needs and business fundamentals',
    icon: Book,
    level: 'Required'
  },
  {
    title: 'Communication Skills',
    description: 'Ability to present ideas and build relationships with clients',
    icon: MessageCircle,
    level: 'Required'
  },
  {
    title: 'Sales Experience',
    description: 'Previous sales or client-facing experience',
    icon: Briefcase,
    level: 'Preferred'
  },
  {
    title: 'Tech Enthusiasm',
    description: 'Interest in technology and digital solutions',
    icon: Cpu,
    level: 'Helpful'
  }
];

const levelOrder: ('Required' | 'Preferred' | 'Helpful')[] = ['Required', 'Preferred', 'Helpful'];

export const PartnerRequirements = memo(() => {
  return (
    <div id="requirements" className="w-full px-4 py-24 bg-gray-900/80 backdrop-blur-md">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-3xl md:text-5xl font-black text-white mb-12"
        >
          Partner <span className="text-orange-500">Requirements</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {levelOrder.map((level) => (
            <motion.div
              key={level}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6 flex flex-col"
            >
              <h3 className="text-xl font-semibold text-orange-400 mb-4">{level}</h3>
              <div className="space-y-4">
                {requirements.filter(r => r.level === level).map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-orange-500/15">
                        <Icon className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium leading-tight">{item.title}</p>
                        <p className="text-gray-400 text-sm">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
});

PartnerRequirements.displayName = 'PartnerRequirements'; 