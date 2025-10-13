# 🚀 Next-Generation Timebox Features

> **Philosophy**: Apply Musk's Algorithm - Question requirements, Delete bloat, Simplify ruthlessly, Accelerate value, Automate friction

**Created**: October 13, 2025
**Status**: Ready for Implementation
**Estimated Total Time**: 12-18 hours for all features

---

## 🎯 Feature Pipeline (Ordered by Value/Effort)

### Phase 3A: Mobile Superpowers (3-4 hours)

#### 1. **Focus Sprint Generator** ⚡
**Complexity**: Easy (30-60 min)
**Impact**: 🔥🔥🔥 High
**Priority**: 🎯 IMPLEMENT FIRST

**The Problem**:
> "I want to do 4 Pomodoro cycles but creating 8 blocks (4 work + 4 breaks) takes forever"

**The Solution**:
- One button: "Start Focus Sprint"
- Choose template:
  - Classic Pomodoro: 25/5 x4 (2 hours)
  - Extended Focus: 50/10 x2 (2 hours)
  - Deep Immersion: 90/20 x2 (3.5 hours)
- Auto-creates perfectly chained work + break blocks

**Value Prop**: Turns 16 taps into 1 tap

**Implementation**:
```typescript
const SPRINT_TEMPLATES = {
  pomodoro: [
    { type: 'DEEP_WORK', duration: 25 },
    { type: 'BREAK', duration: 5 },
    // Repeat 4 times
  ],
  extended: [
    { type: 'DEEP_WORK', duration: 50 },
    { type: 'BREAK', duration: 10 },
    // Repeat 2 times
  ]
};

const createFocusSprint = async (startTime, template) => {
  let currentMinute = parseTime(startTime);

  for (const block of template) {
    await createTimeBlock({
      title: block.type === 'DEEP_WORK' ? '🎯 Deep Focus' : '☕ Break',
      startTime: formatTime(currentMinute),
      endTime: formatTime(currentMinute + block.duration),
      category: block.type
    });
    currentMinute += block.duration;
  }
};
```

**Reuses**: `handleAddAfter()` pattern, `createTimeBlock()`
**Location**: Add button to QuickTaskScheduler or timeline header

---

#### 2. **Swipe Actions** 📱
**Complexity**: Medium (1-2 hours)
**Impact**: 🔥🔥🔥 High (Mobile Power Users)
**Priority**: ⭐ NEXT

**The Problem**:
> "On mobile, completing/moving tasks requires 3-4 taps"

**The Solution**:
| Gesture | Action | Result |
|---------|--------|--------|
| Swipe ← | Complete | ✅ Mark done + confetti |
| Swipe → | Snooze | 📅 Move +1 hour |
| Swipe ↑ | Delete | 🗑️ Remove block |
| Long press | Sprint menu | ⚡ Focus options |

**Implementation**:
```typescript
// Add to task motion.div
onPan={(e, info) => {
  if (Math.abs(info.offset.x) < 50) return;

  if (info.offset.x < -50) {
    // Swipe left - complete
    handleToggleComplete(task.id);
    navigator.vibrate(50);
  } else if (info.offset.x > 50) {
    // Swipe right - snooze +1hr
    handleSnooze(task.id);
    navigator.vibrate([30, 10, 30]);
  }
}}
```

**Reuses**: Existing drag handlers, `toggleCompletion()`
**Feedback**: Haptic vibration + color animation

---

#### 3. **Micro-Celebrations** 🎉
**Complexity**: Easy (30 min)
**Impact**: 🔥🔥 Medium (Engagement)
**Priority**: ⭐ QUICK WIN

**Celebration Triggers**:
```typescript
const celebrations = {
  bigWin: {
    trigger: 'Complete 2hr+ deep work block',
    effect: '🎊 Confetti burst',
    sound: 'success.mp3',
    haptic: [100, 50, 100, 50, 100]
  },
  onFire: {
    trigger: 'Complete 5 blocks in a day',
    effect: '🔥 Fire animation',
    toast: 'You\'re on fire!'
  },
  perfectDay: {
    trigger: 'All blocks completed',
    effect: '💎 Diamond sparkle',
    toast: 'Perfect day achieved!'
  },
  streak: {
    trigger: '3+ consecutive days',
    effect: '⚡ Lightning bolt',
    toast: `${streakCount} day streak!`
  }
};
```

