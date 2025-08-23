import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

interface HealthItem {
  id: string;
  title: string;
  completed: boolean;
}

interface HealthNonNegotiablesSectionProps {
  selectedDate: Date;
}

export const HealthNonNegotiablesSection: React.FC<HealthNonNegotiablesSectionProps> = ({
  selectedDate
}) => {
  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  
  const [healthItems, setHealthItems] = useState<HealthItem[]>(() => {
    const saved = localStorage.getItem(`lifelock-${dateKey}-healthItems`);
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Take vitamins/supplements', completed: false },
      { id: '2', title: 'Drink 2L+ water', completed: false },
      { id: '3', title: 'No smoking THC', completed: false },
      { id: '4', title: 'Eat balanced meals', completed: false },
      { id: '5', title: 'Get 7+ hours sleep', completed: false }
    ];
  });

  const [meals, setMeals] = useState(() => {
    const saved = localStorage.getItem(`lifelock-${dateKey}-meals`);
    return saved ? JSON.parse(saved) : {
      breakfast: '',
      lunch: '',
      dinner: '',
      snacks: ''
    };
  });

  const [dailyTotals, setDailyTotals] = useState(() => {
    const saved = localStorage.getItem(`lifelock-${dateKey}-dailyTotals`);
    return saved ? JSON.parse(saved) : {
      calories: '',
      protein: '',
      carbs: '',
      fats: ''
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(`lifelock-${dateKey}-healthItems`, JSON.stringify(healthItems));
  }, [healthItems, dateKey]);

  useEffect(() => {
    localStorage.setItem(`lifelock-${dateKey}-meals`, JSON.stringify(meals));
  }, [meals, dateKey]);

  useEffect(() => {
    localStorage.setItem(`lifelock-${dateKey}-dailyTotals`, JSON.stringify(dailyTotals));
  }, [dailyTotals, dateKey]);

  const toggleItem = (id: string) => {
    const updatedItems = healthItems.map((item: HealthItem) => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setHealthItems(updatedItems);
  };

  const healthProgress = (healthItems.filter(item => item.completed).length / healthItems.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="bg-pink-900/20 border-pink-700/50">
        <CardHeader>
          <CardTitle className="flex items-center text-pink-400">
            <Heart className="h-5 w-5 mr-2" />
            💖 Health Non Negotiables
          </CardTitle>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-pink-300 mb-2">
              <span>Health Progress</span>
              <span>{Math.round(healthProgress)}%</span>
            </div>
            <div className="w-full bg-pink-900/30 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-pink-400 to-pink-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${healthProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
          
          <div className="border-t border-gray-600 my-4"></div>
          <p className="text-gray-300 text-sm">Main Tasks:</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {healthItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <span className="text-white">{item.title}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-600 my-6"></div>
          
          {/* Daily Calorie & Macro Tracker */}
          <h3 className="font-semibold text-white mb-4">Daily Calorie & Macro Tracker</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-white text-sm font-medium">Breakfast:</label>
              <Textarea
                value={meals.breakfast}
                onChange={(e) => setMeals(prev => ({ ...prev, breakfast: e.target.value }))}
                className="mt-1 bg-gray-700 border-gray-600 text-white"
                placeholder="Enter breakfast details..."
              />
            </div>
            <div>
              <label className="text-white text-sm font-medium">Lunch:</label>
              <Textarea
                value={meals.lunch}
                onChange={(e) => setMeals(prev => ({ ...prev, lunch: e.target.value }))}
                className="mt-1 bg-gray-700 border-gray-600 text-white"
                placeholder="Enter lunch details..."
              />
            </div>
            <div>
              <label className="text-white text-sm font-medium">Dinner:</label>
              <Textarea
                value={meals.dinner}
                onChange={(e) => setMeals(prev => ({ ...prev, dinner: e.target.value }))}
                className="mt-1 bg-gray-700 border-gray-600 text-white"
                placeholder="Enter dinner details..."
              />
            </div>
            <div>
              <label className="text-white text-sm font-medium">Snacks:</label>
              <Textarea
                value={meals.snacks}
                onChange={(e) => setMeals(prev => ({ ...prev, snacks: e.target.value }))}
                className="mt-1 bg-gray-700 border-gray-600 text-white"
                placeholder="Enter snack details..."
              />
            </div>
          </div>

          <div className="border-t border-gray-600 my-4"></div>
          
          <h4 className="font-semibold text-white mb-3">Daily Totals:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-white text-sm">Total Calories:</label>
              <Input
                value={dailyTotals.calories}
                onChange={(e) => setDailyTotals(prev => ({ ...prev, calories: e.target.value }))}
                className="mt-1 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="text-white text-sm">Total Protein:</label>
              <Input
                value={dailyTotals.protein}
                onChange={(e) => setDailyTotals(prev => ({ ...prev, protein: e.target.value }))}
                className="mt-1 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="text-white text-sm">Total Carbs:</label>
              <Input
                value={dailyTotals.carbs}
                onChange={(e) => setDailyTotals(prev => ({ ...prev, carbs: e.target.value }))}
                className="mt-1 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="text-white text-sm">Total Fats:</label>
              <Input
                value={dailyTotals.fats}
                onChange={(e) => setDailyTotals(prev => ({ ...prev, fats: e.target.value }))}
                className="mt-1 bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};