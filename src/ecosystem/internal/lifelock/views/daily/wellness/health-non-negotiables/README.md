# 🥗 Health Non-Negotiables Section

## Overview

The Health Non-Negotiables section tracks essential daily health metrics that are fundamental to well-being. It focuses on nutrition tracking, hydration monitoring, and vital health indicators that should never be compromised.

## Purpose & Philosophy

Health Non-Negotiables are the minimum health requirements for optimal functioning. This section emphasizes consistency, tracking, and awareness of daily health habits that form the foundation of physical and mental performance.

## Core Features

### 1. Nutrition Tracking
- **Purpose**: Monitor daily food intake and macros
- **Features**:
  - Meal logging (breakfast, lunch, dinner, snacks)
  - Calorie tracking
  - Macronutrient monitoring (protein, carbs, fats)
  - Hydration tracking
- **Implementation**: `HealthNonNegotiablesSection.tsx`

### 2. Macro Nutrient Monitoring
- **Purpose**: Track nutritional balance
- **Features**:
  - Protein intake tracking
  - Carbohydrate monitoring
  - Fat intake tracking
  - Daily macro goals
- **Implementation**: `MacroTracker.tsx`

### 3. Meal Input System
- **Purpose**: Quick and easy meal logging
- **Features**:
  - Simple meal entry
  - Food item logging
  - Portion size tracking
  - Meal timing
- **Implementation**: `MealInput.tsx`

### 4. Hydration Monitoring
- **Purpose**: Ensure adequate water intake
- **Features**:
  - Water consumption tracking
  - Daily hydration goals
  - Intake reminders
  - Progress visualization
- **Implementation**: Integrated with main section

## Component Architecture

### Main Component
- **File**: `HealthNonNegotiablesSection.tsx`
- **Lines**: 168 (down from 238 after extraction)
- **Responsibilities**: Health data management, UI coordination, progress tracking

### Supporting Components
- **MealInput.tsx** (36 lines)
  - Reusable meal entry component
  - Used 4 times (breakfast, lunch, dinner, snacks)
  - Simple, focused interface

- **MacroTracker.tsx** (78 lines)
  - Macronutrient display
  - Progress tracking
  - Visual indicators
  - Used 4 times (calories, protein, carbs, fats)

## Data Management

### Supabase Integration
```typescript
const {
  healthData,
  loading,
  error,
  saveHealthData,
  updateHealthMetric,
  refreshHealthData
} = useHealthNonNegotiablesSupabase({ selectedDate });
```

### Local Storage
- Immediate UI updates
- Offline functionality
- Quick data access

