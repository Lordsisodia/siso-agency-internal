
import { useState, useCallback, useRef, useEffect } from 'react';

export interface FeatureDetailState {
  id?: string;
  name?: string;
  description?: string;
  tier?: 'mvp' | 'advanced' | 'premium';
  recommended?: boolean;
  category?: string;
  categoryName?: string;
  timeEstimate?: number;
  roi?: string;
}

export function useFeatureDetail() {
  const isMounted = useRef(true);
  const [featureDetail, setFeatureDetail] = useState<FeatureDetailState | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const safeSetFeatureDetail = useCallback((value: FeatureDetailState | null) => {
    if (isMounted.current) {
      setFeatureDetail(value);
    }
  }, []);
  
  const safeSetIsDetailOpen = useCallback((value: boolean) => {
    if (isMounted.current) {
      setIsDetailOpen(value);
    }
  }, []);
  
  const handleShowFeatureDetail = useCallback((feature: any, categoryName: string) => {
    safeSetFeatureDetail({
      ...feature,
      categoryName
    });
    safeSetIsDetailOpen(true);
  }, [safeSetFeatureDetail, safeSetIsDetailOpen]);
  
  const handleCloseFeatureDetail = useCallback(() => {
    safeSetIsDetailOpen(false);
    // Optional: Add a delay before clearing the detail data
    if (isMounted.current) {
      setTimeout(() => {
        if (isMounted.current) {
          safeSetFeatureDetail(null);
        }
      }, 200);
    }
  }, [safeSetIsDetailOpen, safeSetFeatureDetail]);
  
  return {
    featureDetail,
    isDetailOpen,
    setIsDetailOpen: safeSetIsDetailOpen,
    handleShowFeatureDetail,
    handleCloseFeatureDetail
  };
}
