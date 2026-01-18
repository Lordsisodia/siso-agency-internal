
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Plus } from 'lucide-react';

export function CheckInsView() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-purple-500" />
            Daily Business Check-In
          </CardTitle>
          <CardDescription>
            Reflect on your day, note achievements, and plan improvements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="check-in-date">Date</Label>
              <Input type="date" id="check-in-date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <Label htmlFor="key-metrics">Key Metrics</Label>
              <Input 
                type="text" 
                id="key-metrics" 
                placeholder="e.g., Revenue: $1500, New Leads: 3"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="went-well">What went well today?</Label>
            <Textarea 
              id="went-well" 
              placeholder="List your achievements and successes..." 
              className="min-h-[100px]"
            />
          </div>
          
          <div>
            <Label htmlFor="improve">What could be improved?</Label>
            <Textarea 
              id="improve" 
              placeholder="Note areas that need attention or improvement..." 
              className="min-h-[100px]"
            />
          </div>
          
          <div>
            <Label htmlFor="action-items">Action items for tomorrow</Label>
            <Textarea 
              id="action-items" 
              placeholder="List concrete actions to take..." 
              className="min-h-[100px]"
            />
          </div>
          
          <div className="flex justify-end">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Save Check-In
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Previous Check-Ins</CardTitle>
          <CardDescription>
            View your past business reflections and insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No previous check-ins found</p>
            <p className="text-sm mt-2">Complete your first check-in to start tracking your business reflections</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