### Data Structure
```typescript
interface HealthNonNegotiables {
  id: string;
  userId: string;
  date: string;
  meals: {
    breakfast: MealEntry[];
    lunch: MealEntry[];
    dinner: MealEntry[];
    snacks: MealEntry[];
  };
  hydration: {
    waterIntake: number; // in ml
    goal: number; // daily goal in ml
  };
  macros: {
    calories: MacroTarget;
    protein: MacroTarget;
    carbs: MacroTarget;
    fats: MacroTarget;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Meal Entry Structure
```typescript
interface MealEntry {
  id: string;
  name: string;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fats: number; // in grams
  portion: string;
  time: string;
}
```

### Macro Target Structure
```typescript
interface MacroTarget {
  current: number;
  goal: number;
  unit: string;
}
```

## Nutrition Tracking

### Daily Goals
- **Calories**: 2000-2500 (adjustable)
- **Protein**: 0.8-1.2g per kg body weight
- **Carbohydrates**: 45-65% of total calories
- **Fats**: 20-35% of total calories
- **Water**: 2-3 liters (adjustable for activity)

### Meal Categories
1. **Breakfast** (7:00-9:00 AM)
   - High protein
   - Complex carbs
   - Healthy fats

2. **Lunch** (12:00-2:00 PM)
   - Balanced macros
   - Moderate calories
   - Energy sustaining

3. **Dinner** (6:00-8:00 PM)
   - Protein focused
   - Lower carbs
   - Easy to digest

4. **Snacks** (as needed)
   - Light options
   - Nutrient dense
   - Portion controlled

## Theme & Design

### Color Scheme
- **Primary**: Green/Teal theme
- **Background**: Green-900/20 with teal-700/50 borders
- **Text**: Green-400 for headers, green-100 for content
- **Progress**: Green gradients for goal achievement

### Visual Design
- Clean, health-focused interface
- Card-based meal display
- Progress-focused layout
- Mobile-optimized design

### Interactive Elements
- Smooth input animations
- Progress bar animations
- Touch-friendly controls
- Visual feedback for actions

## User Experience Flow

1. **Morning Check-in**: Log breakfast and hydration
2. **Mid-day Update**: Log lunch and water intake
3. **Evening Review**: Log dinner and final macros
4. **Progress Review**: View daily nutrition summary
5. **Goal Adjustment**: Update targets as needed

## Integration Points

### Health Ecosystem
- Integration with wearable devices
- Apple Health/Google Fit sync
- Third-party nutrition apps
- Health dashboard aggregation

### Morning Routine
- Post-morning hydration tracking
- Breakfast logging
- Supplement tracking
- Energy level correlation

### Wellness Dashboard
- Weekly nutrition summaries
- Health trend analysis
- Goal progress tracking
- Recommendations engine

## Best Practices

### For Developers
1. **Simple Input**: Minimize friction for meal logging
2. **Visual Feedback**: Clear progress indicators
3. **Data Validation**: Ensure accurate macro calculations
4. **Performance**: Optimize for frequent updates

### For Users
1. **Consistency**: Log every meal for accuracy
2. **Honesty**: Track everything, even "cheat" meals
3. **Balance**: Focus on overall patterns, not perfection
4. **Adjustment**: Modify goals based on results

## Nutrition Guidelines

### Balanced Diet Principles
- Whole foods优先
- Colorful plate variety
- Adequate protein intake
- Healthy fat inclusion
- Complex carbohydrate focus

### Hydration Guidelines
- 2-3 liters daily baseline
- +500ml per hour of exercise
- Monitor urine color
- Spread intake throughout day

### Timing Considerations
- Protein with each meal
- Carbs around workouts
- Fats in moderation
- Snacks for energy gaps

## Progress Tracking

### Daily Metrics
- Calorie intake vs goal
- Macro distribution
- Hydration percentage
- Meal timing consistency

### Weekly Metrics
- Average daily intake
- Nutrient consistency
- Hydration patterns
- Goal achievement rate

### Monthly Metrics
- Nutritional trends
- Health improvements
- Goal adjustments
- Habit formation progress

## Future Enhancements

### Planned Features
- **Barcode Scanning**: Quick food entry
- **Recipe Integration**: Meal planning
- **Photo Logging**: Visual meal tracking
- **AI Recommendations**: Personalized nutrition advice

### Technical Improvements
- **Offline Database**: Local nutrition database
- **Voice Input**: Hands-free meal logging
- **Smart Suggestions**: Meal recommendations
- **Advanced Analytics**: Detailed nutrition insights

## Troubleshooting

### Common Issues
1. **Macro Calculations**: Verify serving sizes
2. **Data Not Saving**: Check network connection
3. **Progress Not Updating**: Refresh page
4. **Search Not Working**: Check food database

### Debug Information
- Console logs for meal actions
- Network tab for API requests
- LocalStorage for offline data
- Validation logs for calculations

## Related Components

- `HomeWorkoutSection` - Exercise calorie tracking
- `MorningRoutineSection` - Morning hydration
- `TimeboxSection` - Meal scheduling
- `NightlyCheckoutSection` - Daily nutrition review

## Dependencies

```typescript
// External dependencies
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

// Internal dependencies
import { useHealthNonNegotiablesSupabase } from '@/shared/hooks/useHealthNonNegotiablesSupabase';
import { MealInput } from './components/MealInput';
import { MacroTracker } from './components/MacroTracker';
```

## Health Guidelines

### Daily Minimums
- **Water**: 2 liters minimum
- **Protein**: 0.8g per kg body weight
- **Fiber**: 25-30 grams
- **Vegetables**: 5 servings
- **Fruits**: 2-3 servings

### Limits to Monitor
- **Sodium**: <2300mg daily
- **Added Sugar**: <50g daily
- **Saturated Fat**: <10% of calories
- **Alcohol**: Moderate consumption
- **Processed Foods**: Minimize intake

### Timing Best Practices
- **Breakfast**: Within 2 hours of waking
- **Pre-workout**: 1-2 hours before exercise
- **Post-workout**: Within 30 minutes
- **Last Meal**: 2-3 hours before bed

---

**Last Updated**: 2025-10-13  
**Version**: 1.0  
**Maintainer**: SISO Development Team