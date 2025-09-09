/**
 * 🌅 Checkout Data Persistence Hook
 * 
 * Handles saving and loading nightly checkout/reflection data to database
 * Falls back to localStorage if database operations fail
 */

import { useState, useEffect, useCallback } from 'react';
import { prismaClient } from '@/integrations/prisma/client';
import { format } from 'date-fns';

export interface CheckoutData {
  wentWell: string[];
  evenBetterIf: string[];
  analysis: string[];
  patterns: string[];
  changes: string[];
}

const DEFAULT_CHECKOUT: CheckoutData = {
  wentWell: ['', '', ''],
  evenBetterIf: ['', '', '', '', ''],
  analysis: ['', '', ''],
  patterns: ['', '', ''],
  changes: ['', '', '']
};

export function useCheckoutPersistence(selectedDate: Date, userId?: string) {
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const [checkoutData, setCheckoutData] = useState<CheckoutData>(DEFAULT_CHECKOUT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load checkout data from database or localStorage fallback
  const loadCheckoutData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (userId) {
        console.log('📊 [CHECKOUT] Loading from database:', userId, dateKey);
        
        // Try database first
        try {
          await prismaClient.$connect();
          const reflection = await prismaClient.dailyReflections.findUnique({
            where: {
              userId_date: {
                userId,
                date: dateKey
              }
            }
          });

          if (reflection) {
            console.log('✅ [CHECKOUT] Found database record');
            const data = {
              wentWell: JSON.parse(reflection.wentWell || '[]'),
              evenBetterIf: JSON.parse(reflection.evenBetterIf || '[]'),
              analysis: JSON.parse(reflection.analysis || '[]'),
              patterns: JSON.parse(reflection.patterns || '[]'),
              changes: JSON.parse(reflection.changes || '[]')
            };
            
            // Ensure proper array lengths
            const formattedData = {
              wentWell: [...data.wentWell, ...Array(3).fill('')].slice(0, 3),
              evenBetterIf: [...data.evenBetterIf, ...Array(5).fill('')].slice(0, 5),
              analysis: [...data.analysis, ...Array(3).fill('')].slice(0, 3),
              patterns: [...data.patterns, ...Array(3).fill('')].slice(0, 3),
              changes: [...data.changes, ...Array(3).fill('')].slice(0, 3)
            };
            
            setCheckoutData(formattedData);
            return;
          } else {
            console.log('📝 [CHECKOUT] No database record, using defaults');
          }
        } catch (dbError) {
          console.warn('⚠️ [CHECKOUT] Database failed, falling back to localStorage:', dbError);
        }
      }

      // Fallback to localStorage
      console.log('💾 [CHECKOUT] Loading from localStorage:', dateKey);
      const saved = localStorage.getItem(`lifelock-${dateKey}-nightlyCheckout`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCheckoutData(parsed);
      } else {
        setCheckoutData(DEFAULT_CHECKOUT);
      }

    } catch (error) {
      console.error('❌ [CHECKOUT] Load failed:', error);
      setError('Failed to load checkout data');
      setCheckoutData(DEFAULT_CHECKOUT);
    } finally {
      setIsLoading(false);
    }
  }, [userId, dateKey]);

  // Save checkout data to database with localStorage fallback
  const saveCheckoutData = useCallback(async (data: CheckoutData) => {
    try {
      setError(null);
      console.log('💾 [CHECKOUT] Saving checkout data:', userId, dateKey);

      // Always save to localStorage as backup
      localStorage.setItem(`lifelock-${dateKey}-nightlyCheckout`, JSON.stringify(data));

      if (userId) {
        try {
          await prismaClient.$connect();
          
          console.log('📊 [CHECKOUT] Saving to database');
          await prismaClient.dailyReflections.upsert({
            where: {
              userId_date: {
                userId,
                date: dateKey
              }
            },
            update: {
              wentWell: JSON.stringify(data.wentWell.filter(item => item.trim() !== '')),
              evenBetterIf: JSON.stringify(data.evenBetterIf.filter(item => item.trim() !== '')),
              analysis: JSON.stringify(data.analysis.filter(item => item.trim() !== '')),
              patterns: JSON.stringify(data.patterns.filter(item => item.trim() !== '')),
              changes: JSON.stringify(data.changes.filter(item => item.trim() !== '')),
              updatedAt: new Date()
            },
            create: {
              userId,
              date: dateKey,
              wentWell: JSON.stringify(data.wentWell.filter(item => item.trim() !== '')),
              evenBetterIf: JSON.stringify(data.evenBetterIf.filter(item => item.trim() !== '')),
              analysis: JSON.stringify(data.analysis.filter(item => item.trim() !== '')),
              patterns: JSON.stringify(data.patterns.filter(item => item.trim() !== '')),
              changes: JSON.stringify(data.changes.filter(item => item.trim() !== '')),
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
          
          console.log('✅ [CHECKOUT] Database save successful');
          
        } catch (dbError) {
          console.warn('⚠️ [CHECKOUT] Database save failed, localStorage backup saved:', dbError);
        }
      }

      setCheckoutData(data);
      
    } catch (error) {
      console.error('❌ [CHECKOUT] Save failed:', error);
      setError('Failed to save checkout data');
    }
  }, [userId, dateKey]);

  // Load data when component mounts or dependencies change
  useEffect(() => {
    loadCheckoutData();
  }, [loadCheckoutData]);

  return {
    checkoutData,
    setCheckoutData: saveCheckoutData,
    isLoading,
    error,
    reload: loadCheckoutData
  };
}