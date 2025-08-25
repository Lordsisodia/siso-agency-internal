
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TableColumn } from './useTableColumns';

export interface SavedView {
  id: string;
  name: string;
  filters: {
    searchQuery?: string;
    [key: string]: any;
  };
  columns: TableColumn[];
  user_id: string;
  table_name: string;
}

export function useTableViews(tableName: string) {
  const [views, setViews] = useState<SavedView[]>([]);
  const [currentView, setCurrentView] = useState<SavedView | null>(null);

  const loadViews = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('table_views')
      .select('*')
      .eq('table_name', tableName)
      .eq('user_id', user.id);

    if (!error && data) {
      // Convert data from database format to our SavedView format
      const formattedViews: SavedView[] = data.map(item => ({
        id: item.id,
        name: item.name,
        filters: item.filters as SavedView['filters'],
        columns: item.columns as unknown as TableColumn[],
        user_id: item.user_id,
        table_name: item.table_name
      }));
      
      setViews(formattedViews);
    } else {
      console.error("Error loading views:", error);
    }
  };

  const saveView = async (name: string, state: { filters: any; columns: TableColumn[] }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    try {
      // Convert TableColumn[] to JSON compatible format for database storage
      const { data, error } = await supabase
        .from('table_views')
        .insert({
          name,
          table_name: tableName,
          user_id: user.id,
          filters: state.filters,
          columns: state.columns as unknown as any
        })
        .select()
        .single();

      if (!error && data) {
        // Convert the returned data back to our SavedView format
        const newView: SavedView = {
          id: data.id,
          name: data.name,
          filters: data.filters as SavedView['filters'],
          columns: data.columns as unknown as TableColumn[],
          user_id: data.user_id,
          table_name: data.table_name
        };
        
        setViews([...views, newView]);
        return true;
      } else {
        console.error("Error saving view:", error);
        return false;
      }
    } catch (error) {
      console.error("Error saving view:", error);
      return false;
    }
  };

  const selectView = (view: SavedView) => {
    setCurrentView(view);
  };

  return {
    views,
    currentView,
    loadViews,
    saveView,
    selectView
  };
}