**Implementation**:
```typescript
const celebrate = (type) => {
  // Visual
  if (type === 'confetti') {
    // Use CSS animation or lightweight lib
    showConfetti();
  }

  // Toast
  toast.success(celebrations[type].toast, {
    icon: celebrations[type].effect,
    duration: 3000
  });

  // Haptic
  navigator.vibrate(celebrations[type].haptic);
};
```

**Trigger**: In `handleToggleComplete()` after success

---

### Phase 3B: Intelligence Layer (4-5 hours)

#### 4. **Smart Gap Filler** 🧩
**Complexity**: Medium (1-2 hours)
**Impact**: 🔥🔥🔥 High
**Priority**: ⭐⭐ HIGH VALUE

**The Problem**:
> "I have a 35-minute gap between meetings. What task fits perfectly?"

**The Solution**:
- Tap empty gap on timeline
- AI suggests 3 tasks:
  - ✅ Sized for gap (30-40min for 35min gap)
  - ✅ Prioritized by importance
  - ✅ One-tap to schedule

**Algorithm**:
```typescript
const suggestGapTasks = (gapStart, gapMinutes) => {
  // Get all incomplete tasks
  const candidates = [...deepWorkTasks, ...lightWorkTasks]
    .filter(t => !t.completed)
    .filter(t => {
      const est = t.estimatedDuration || 30;
      return est <= gapMinutes + 15 && est >= gapMinutes - 15;
    });

  // Score by priority + urgency
  const scored = candidates.map(t => ({
    task: t,
    score: getPriorityScore(t) + getUrgencyScore(t)
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.task);
};
```

**UI**: Small card overlay at gap position
**Reuses**: `QuickTaskScheduler` pattern, `createTimeBlock()`

---

#### 5. **Energy Windows** 🌅
**Complexity**: Medium (1-2 hours)
**Impact**: 🔥🔥🔥 High
**Priority**: ⭐⭐ SMART SCHEDULING

**The Problem**:
> "I schedule deep work at 3pm but I'm always tired then. My peak is 10am."

**The Solution**:
- Learns your peak productivity hours from completion history
- Shows ⚡ indicator on peak hour slots
- Auto-suggests peak times when creating deep work
- Visual timeline overlay: Peak zones glow

**Data Source**:
```typescript
// Analyze completions by hour
SELECT
  EXTRACT(HOUR FROM completed_at) as hour,
  COUNT(*) as completions,
  AVG(CASE WHEN category = 'deep_work' THEN 3 ELSE 1 END) as weighted_score
FROM (
  SELECT * FROM deep_work_tasks WHERE completed = true
  UNION ALL
  SELECT * FROM light_work_tasks WHERE completed = true
)
WHERE completed_at > NOW() - INTERVAL '30 days'
GROUP BY hour
ORDER BY weighted_score DESC
LIMIT 2;
```

**Visual**:
- Peak hours have subtle gold glow
- Modal shows: "⚡ Suggested: 10:00 AM (your peak time)"

**Reuses**: Timeline rendering, Supabase queries

---

#### 6. **Timeline Heatmap** 🎨
**Complexity**: Medium (1-2 hours)
**Impact**: 🔥🔥 Medium-High
**Priority**: ⭐ NICE TO HAVE

**The Problem**:
> "Can't quickly see which hours are packed vs available"

**The Solution**:
- Translucent gradient behind each hour
- Color intensity = # of blocks in that hour
- Green = Free, Yellow = Busy, Red = Packed

