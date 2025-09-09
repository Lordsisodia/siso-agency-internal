
import { motion } from 'framer-motion';
import { Brain, Building2, Sparkles } from 'lucide-react';
import { AgentCategory, ProcessingStage } from '@/types/chat';
import { ProcessingNode } from './processing/ProcessingNode';
import { agentIcons, agentThoughts, containerVariants, itemVariants } from './processing/constants';

interface ProcessingTreeProps {
  currentStage: ProcessingStage;
  agentStatuses: Record<AgentCategory, 'pending' | 'processing' | 'complete'>;
}

export const ProcessingTree = ({ currentStage, agentStatuses }: ProcessingTreeProps) => {
  const stages = ['initial', 'context', 'agents', 'synthesis'];
  const currentIndex = stages.indexOf(currentStage);

  // Split agents into two rows with hexagonal offset
  const agentEntries = Object.entries(agentStatuses);
  const topRowAgents = agentEntries.slice(0, 3);
  const bottomRowAgents = agentEntries.slice(3);

  return (
    <div className="fixed inset-x-0 py-8 px-4 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto">
        <motion.div 
          className="relative flex flex-col items-center gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Understanding section */}
          <motion.div variants={itemVariants} className="relative">
            <ProcessingNode
              icon={Brain}
              label="Understanding request"
              isActive={currentStage === 'initial'}
              isComplete={currentIndex > 0}
              thoughts={agentThoughts.initial}
            />
            {currentIndex > 0 && (
              <motion.div 
                className="absolute -bottom-6 left-1/2 w-1 h-6 bg-gradient-to-b from-siso-red to-siso-orange"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.div>

          {/* Context section */}
          <motion.div variants={itemVariants} className="relative">
            <ProcessingNode
              icon={Building2}
              label="Applying company context"
              isActive={currentStage === 'context'}
              isComplete={currentIndex > 1}
              thoughts={agentThoughts.context}
            />
            {currentIndex > 1 && (
              <motion.div 
                className="absolute -bottom-6 left-1/2 w-1 h-6 bg-gradient-to-b from-siso-orange to-siso-red"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.div>

          {/* Agents hexagonal grid section */}
          {currentStage === 'agents' && (
            <div className="relative w-full max-w-4xl mx-auto">
              {/* Knowledge web background */}
              <motion.div 
                className="absolute inset-0 -m-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <motion.path
                    d="M25 40 L75 40 L75 60 L25 60 Z"
                    className="stroke-siso-orange/20"
                    fill="none"
                    strokeWidth="0.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                  <motion.path
                    d="M50 30 L25 50 L50 70 L75 50 Z"
                    className="stroke-siso-red/20"
                    fill="none"
                    strokeWidth="0.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.7 }}
                  />
                </svg>
              </motion.div>

              {/* Top row agents - hexagonal layout */}
              <motion.div 
                className="grid grid-cols-3 gap-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {topRowAgents.map(([category, status], index) => {
                  const Icon = agentIcons[category as AgentCategory];
                  return (
                    <motion.div
                      key={category}
                      className="relative"
                      style={{
                        transform: `translateY(${index % 2 === 1 ? '2rem' : '0'})`,
                      }}
                    >
                      {/* Knowledge web connections */}
                      {index < topRowAgents.length - 1 && (
                        <motion.div 
                          className="absolute top-1/2 -right-8 w-8 h-px bg-gradient-to-r from-siso-red/30 to-siso-orange/30"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        />
                      )}
                      
                      <ProcessingNode
                        icon={Icon}
                        label={`${category.charAt(0).toUpperCase() + category.slice(1)} agent`}
                        isActive={status === 'processing'}
                        isComplete={status === 'complete'}
                        size="sm"
                        thoughts={agentThoughts[category as AgentCategory]}
                      />
                      
                      {status === 'complete' && (
                        <motion.div 
                          className="absolute -bottom-8 left-1/2 w-1 h-8 bg-gradient-to-b from-siso-red to-siso-orange"
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Bottom row agents - hexagonal layout */}
              <motion.div 
                className="grid grid-cols-3 gap-8 mt-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {bottomRowAgents.map(([category, status], index) => {
                  const Icon = agentIcons[category as AgentCategory];
                  return (
                    <motion.div
                      key={category}
                      className="relative"
                      style={{
                        transform: `translateY(${index % 2 === 0 ? '2rem' : '0'})`,
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                    >
                      {/* Knowledge web connections */}
                      {index < bottomRowAgents.length - 1 && (
                        <motion.div 
                          className="absolute top-1/2 -right-8 w-8 h-px bg-gradient-to-r from-siso-red/30 to-siso-orange/30"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: 0.3, delay: 0.4 }}
                        />
                      )}
                      
                      <ProcessingNode
                        icon={Icon}
                        label={`${category.charAt(0).toUpperCase() + category.slice(1)} agent`}
                        isActive={status === 'processing'}
                        isComplete={status === 'complete'}
                        size="sm"
                        thoughts={agentThoughts[category as AgentCategory]}
                      />
                      
                      {status === 'complete' && (
                        <motion.div 
                          className="absolute -bottom-8 left-1/2 w-1 h-8 bg-gradient-to-b from-siso-red to-siso-orange"
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          )}

          {/* Synthesis section */}
          <motion.div variants={itemVariants} className="mt-8">
            <ProcessingNode
              icon={Sparkles}
              label="Synthesizing information"
              isActive={currentStage === 'synthesis'}
              isComplete={currentIndex > 3}
              thoughts={agentThoughts.synthesis}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
