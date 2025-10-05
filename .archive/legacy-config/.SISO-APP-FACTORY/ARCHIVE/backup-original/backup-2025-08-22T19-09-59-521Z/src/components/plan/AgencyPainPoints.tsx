
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, BarChart, ArrowRight, ExternalLink, PieChart, Users, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AgencyPainPointModal } from './AgencyPainPointModal';
import { Badge } from '@/components/ui/badge';
import { safeSupabase } from '@/utils/supabaseHelpers';
import { useParams } from 'react-router-dom';
import { safeGet } from '@/utils/typeHelpers';

export interface PainPoint {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  statistic: string;
  icon: string;
  survey_data: {
    percentage: number;
    label: string;
  };
  solutions: string[];
  impact_areas: string[];
  testimonial?: {
    quote: string;
    author: string;
    position: string;
  };
  video_url?: string;
  industry_trends?: {
    year: string;
    value: number;
  }[];
}

interface AgencyPainPointsProps {
  onSolutionRequest?: () => void;
  agencyTypeSlug?: string;
}

// Mapping of agency-specific URLs to industry types
const AGENCY_TO_INDUSTRY_MAP: Record<string, string> = {
  'decora': 'onlyfans-management',
  'default': 'onlyfans-management',
  // Add more mappings as needed
};