**Implementation**:
```typescript
// Calculate blocks per hour
const hourDensity = Array(24).fill(0);
validTasks.forEach(task => {
  const startHour = Math.floor(parseTime(task.startTime) / 60);
  const endHour = Math.floor(parseTime(task.endTime) / 60);
  for (let h = startHour; h <= endHour; h++) {
    hourDensity[h]++;
  }
});

// Render behind timeline
{timeSlots.map(slot => (
  <div
    className={cn(
      "absolute inset-0 transition-all duration-500",
      hourDensity[slot.hour] === 0 && "bg-transparent",
      hourDensity[slot.hour] === 1 && "bg-green-500/10",
      hourDensity[slot.hour] === 2 && "bg-yellow-500/20",
      hourDensity[slot.hour] >= 3 && "bg-red-500/30"
    )}
    style={{ top: `${slot.hour * 80}px`, height: '80px' }}
  />
))}
```

**Reuses**: `timeSlots` grid rendering
**Effect**: Instant visual density feedback

---

### Phase 3C: Advanced Automation (4-6 hours)

#### 7. **Auto-Optimize Day** 🤖
**Complexity**: Medium-Hard (2-3 hours)
**Impact**: 🔥🔥🔥 Very High
**Priority**: 🏆 GAME CHANGER

**The Problem**:
> "I have 12 scattered blocks. I want deep work grouped with minimal context switches."

**The Solution**:
- One button: "Optimize My Day"
- AI groups similar work, packs deep work in morning
- Minimizes gaps and context switches
- Shows preview with undo option

**Algorithm**:
```typescript
const optimizeDay = (blocks) => {
  // 1. Separate fixed (meetings) vs flexible
  const fixed = blocks.filter(b => b.category === 'MEETING');
  const flexible = blocks.filter(b => b.category !== 'MEETING');

  // 2. Sort flexible blocks
  //    - Deep work first (morning preference)
  //    - Longer blocks before shorter
  const sorted = flexible.sort((a, b) => {
    if (a.category === 'DEEP_WORK' && b.category !== 'DEEP_WORK') return -1;
    if (a.category !== 'DEEP_WORK' && b.category === 'DEEP_WORK') return 1;
    return b.duration - a.duration;
  });

  // 3. Greedy pack into earliest free slots
  const optimized = [];
  let cursor = 9 * 60; // Start at 9am

  for (const block of sorted) {
    // Find next free slot
    const slot = findNextFreeSlot(cursor, block.duration, [...fixed, ...optimized]);
    if (!slot) continue; // Skip if can't fit

    optimized.push({
      ...block,
      startTime: formatTime(slot.start),
      endTime: formatTime(slot.end)
    });

    cursor = slot.end + 15; // 15min buffer between blocks
  }

  return [...fixed, ...optimized];
};
```

**Preview UI**:
- Side-by-side: Current → Optimized
- Shows metrics: Context switches, Deep work hours, Total gaps
- Confirm or Cancel

**Reuses**: `updateTimeBlock()`, conflict checking
**Undo**: Keep original blocks in state for rollback

---

#### 8. **Template Library** 📚
**Complexity**: Medium (1-2 hours)
**Impact**: 🔥🔥 Medium-High
**Priority**: ⭐ PRODUCTIVITY BOOST

**The Problem**:
> "My Tuesdays are always identical: standup, deep work, lunch, meetings. I recreate this weekly."

**The Solution**:
- Save today as template
- Library: "Tuesday Flow", "Deep Work Day", "Meeting Heavy"
- One tap → Apply to any day

**Template Structure**:
```typescript
interface DayTemplate {
  id: string;
  name: string;
  emoji: string;
  blocks: Array<{
    title: string;
    offset: string; // "09:00" or "+30" (relative)
    duration: number;
    category: TimeBlockCategory;
  }>;
}

const templates = [
  {
    name: 'Deep Work Tuesday',
    emoji: '🎯',
    blocks: [
      { title: 'Team Standup', offset: '09:00', duration: 15, category: 'MEETING' },
      { title: 'Deep Work Block 1', offset: '+15', duration: 120, category: 'DEEP_WORK' },
      { title: 'Lunch', offset: '+0', duration: 45, category: 'BREAK' },
      { title: 'Deep Work Block 2', offset: '+0', duration: 90, category: 'DEEP_WORK' }
    ]
  }
];
```

