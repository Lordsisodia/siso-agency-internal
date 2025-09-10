# Morning Routine Micro-animations & Mobile UX Plan

## 🎬 Micro-Animation Specifications

### 1. Check-off Interactions
```typescript
// Smooth checkbox animations
const checkboxVariants = {
  unchecked: { 
    scale: 1, 
    backgroundColor: "rgba(250, 204, 21, 0.1)",
    borderColor: "rgba(250, 204, 21, 0.4)" 
  },
  checked: { 
    scale: [1, 1.2, 1], 
    backgroundColor: "rgba(34, 197, 94, 0.3)",
    borderColor: "rgba(34, 197, 94, 0.8)",
    transition: { 
      duration: 0.3, 
      type: "spring",
      stiffness: 300 
    }
  },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.1 }
  }
}

// Checkmark animation
const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1,
    transition: { 
      pathLength: { duration: 0.3, ease: "easeOut" },
      opacity: { duration: 0.1 }
    }
  }
}
```

### 2. Task Completion Celebrations
```typescript
// Confetti animation for task completion
const celebrationVariants = {
  hidden: { scale: 0, rotate: 0 },
  visible: { 
    scale: [0, 1.5, 1], 
    rotate: [0, 180, 360],
    transition: { 
      duration: 0.6, 
      ease: "easeOut" 
    }
  }
}

// Progress counter animation
const counterVariants = {
  initial: { scale: 1 },
  updated: { 
    scale: [1, 1.3, 1],
    backgroundColor: ["rgba(250, 204, 21, 0.2)", "rgba(34, 197, 94, 0.3)", "rgba(34, 197, 94, 0.2)"],
    transition: { duration: 0.4 }
  }
}

// Completion pulse effect
const pulseVariants = {
  rest: { scale: 1, opacity: 0.8 },
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: "easeInOut"
    }
  }
}
```

### 3. Task Icon Animations
```typescript
// Animated task icons
const iconVariants = {
  idle: { 
    rotate: 0, 
    scale: 1,
    y: 0 
  },
  hover: { 
    rotate: [0, -5, 5, 0], 
    scale: 1.1,
    transition: { duration: 0.3 }
  },
  completed: {
    scale: [1, 1.2, 1],
    rotate: [0, 360],
    y: [0, -5, 0],
    transition: { duration: 0.5 }
  },
  bounce: {
    y: [0, -10, 0],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "easeInOut"
    }
  }
}

// Specific icon animations per task type
const taskIconAnimations = {
  dumbbell: {
    hover: { rotate: [0, -15, 15, 0] }, // Weight lifting motion
    completed: { y: [0, -8, 0] } // Lifting motion
  },
  sun: {
    hover: { rotate: 360, transition: { duration: 2 } }, // Sunrise rotation
    completed: { scale: [1, 1.3, 1], opacity: [1, 0.8, 1] }
  },
  droplets: {
    hover: { y: [0, -3, 0], transition: { repeat: 3 } }, // Dripping motion
    completed: { rotate: [0, 10, -10, 0] }
  }
}
```

## 📱 Mobile Layout Improvements

### 1. Enhanced Touch Targets
```css
/* Minimum touch target sizes */
.checkbox-mobile {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
  border-radius: 12px;
}

.task-card-mobile {
  padding: 16px 20px;
  margin: 8px 0;
  border-radius: 16px;
  min-height: 60px;
}

.progress-counter-mobile {
  min-width: 48px;
  min-height: 32px;
  padding: 8px 16px;
  font-size: 16px;
}
```

