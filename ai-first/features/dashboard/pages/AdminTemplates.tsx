import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { BulkPlanCreation } from '@/components/admin/BulkPlanCreation';
import { ShareablePlansSection } from '@/components/admin/templates/ShareablePlansSection';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { Loader2, FileStack, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle';
import { Button } from '@/components/ui/button';

export default function AdminTemplates() {
  const { isAdmin, isLoading } = useAdminCheck();
  const navigate = useNavigate();
  const [showBulkCreation, setShowBulkCreation] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-siso-orange" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-siso-bg via-siso-bg-alt to-siso-bg">
        <div className="container mx-auto px-6 py-12">
          {/* Enhanced Page Header */}
          <div className="mb-12">
            <div className="bg-siso-bg-alt/50 backdrop-blur-sm border border-siso-border rounded-2xl p-8 shadow-2xl">
              <AdminPageTitle
                icon={FileStack}
                title="Plan Templates"
                subtitle="Bulk-create or manage your plan templates for efficient client onboarding"
              />
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center text-siso-text">
                    <div className="w-2 h-2 bg-siso-orange rounded-full mr-3"></div>
                    <span>Bulk Creation Tools</span>
                  </div>
                  <div className="flex items-center text-siso-text">
                    <div className="w-2 h-2 bg-siso-red rounded-full mr-3"></div>
                    <span>Shareable Plans Management</span>
                  </div>
                </div>
                
                {/* Bulk Creation Toggle Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkCreation(!showBulkCreation)}
                  className="border-siso-border bg-siso-bg-alt/60 text-siso-text hover:bg-siso-bg hover:text-siso-text-bold"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Bulk Tools
                  {showBulkCreation ? (
                    <ChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-2" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="space-y-12">
            {/* Collapsible Bulk Creation */}
            {showBulkCreation && (
              <div className="animate-in slide-in-from-top-4 duration-300">
                <BulkPlanCreation />
              </div>
            )}
            
            <ShareablePlansSection />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

