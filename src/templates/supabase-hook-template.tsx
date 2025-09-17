/**
 * 🔧 Supabase Hook Template
 * 
 * Template for creating Supabase data management hooks
 * Based on successful patterns from useMorningRoutineSupabase.ts
 * 
 * Usage:
 * 1. Copy this template
 * 2. Replace ENTITY_NAME with your entity (e.g., Task, Habit, Note)
 * 3. Replace TABLE_NAME with your Supabase table name
 * 4. Update interface and default items
 * 5. Customize operations as needed
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/shared/lib/supabase';
import { useClerkUser } from '../shared/hooks/useClerkUser';
import { useSupabaseClient, useSupabaseUserId } from '@/shared/lib/supabase-clerk';

// TEMPLATE: Define your data interfaces
interface EntityItem {
  name: string;
  completed: boolean;
  // Add more fields as needed
}

interface Entity {
  id: string;
  user_id: string;
  date: string;
  entity_type: string; // TEMPLATE: Update this to match your use case
  items: EntityItem[];
  completed_count: number;
  total_count: number;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

// TEMPLATE: Define default items for new entities
const DEFAULT_ENTITY_ITEMS: EntityItem[] = [
  { name: 'item1', completed: false },
  { name: 'item2', completed: false },
  // Add your default items here
];

export function useEntitySupabase(selectedDate: Date) {
  const [entity, setEntity] = useState<Entity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateString = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format

  const loadEntity = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔧 Loading entity from Supabase...');
      
      // Get internal user ID through Clerk mapping
      const internalUserId = await supabaseClerkUserMapping.getInternalUserId();
      if (!internalUserId) {
        throw new Error('Failed to get internal user ID');
      }

      // TEMPLATE: Update table name and query conditions
      const { data, error: queryError } = await supabase
        .from('TABLE_NAME') // Replace with your table name
        .select('*')
        .eq('user_id', internalUserId)
        .eq('date', dateString)
        .eq('entity_type', 'ENTITY_TYPE') // Replace with your entity type
        .maybeSingle(); // Use maybeSingle to handle no results gracefully

      if (queryError) {
        throw queryError;
      }

      // If no entity exists, create default one
      if (!data) {
        console.log('📝 Creating default entity...');
        
        const defaultEntity = {
          user_id: internalUserId,
          date: dateString,
          entity_type: 'ENTITY_TYPE', // Replace with your entity type
          items: DEFAULT_ENTITY_ITEMS,
          completed_count: 0,
          total_count: DEFAULT_ENTITY_ITEMS.length,
          completion_percentage: 0
        };

        const { data: createdData, error: insertError } = await supabase
          .from('TABLE_NAME') // Replace with your table name
          .insert(defaultEntity)
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        setEntity(createdData);
        console.log('✅ Created default entity');
      } else {
        setEntity(data);
        console.log('✅ Loaded existing entity');
      }

    } catch (err) {
      console.error('❌ Failed to load entity:', err);
      setError(err instanceof Error ? err.message : 'Failed to load entity');
    } finally {
      setIsLoading(false);
    }
  }, [dateString]);

  // Load entity from Supabase
  useEffect(() => {
    loadEntity();
  }, [loadEntity]);

  // Toggle item completion
  const toggleItem = async (itemName: string, completed: boolean) => {
    if (!entity) return;

    try {
      console.log(`🔄 Toggling item ${itemName} to ${completed ? 'completed' : 'incomplete'}`);
      
      // Update local state immediately for responsiveness
      const updatedItems = entity.items.map(item =>
        item.name === itemName ? { ...item, completed } : item
      );
      
      const completedCount = updatedItems.filter(item => item.completed).length;
      const completionPercentage = Math.round((completedCount / updatedItems.length) * 100);
      
      const updatedEntity = {
        ...entity,
        items: updatedItems,
        completed_count: completedCount,
        completion_percentage: completionPercentage
      };
      
      setEntity(updatedEntity);

      // Update database - use snake_case column names to match schema
      const { error: updateError } = await supabase
        .from('TABLE_NAME') // Replace with your table name
        .update({
          items: updatedItems,
          completed_count: completedCount,
          completion_percentage: completionPercentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', entity.id);

      if (updateError) {
        // Revert local state on error
        setEntity(entity);
        throw updateError;
      }

      console.log(`✅ Successfully toggled item ${itemName}`);

    } catch (err) {
      console.error('❌ Failed to toggle item:', err);
      setError(err instanceof Error ? err.message : 'Failed to update item');
      
      // Revert optimistic update on error
      setEntity(entity);
    }
  };

  // TEMPLATE: Add more operations as needed
  const addItem = async (itemName: string) => {
    // Implementation for adding new items
  };

  const removeItem = async (itemName: string) => {
    // Implementation for removing items
  };

  return {
    entity,
    isLoading,
    error,
    toggleItem,
    addItem,
    removeItem,
    refresh: loadEntity
  };
}

// TEMPLATE: Export configuration for easy customization
export const SUPABASE_HOOK_CONFIG = {
  tableName: 'TABLE_NAME', // Replace with your table name
  entityType: 'ENTITY_TYPE', // Replace with your entity type
  defaultItems: DEFAULT_ENTITY_ITEMS,
  
  // Common Supabase patterns used in this template:
  patterns: {
    userIdMapping: 'supabaseClerkUserMapping.getInternalUserId()',
    optimisticUpdates: 'Update local state first, then database',
    errorRecovery: 'Revert local state on database error',
    snakeCaseColumns: 'Use snake_case for database column names',
    dateHandling: 'selectedDate.toISOString().split("T")[0]',
    progressCalculation: 'Math.round((completed / total) * 100)'
  }
};

/**
 * 📋 CHECKLIST: Customizing this template
 * 
 * □ Update interface names (Entity, EntityItem)
 * □ Replace TABLE_NAME with actual Supabase table name
 * □ Replace ENTITY_TYPE with actual entity type
 * □ Update DEFAULT_ENTITY_ITEMS with your default data
 * □ Customize query conditions in loadEntity()
 * □ Update console.log messages to match your entity
 * □ Add additional operations (addItem, removeItem, etc.)
 * □ Update return object with your custom operations
 * □ Test with your specific use case
 * 
 * 🔗 Successful implementations:
 * - useMorningRoutineSupabase.ts (daily_routines table)
 * - useLightWorkTasksSupabase.ts (tasks table)  
 * - useDeepWorkTasksSupabase.ts (tasks table)
 */