**UI**:
- Template browser modal
- Preview before applying
- Edit after applying

**Storage**: `day_templates` table in Supabase

---

#### 9. **Voice Quick-Add** 🎤
**Complexity**: Medium (1-2 hours)
**Impact**: 🔥🔥 Medium (Mobile Power Users)
**Priority**: ⭐ INNOVATION

**The Problem**:
> "Typing on mobile is slow. I want to say 'add write report for 1 hour at 2pm'"

**The Solution**:
- Mic button opens voice input
- Speak task details naturally
- AI parses and creates block instantly

**Voice Parsing**:
```typescript
const parseVoiceInput = (transcript) => {
  // Extract duration
  const durationPatterns = [
    /(\d+)\s*hour/i,
    /(\d+)\s*hr/i,
    /(\d+)\s*minute/i,
    /(\d+)\s*min/i
  ];

  let minutes = 60; // Default
  for (const pattern of durationPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      minutes = pattern.source.includes('hour')
        ? parseInt(match[1]) * 60
        : parseInt(match[1]);
      break;
    }
  }

  // Extract time
  const timePattern = /at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?/i;
  const timeMatch = transcript.match(timePattern);

  const startTime = timeMatch
    ? convertTo24Hour(timeMatch[1], timeMatch[2], timeMatch[3])
    : findNextFreeSlot();

  // Title is everything else
  const title = transcript
    .replace(/(\d+\s*(hour|hr|minute|min))/gi, '')
    .replace(/at\s+\d{1,2}:?\d{0,2}\s*(am|pm)?/gi, '')
    .trim();

  return { title, startTime, minutes };
};
```

**API**: Web Speech API (built into browser)
**Fallback**: Type manually if speech fails

**Example**:
- Say: "Add write client proposal for 2 hours at 10am"
- Creates: "Write client proposal" (10:00-12:00, DEEP_WORK)

---

### Phase 3D: Smart Automation (3-5 hours)

#### 10. **Gesture Shortcuts Matrix** 🖐️
**Complexity**: Easy-Medium (1-2 hours)
**Impact**: 🔥🔥 Medium (Power Users)
**Priority**: ⭐ UX POLISH

**Complete Gesture Map**:
```typescript
const gestures = {
  // Horizontal swipes
  swipeLeft: { action: 'complete', threshold: 50, haptic: [50], color: 'green' },
  swipeRight: { action: 'snooze', threshold: 50, haptic: [30, 10, 30], color: 'blue' },

  // Vertical swipes (new)
  swipeUp: { action: 'delete', threshold: 30, haptic: [100], color: 'red' },
  swipeDown: { action: 'duplicate', threshold: 30, haptic: [50, 50], color: 'purple' },

  // Press gestures
  longPress: { action: 'sprint-menu', duration: 600, haptic: [75] },
  doubleTap: { action: 'edit', maxDelay: 300 }
};
```

**Visual Feedback**:
- Swipe reveals action icon underneath block
- Color shift indicates action type
- Elastic snap-back if cancelled

---

#### 11. **Smart Default Times** 🧠
**Complexity**: Easy (30-45 min)
**Impact**: 🔥 Low-Medium
**Priority**: ✨ NICE TO HAVE

**The Problem**:
> "When creating a morning block at 8am, default end time is 9am. But my morning blocks are usually 45 minutes."

**The Solution**:
- Learns typical duration per category
- Auto-sets endTime based on category + time of day

**Learning**:
```typescript
// Compute average duration per category
const avgDurations = {
  DEEP_WORK: computeAvg(deepWorkTasks.map(t => t.duration)),
  LIGHT_WORK: computeAvg(lightWorkTasks.map(t => t.duration)),
  MEETING: 60, // Default 1hr
  BREAK: 15 // Default 15min
};

// Apply when creating block
const suggestedEndTime = addMinutes(
  startTime,
  avgDurations[category]
);
```