### 2. Swipe Gesture Implementation
```typescript
// Swipe to complete gesture
const swipeHandlers = useSwipeable({
  onSwipedRight: (eventData) => {
    if (eventData.deltaX > 100) {
      handleTaskComplete(taskId, true);
      triggerHapticFeedback('success');
    }
  },
  onSwipedLeft: (eventData) => {
    if (eventData.deltaX < -100) {
      handleTaskComplete(taskId, false);
      triggerHapticFeedback('warning');
    }
  },
  preventDefaultTouchmoveEvent: true,
  trackMouse: true
});

// Visual swipe indicators
const swipeIndicatorVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.2 }
  },
  swipeRight: {
    x: [0, 50, 0],
    backgroundColor: ["rgba(34, 197, 94, 0.1)", "rgba(34, 197, 94, 0.3)", "rgba(34, 197, 94, 0.1)"],
    transition: { duration: 0.3 }
  }
}
```

### 3. Responsive Design Enhancements
```typescript
// Breakpoint-aware component sizing
const useResponsiveLayout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const layoutConfig = {
    mobile: {
      cardPadding: "16px",
      fontSize: "14px",
      iconSize: "20px",
      touchTargetSize: "44px",
      swipeThreshold: 80
    },
    tablet: {
      cardPadding: "20px", 
      fontSize: "16px",
      iconSize: "24px",
      touchTargetSize: "40px",
      swipeThreshold: 100
    },
    desktop: {
      cardPadding: "24px",
      fontSize: "16px", 
      iconSize: "20px",
      touchTargetSize: "36px",
      swipeThreshold: 120
    }
  };
  
  return isMobile ? layoutConfig.mobile : 
         window.innerWidth < 1024 ? layoutConfig.tablet : 
         layoutConfig.desktop;
};
```

## 🔧 Implementation Strategy

### Phase 1: Basic Animations (Week 1)
1. **Checkbox Animations**
   - Smooth scale transitions on check/uncheck
   - Hover effects with subtle scale increase
   - Color transitions between states

2. **Progress Counter Updates**
   - Animated number changes
   - Color shifts on completion
   - Scale pulse on updates

### Phase 2: Celebration Effects (Week 2)
1. **Task Completion**
   - Confetti animation on individual tasks
   - Sound effects (optional toggle)
   - Brief celebration text overlay

2. **Full Routine Completion**
   - Screen-wide celebration animation
   - Achievement notification
   - Progress bar completion effect

### Phase 3: Mobile Optimization (Week 3)
1. **Touch Targets**
   - Increase checkbox and button sizes
   - Add padding for easier interaction
   - Implement haptic feedback

2. **Swipe Gestures**
   - Right swipe to complete
   - Left swipe to mark incomplete
   - Visual feedback during swipe

### Phase 4: Advanced Interactions (Week 4)
1. **Icon Animations**
   - Task-specific animated states
   - Hover and completion effects
   - Contextual micro-interactions

2. **Layout Enhancements**
   - Improved card stacking
   - Better visual hierarchy
   - Smooth transitions between states

## 🎯 Success Metrics

### Animation Performance
- **Frame Rate**: Maintain 60fps during animations
- **Load Time**: No impact on initial page load
- **Battery Usage**: Minimal impact on mobile devices

### User Engagement  
- **Interaction Rate**: Increase in checkbox interactions
- **Session Duration**: Longer time spent on routine page
- **Completion Rate**: Higher task completion percentages

### Mobile Usability
- **Touch Accuracy**: Reduced mis-taps on interactive elements
- **Gesture Adoption**: Users discovering and using swipe features
- **Accessibility**: Screen reader compatibility maintained

## 🛠️ Technical Requirements

### Dependencies
```json
{
  "framer-motion": "^10.16.0",
  "react-spring": "^9.7.0", 
  "react-swipeable": "^7.0.0",
  "@react-native-haptic-feedback": "^2.0.0"
}
```

### Performance Considerations
- Use `transform` and `opacity` for animations (GPU accelerated)
- Implement `will-change` CSS property strategically
- Debounce rapid gesture inputs
- Lazy load animation libraries
- Provide reduced motion preferences

---

*Implementation Priority: High*
*Estimated Effort: 2-3 weeks*
*Dependencies: None*