export const AgencyPainPoints = ({ onSolutionRequest, agencyTypeSlug }: AgencyPainPointsProps) => {
  const [selectedPainPoint, setSelectedPainPoint] = useState<PainPoint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  
  useEffect(() => {
    const fetchPainPoints = async () => {
      try {
        setLoading(true);
        
        // Get the username from URL params or use the provided agencyTypeSlug
        const usernameParam = params.username || agencyTypeSlug;
        
        // Map the agency username to its industry type
        // If the agency isn't in our mapping, use the default industry or the original username
        const industryType = usernameParam 
          ? AGENCY_TO_INDUSTRY_MAP[usernameParam] || AGENCY_TO_INDUSTRY_MAP.default || usernameParam
          : 'onlyfans-management';
        
        console.log('Fetching pain points for industry type:', industryType);
        
        // Get agency type ID first
        const { data: agencyTypeData, error: agencyTypeError } = await safeSupabase
          .from('agency_types')
          .select('id')
          .eq('slug', industryType)
          .single();
          
        if (agencyTypeError || !agencyTypeData) {
          console.error('Error fetching agency type:', agencyTypeError);
          setLoading(false);
          return;
        }
        
        // Using safe access to get the ID to avoid TypeScript errors
        const agencyTypeId = safeGet(agencyTypeData, 'id', '');
        
        if (!agencyTypeId) {
          console.error('Agency type ID not found');
          setLoading(false);
          return;
        }
        
        // Get pain points for this agency type
        const { data, error } = await safeSupabase
          .from('agency_pain_points')
          .select('*')
          .eq('agency_type_id', agencyTypeId)
          .order('created_at', { ascending: true });
          
        if (error) {
          console.error('Error fetching pain points:', error);
          setLoading(false);
          return;
        }
        
        if (data && Array.isArray(data) && data.length > 0) {
          // Parse JSON fields and ensure proper typing
          const formattedPainPoints: PainPoint[] = data.map((point: any) => {
            // Ensure point is not null or undefined before accessing properties
            if (!point) return {} as PainPoint;
            
            // Parse JSON fields with fallbacks
            let surveyData = { percentage: 0, label: '' };
            if (point.survey_data) {
              try {
                surveyData = typeof point.survey_data === 'string' 
                  ? JSON.parse(point.survey_data) 
                  : point.survey_data;
              } catch (e) {
                console.error('Error parsing survey_data:', e);
              }
            }
            
            let testimonial = undefined;
            if (point.testimonial) {
              try {
                testimonial = typeof point.testimonial === 'string' 
                  ? JSON.parse(point.testimonial) 
                  : point.testimonial;
              } catch (e) {
                console.error('Error parsing testimonial:', e);
              }
            }
            
            let industryTrends = undefined;
            if (point.industry_trends) {
              try {
                industryTrends = typeof point.industry_trends === 'string' 
                  ? JSON.parse(point.industry_trends) 
                  : point.industry_trends;
              } catch (e) {
                console.error('Error parsing industry_trends:', e);
              }
            }
            
            return {
              id: String(point.id || ''),
              title: String(point.title || ''),
              description: String(point.description || ''),
              severity: (String(point.severity || 'medium')) as 'high' | 'medium' | 'low',
              statistic: String(point.statistic || ''),
              icon: String(point.icon || 'info'),
              survey_data: surveyData,
              solutions: Array.isArray(point.solutions) ? point.solutions : [],
              impact_areas: Array.isArray(point.impact_areas) ? point.impact_areas : [],
              testimonial: testimonial,
              video_url: point.video_url || undefined,
              industry_trends: industryTrends
            } as PainPoint;
          });
          
          setPainPoints(formattedPainPoints);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchPainPoints:', error);
        setLoading(false);
      }
    };
    
    fetchPainPoints();
  }, [agencyTypeSlug, params.username]);
  
  const handleOpenModal = (painPoint: PainPoint) => {
    setSelectedPainPoint(painPoint);
    setIsModalOpen(true);
  };

  // Function to render the appropriate icon based on the icon string from database
  const renderIcon = (iconName: string, className: string) => {
    switch(iconName) {
      case 'alert-triangle':
        return <AlertTriangle className={className} />;
      case 'bar-chart':
        return <BarChart className={className} />;
      case 'info':
        return <Info className={className} />;
      default:
        return <Info className={className} />;
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-siso-orange"></div>
        </div>
        <p className="text-center text-siso-text">Loading industry pain points...</p>
      </div>
    );
  }

  if (painPoints.length === 0) {
    return (
      <div className="bg-black/20 border border-siso-text/20 rounded-lg p-6 text-center">
        <AlertTriangle className="h-10 w-10 text-siso-orange mx-auto mb-3" />
        <h3 className="text-white font-semibold mb-2">No Pain Points Found</h3>
        <p className="text-siso-text mb-4">We couldn't find any industry-specific challenges for this agency type.</p>
        {onSolutionRequest && (
          <Button 
            onClick={onSolutionRequest}
            className="bg-siso-orange hover:bg-siso-orange/90"
          >
            Continue to Solutions
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-siso-orange/10 border border-siso-orange/30 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-siso-orange shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-siso-text">
              <span className="font-semibold text-siso-text-bold">Based on our survey of 200+ OnlyFans agencies</span> - These are the most common pain points agencies face when trying to scale past $100k/month in revenue.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="text-xs bg-black/30 border-siso-text/20">
                <PieChart className="h-3 w-3 mr-1" />
                2024 Data
              </Badge>
              <Badge variant="outline" className="text-xs bg-black/30 border-siso-text/20">
                <Users className="h-3 w-3 mr-1" />
                200+ Agencies
              </Badge>
              <Badge variant="outline" className="text-xs bg-black/30 border-siso-text/20">
                <Clock className="h-3 w-3 mr-1" />
                4-Year Trend
              </Badge>
              <Badge variant="outline" className="text-xs bg-black/30 border-siso-text/20">
                <DollarSign className="h-3 w-3 mr-1" />
                $100k+ MRR
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {painPoints.map((painPoint) => (
          <motion.div
            key={painPoint.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOpenModal(painPoint)}
            className="cursor-pointer"
          >
            <Card className="bg-black/20 border-siso-text/10 hover:border-siso-orange/30 transition-all h-full">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${
                      painPoint.severity === 'high' ? 'bg-red-500/10' : 
                      painPoint.severity === 'medium' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                    }`}>
                      {renderIcon(painPoint.icon, "h-6 w-6 " + 
                        (painPoint.severity === 'high' ? 'text-red-500' : 
                         painPoint.severity === 'medium' ? 'text-amber-500' : 'text-blue-500')
                      )}
                    </div>
                    <h3 className="font-semibold text-white">{painPoint.title}</h3>
                  </div>
                  
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    painPoint.severity === 'high' ? 'bg-red-500/10 text-red-400' : 
                    painPoint.severity === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {painPoint.severity === 'high' ? 'Critical Issue' : 
                     painPoint.severity === 'medium' ? 'Major Challenge' : 'Moderate Problem'}
                  </div>
                </div>
                
                <p className="text-siso-text text-sm mb-4">{painPoint.description}</p>
                
                <div className="bg-black/40 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-siso-text/70">Industry Survey</span>
                    <span className="text-xs font-medium text-siso-orange">{painPoint.survey_data.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-siso-text/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-siso-red to-siso-orange rounded-full"
                      style={{ width: `${painPoint.survey_data.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-siso-text/70 mt-1">{painPoint.survey_data.label}</p>
                  
                  {painPoint.industry_trends && (
                    <div className="mt-3 pt-2 border-t border-siso-text/10">
                      <p className="text-xs text-siso-text/70 mb-1">Trend (2021-2024)</p>
                      <div className="flex items-end h-8 gap-1">
                        {painPoint.industry_trends.map((trend, idx) => (
                          <div key={idx} className="flex flex-col items-center flex-1">
                            <div 
                              className={`w-full ${
                                trend.year === '2024' 
                                  ? 'bg-siso-orange' 
                                  : 'bg-siso-text/40'
                              } rounded-sm`}
                              style={{ height: `${(trend.value/100) * 100}%` }}
                            ></div>
                            <span className="text-[10px] text-siso-text/60 mt-1">{trend.year}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-siso-orange">
                    {painPoint.statistic}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-siso-text hover:text-siso-orange hover:bg-transparent p-0"
                  >
                    View Details
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-center">
        <Button
          onClick={onSolutionRequest}
          className="bg-gradient-to-r from-siso-red to-siso-orange hover:opacity-90"
        >
          See How We Solve These Issues
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <AgencyPainPointModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        painPoint={selectedPainPoint}
        onRequestSolution={onSolutionRequest}
      />
    </div>
  );
};