**Storage**: Cache in localStorage for instant access

---

#### 12. **Timeline Density Heatmap** 🎨
**Complexity**: Easy-Medium (1 hour)
**Impact**: 🔥🔥 Medium
**Priority**: ⭐ VISUAL CLARITY

**The Solution**:
- Subtle background gradient showing hour density
- Immediate visual feedback: Where's available?

**Implementation**:
```typescript
// Calculate blocks per hour
const hourDensity = Array(24).fill(0);
validTasks.forEach(task => {
  const startHour = Math.floor(parseTime(task.startTime) / 60);
  const endHour = Math.floor(parseTime(task.endTime) / 60);
  for (let h = startHour; h <= endHour; h++) {
    hourDensity[h] = Math.min(3, hourDensity[h] + 1);
  }
});

// Render as background layer
<div className="absolute inset-0 pointer-events-none">
  {timeSlots.map(slot => (
    <div
      key={slot.hour}
      className={cn(
        "absolute w-full transition-all duration-700",
        hourDensity[slot.hour] === 0 && "bg-transparent",
        hourDensity[slot.hour] === 1 && "bg-green-500/8",
        hourDensity[slot.hour] === 2 && "bg-yellow-500/15",
        hourDensity[slot.hour] >= 3 && "bg-red-500/25"
      )}
      style={{ top: `${slot.hour * 80}px`, height: '80px' }}
    />
  ))}
</div>
```

**Effect**: Green = free, Yellow = moderate, Red = packed

---

#### 13. **Quick Templates** 📋
**Complexity**: Easy (45 min)
**Impact**: 🔥🔥 Medium
**Priority**: ⭐ SPEED BOOST

**Built-in Templates**:
```typescript
const quickTemplates = [
  {
    name: 'Morning Power Hour',
    blocks: [
      { title: 'Email Zero', duration: 30, category: 'LIGHT_WORK' },
      { title: 'Planning', duration: 15, category: 'ADMIN' },
      { title: 'Deep Work', duration: 120, category: 'DEEP_WORK' }
    ]
  },
  {
    name: 'Maker Day',
    blocks: [
      { title: 'Deep Work 1', duration: 180, category: 'DEEP_WORK' },
      { title: 'Lunch Break', duration: 45, category: 'BREAK' },
      { title: 'Deep Work 2', duration: 120, category: 'DEEP_WORK' }
    ]
  },
  {
    name: 'Meeting Day',
    blocks: [
      { title: 'Prep Time', duration: 30, category: 'LIGHT_WORK' },
      { title: 'Meetings Block', duration: 180, category: 'MEETING' },
      { title: 'Follow-ups', duration: 60, category: 'LIGHT_WORK' }
    ]
  }
];
```

**UI**: Dropdown on "Add Tasks" button
**Effect**: Apply entire day structure in 1 tap

---

### Phase 3E: Context Intelligence (2-3 hours)

#### 14. **Buffer Time Auto-Insert** ⏱️
**Complexity**: Easy (30 min)
**Impact**: 🔥 Medium
**Priority**: ✨ POLISH

**The Problem**:
> "Back-to-back blocks leave no transition time. I'm always 5 minutes late."

**The Solution**:
- Auto-adds 5-15min buffer between blocks
- Option: "Add 10min buffer" checkbox when creating
- Or: Smart mode adds buffer only between different categories

**Implementation**:
```typescript
// When creating via Add After
const startTime = addMinutes(previousBlock.endTime, bufferMinutes);

// Or when optimizing day
const addBuffers = (blocks) => {
  return blocks.map((block, i) => {
    if (i === 0) return block;
    const prev = blocks[i - 1];
    const needsBuffer = prev.category !== block.category;
    if (needsBuffer) {
      const bufferedStart = addMinutes(prev.endTime, 10);
      return { ...block, startTime: bufferedStart };
    }
    return block;
  });
};
```

---

