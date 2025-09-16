/**
 * 🔧 Supabase Service Template
 * 
 * Template for creating Supabase service classes
 * Based on successful patterns from feedbackService.ts
 * 
 * Usage:
 * 1. Copy this template
 * 2. Replace ENTITY_NAME with your entity (e.g., Task, Note, User)
 * 3. Replace TABLE_NAME with your Supabase table name
 * 4. Update interfaces and methods
 * 5. Customize CRUD operations as needed
 */

import { supabase } from '@/shared/lib/supabase';

// TEMPLATE: Define your entity interfaces
export interface CreateEntityRequest {
  title: string;
  description: string;
  category: string;
  // Add more fields as needed
}

export interface Entity {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  // Add more fields as needed
}

// TEMPLATE: Define enums for better type safety
export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type EntityCategory = 'GENERAL' | 'URGENT' | 'PERSONAL';

class EntityService {
  private tableName = 'TABLE_NAME'; // Replace with your table name

  // Create table if it doesn't exist (optional)
  async ensureTableExists(): Promise<void> {
    try {
      const { error } = await supabase.rpc('create_entity_table_if_not_exists');
      if (error) {
        console.log('Table creation RPC not available, assuming table exists or will be created manually');
      }
    } catch (error) {
      console.log('Table creation check skipped:', error);
    }
  }

  // CREATE: Add new entity
  async createEntity(
    entityData: CreateEntityRequest, 
    additionalInfo?: string
  ): Promise<Entity> {
    try {
      // Get current user from Supabase auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const entityPayload = {
        user_id: user.id,
        title: entityData.title,
        description: entityData.description,
        category: entityData.category,
        additional_info: additionalInfo,
        status: 'ACTIVE' as EntityStatus, // Default status
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(entityPayload)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to create entity: ${error.message}`);
      }

      return this.mapToEntity(data);
    } catch (error) {
      console.error('Error creating entity:', error);
      throw error;
    }
  }

  // READ: Get entities for user
  async getUserEntities(userId: string, limit = 50): Promise<Entity[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch entities: ${error.message}`);
      }

      return data.map(this.mapToEntity);
    } catch (error) {
      console.error('Error fetching user entities:', error);
      throw error;
    }
  }

  // READ: Get all entities with filters
  async getAllEntities(
    filters?: {
      status?: EntityStatus;
      category?: EntityCategory;
      limit?: number;
    }
  ): Promise<Entity[]> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch entities: ${error.message}`);
      }

      return data.map(this.mapToEntity);
    } catch (error) {
      console.error('Error fetching all entities:', error);
      throw error;
    }
  }

  // UPDATE: Update entity status
  async updateEntityStatus(
    entityId: string, 
    status: EntityStatus, 
    additionalData?: any
  ): Promise<Entity> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (additionalData) {
        Object.assign(updateData, additionalData);
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', entityId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update entity: ${error.message}`);
      }

      return this.mapToEntity(data);
    } catch (error) {
      console.error('Error updating entity:', error);
      throw error;
    }
  }

  // DELETE: Remove entity
  async deleteEntity(entityId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', entityId);

      if (error) {
        throw new Error(`Failed to delete entity: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting entity:', error);
      throw error;
    }
  }

  // ANALYTICS: Get entity statistics
  async getEntityStats(): Promise<{
    totalEntities: number;
    activeEntities: number;
    archivedEntities: number;
    entitiesByCategory: Record<EntityCategory, number>;
    entitiesByStatus: Record<EntityStatus, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('status, category');

      if (error) {
        throw new Error(`Failed to fetch entity stats: ${error.message}`);
      }

      const stats = {
        totalEntities: data.length,
        activeEntities: data.filter(e => e.status === 'ACTIVE').length,
        archivedEntities: data.filter(e => e.status === 'ARCHIVED').length,
        entitiesByCategory: {} as Record<EntityCategory, number>,
        entitiesByStatus: {} as Record<EntityStatus, number>,
      };

      data.forEach(entity => {
        stats.entitiesByCategory[entity.category as EntityCategory] = 
          (stats.entitiesByCategory[entity.category as EntityCategory] || 0) + 1;
        
        stats.entitiesByStatus[entity.status as EntityStatus] = 
          (stats.entitiesByStatus[entity.status as EntityStatus] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching entity stats:', error);
      throw error;
    }
  }

  // UTILITY: Map database row to Entity interface
  private mapToEntity(data: any): Entity {
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      category: data.category,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      // Add more mappings as needed
    };
  }
}

// Export singleton instance
export const entityService = new EntityService();

// TEMPLATE: Export configuration for easy customization
export const SUPABASE_SERVICE_CONFIG = {
  tableName: 'TABLE_NAME', // Replace with your table name
  
  // Common Supabase patterns used in this template:
  patterns: {
    authentication: 'supabase.auth.getUser()',
    errorHandling: 'Try-catch with detailed error messages',
    snakeCaseColumns: 'Use snake_case for database column names',
    camelCaseMapping: 'Map snake_case to camelCase in interfaces',
    timestampHandling: 'new Date().toISOString()',
    singletonPattern: 'Export single instance for reuse',
    typeEnforcement: 'Use TypeScript enums for better type safety'
  }
};

/**
 * 📋 CHECKLIST: Customizing this template
 * 
 * □ Update class name (EntityService -> YourEntityService)
 * □ Replace TABLE_NAME with actual Supabase table name
 * □ Update CreateEntityRequest interface
 * □ Update Entity interface with your fields
 * □ Update EntityStatus and EntityCategory enums
 * □ Customize createEntity() method
 * □ Update getUserEntities() method
 * □ Customize filters in getAllEntities()
 * □ Update updateEntityStatus() method
 * □ Customize getEntityStats() method
 * □ Update mapToEntity() method
 * □ Export service with proper name
 * □ Test all CRUD operations
 * 
 * 🔗 Successful implementations:
 * - feedbackService.ts (user_feedback table)
 */