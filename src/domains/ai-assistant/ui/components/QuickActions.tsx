/**
 * Quick Actions Component
 */

import React from 'react';
import { motion } from 'framer-motion';
import { QUICK_ACTIONS } from '../../types/quick-actions';
import type { QuickAction as QuickActionType } from '../../types/quick-actions';

interface QuickActionsProps {
  onActionClick: (action: QuickActionType) => void;
  disabled?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onActionClick,
  disabled = false,
}) => {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-400 mb-3 px-1">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {QUICK_ACTIONS.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onActionClick(action)}
            disabled={disabled}
            className={`
              flex flex-col items-center gap-2 p-3 rounded-xl
              bg-gray-800/50 hover:bg-gray-800
              border border-gray-700/50 hover:border-gray-600
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${disabled ? 'pointer-events-none' : ''}
            `}
          >
            <span className="text-2xl">{action.icon}</span>
            <div className="text-center">
              <div className="text-xs font-medium text-white">
                {action.label}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">
                {action.description}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