#### 15. **Today vs Yesterday Comparison** 📊
**Complexity**: Easy (30-45 min)
**Impact**: 🔥 Medium
**Priority**: ✨ INSIGHTS

**The Solution**:
- Small stats card showing:
  - Yesterday: 4h deep work, 2h light work
  - Today: 5h deep work, 1h light work
  - Trend: ↑ 25% more deep work

**Implementation**:
```typescript
const compareDays = (today, yesterday) => {
  const todayStats = calculateStats(today);
  const yesterdayStats = calculateStats(yesterday);

  return {
    deepWork: {
      today: todayStats.deepWork,
      yesterday: yesterdayStats.deepWork,
      trend: ((todayStats.deepWork - yesterdayStats.deepWork) / yesterdayStats.deepWork * 100).toFixed(0)
    },
    // Same for other categories
  };
};
```

**UI**: Collapsible card above timeline
**Reuses**: Stats calculation from existing code

---

## 🎯 Recommended Implementation Order

### Week 1: Mobile Essentials
1. **Focus Sprint** (30 min) - Highest ROI
2. **Micro-Celebrations** (30 min) - Engagement
3. **Swipe Actions** (2 hrs) - Mobile UX

**Total**: ~3 hours, massive mobile UX upgrade

### Week 2: Intelligence
4. **Smart Gap Filler** (1-2 hrs) - Reduces friction
5. **Energy Windows** (1-2 hrs) - Smart defaults
6. **Timeline Heatmap** (1 hr) - Visual guidance

**Total**: ~4 hours, makes planning smarter

### Week 3: Power Features
7. **Auto-Optimize** (2-3 hrs) - Game changer
8. **Template Library** (1-2 hrs) - Recurring patterns
9. **Voice Quick-Add** (1-2 hrs) - Mobile innovation

**Total**: ~5 hours, professional-grade features

---

## 🧪 Feature Testing Matrix

| Feature | Desktop | Mobile | Offline | Visual Feedback |
|---------|---------|--------|---------|-----------------|
| Focus Sprint | ✅ | ✅ | ✅ | Toast |
| Swipe Actions | ❌ | ✅ | ✅ | Haptic + Color |
| Smart Gap | ✅ | ✅ | ⚠️ Cached | Modal |
| Energy Windows | ✅ | ✅ | ⚠️ Cached | Glow |
| Heatmap | ✅ | ✅ | ✅ | Gradient |
| Auto-Optimize | ✅ | ✅ | ✅ | Preview Modal |
| Templates | ✅ | ✅ | ✅ | Quick Apply |
| Voice Add | ❌ | ✅ | ❌ | Speech UI |

---

## 💎 Innovation Highlights

### What Makes These "Magical"

1. **Focus Sprint** - Turns 16 taps into 1 (95% faster)
2. **Smart Gap** - AI finds perfect-fit tasks (eliminates searching)
3. **Energy Windows** - Schedule when you're actually productive
4. **Swipe Actions** - Mobile-native speed (3 taps → 1 swipe)
5. **Auto-Optimize** - Perfect schedule in 1 second
6. **Voice Add** - Fastest input method (30% faster than typing)

### Avoided Bloat (Deleted)
- ❌ Multi-timezone (single user app)
- ❌ Recurring rules (templates are simpler)
- ❌ Resource booking (not collaborative)
- ❌ Heavy ML (simple heuristics work better)

---

## 🔬 Technical Implementation Notes

### Energy Window Computation
```sql
-- Find peak productivity hours
SELECT
  EXTRACT(HOUR FROM completed_at) as hour,
  COUNT(*) as completions,
  AVG(CASE
    WHEN category = 'DEEP_WORK' THEN 3
    ELSE 1
  END) as weighted_score
FROM task_completions
WHERE user_id = $1
  AND completed_at > NOW() - INTERVAL '30 days'
GROUP BY hour
ORDER BY weighted_score DESC
LIMIT 2;
```

### Smart Gap Algorithm
```typescript
const scoreTaskForGap = (task, gapMinutes) => {
  let score = 0;

  // Duration fit (prefer exact fits)
  const durationDiff = Math.abs(task.estimatedDuration - gapMinutes);
  score += (60 - durationDiff) / 60 * 40; // 0-40 points

  // Priority
  const priorityPoints = { HIGH: 30, MEDIUM: 15, LOW: 5 };
  score += priorityPoints[task.priority] || 10;

  // Urgency (has deadline?)
  if (task.deadline) {
    const daysUntil = getDaysUntil(task.deadline);
    score += Math.max(0, 20 - daysUntil * 2);
  }

  return score;
};
```

### Voice NLP (Simple Pattern Matching)
```typescript
const patterns = {
  // Time patterns
  time: /at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?/i,
  relativeTime: /in\s+(\d+)\s*(hour|minute)/i,

  // Duration patterns
  duration: /for\s+(\d+)\s*(hour|hr|minute|min)/i,

  // Category hints
  category: {
    deep: /deep|focus|concentrate|code|write/i,
    meeting: /meeting|call|sync|standup/i,
    break: /break|rest|lunch/i
  }
};
```

---

## 🎮 Gamification Integration

### Achievement Unlocks
```typescript
const achievements = {
  // Sprint achievements
  'pomodoro-master': {
    trigger: 'Complete 10 focus sprints',
    reward: '🏆 Pomodoro Master badge',
    xp: 500
  },

  // Optimization achievements
  'efficiency-expert': {
    trigger: 'Use auto-optimize 5 times',
    reward: '⚡ Efficiency Expert badge',
    xp: 250
  },

  // Consistency achievements
  'perfect-week': {
    trigger: 'Complete all blocks for 7 days',
    reward: '💎 Perfect Week trophy',
    xp: 1000
  }
};
```

### XP Calculation
```typescript
const calculateXP = (block) => {
  let xp = block.duration; // Base: 1 XP per minute

  if (block.category === 'DEEP_WORK') xp *= 1.5;
  if (block.duration >= 120) xp *= 1.2; // Bonus for long focus
  if (completedOnTime(block)) xp *= 1.1; // Punctuality bonus

  return Math.round(xp);
};
```

---

## 📱 Mobile-First Optimizations

### Touch Target Sizes
- All buttons: min 44x44px
- Swipe threshold: 50px
- Long press: 600ms
- Double tap: 300ms max delay

### Haptic Feedback Map
```typescript
const haptics = {
  complete: [50],                    // Single pulse
  snooze: [30, 10, 30],             // Double pulse
  delete: [100],                     // Strong pulse
  create: [50, 25, 50],             // Success pattern
  error: [100, 50, 100, 50, 100]    // Alert pattern
};
```

### Performance Targets
- Render time: <16ms (60fps)
- Touch response: <100ms
- Animation smoothness: 60fps
- Offline-first: All features work without network

---

## 🚀 Expected Impact

### Time Savings
- **Per day**: ~30 minutes in planning overhead
- **Per week**: ~3.5 hours saved
- **Per month**: ~15 hours = 2 full workdays!

### Productivity Gains
- **Better scheduling**: Peak hour matching = 15-20% more completion rate
- **Less context switching**: Optimized day = 30% fewer interruptions
- **Faster planning**: Templates + sprints = 10x faster setup

### User Satisfaction
- **Mobile experience**: Native-app feel
- **Intelligence**: Feels personalized
- **Speed**: Instant everything

---

## 🔗 Related Files

**Core Files**:
- `TimeboxSection.tsx` - Main timeline component
- `TimeBlockFormModal.tsx` - Edit/create modal
- `timeblocksApi.offline.ts` - Data layer
- `unified-data.service.ts` - Supabase sync

**New Files Needed**:
- `timeboxAI.service.ts` - Smart features (gap fill, energy, optimize)
- `templates.ts` - Template library
- `gestures.ts` - Gesture handler utilities
- `celebrations.ts` - Achievement system

---

*Last Updated: 2025-10-13*
*Author: Claude + Human Collaboration*
*Version: 2.1 - Next-Gen Features Roadmap*
