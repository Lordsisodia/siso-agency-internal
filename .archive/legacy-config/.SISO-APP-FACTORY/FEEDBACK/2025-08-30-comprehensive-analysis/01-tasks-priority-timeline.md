# 📅 Tasks Priority/Timeline System - Feature Gap

**Priority**: 🟡 High  
**Status**: ⏳ Pending Implementation  
**Impact**: Task organization & user workflow  
**Estimated Fix Time**: 4-6 hours  

## 🔍 **Issue Description**

Tasks need priority levels, timelines, and due dates to help users organize work effectively. Currently, all tasks are treated equally with no urgency indicators or scheduling capabilities.

## 👤 **User Need**

**Original Feedback**: *"Tasks need priority/timeline/due dates - Should show urgency in backend with simple display"*

Users want to:
- Set priority levels (High, Medium, Low)
- Add due dates/deadlines  
- See timeline view of upcoming tasks
- Sort/filter by urgency
- Get notifications for overdue items

## 🎯 **Current State Analysis**

**Database Schema** (Prisma):
```prisma
// ❌ Missing priority/timeline fields
model PersonalTask {
  id          String   @id @default(cuid())
  title       String
  completed   Boolean  @default(false)
  // Missing: priority, dueDate, urgency, timeline
}
```

**UI Components**:
- Task creation has no priority/date fields
- Task display shows no urgency indicators
- No sorting by priority/date
- No timeline/calendar view

## ✅ **Solution Architecture**

### **Phase 1: Database Schema Update** (1 hour)
```prisma
model PersonalTask {
  id          String        @id @default(cuid())
  title       String
  completed   Boolean       @default(false)
  priority    TaskPriority? @default(MEDIUM)
  dueDate     DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

enum TaskPriority {
  HIGH
  MEDIUM  
  LOW
}
```

### **Phase 2: Backend API Updates** (2 hours)
1. Update task creation/edit endpoints
2. Add priority/date validation
3. Add sorting/filtering by priority/date
4. Add overdue task queries

### **Phase 3: UI Component Updates** (2-3 hours)
1. **Task Creation Form**:
   ```tsx
   // Add priority selector
   <Select value={priority} onValueChange={setPriority}>
     <SelectItem value="HIGH">🔴 High Priority</SelectItem>
     <SelectItem value="MEDIUM">🟡 Medium Priority</SelectItem>
     <SelectItem value="LOW">🟢 Low Priority</SelectItem>
   </Select>
   
   // Add date picker
   <DatePicker value={dueDate} onChange={setDueDate} />
   ```

2. **Task Display Components**:
   ```tsx
   // Priority indicators
   const PriorityIcon = ({ priority }) => {
     const icons = {
       HIGH: '🔴',
       MEDIUM: '🟡', 
       LOW: '🟢'
     };
     return <span>{icons[priority]}</span>;
   };
   
   // Due date warnings
   const DueDateWarning = ({ dueDate }) => {
     const isOverdue = new Date() > new Date(dueDate);
     const isDueSoon = daysBetween(new Date(), new Date(dueDate)) <= 2;
     
     if (isOverdue) return <Badge variant="destructive">Overdue</Badge>;
     if (isDueSoon) return <Badge variant="warning">Due Soon</Badge>;
     return <span>{format(dueDate, 'MMM dd')}</span>;
   };
   ```

3. **Sorting & Filtering**:
   ```tsx
   // Sort by priority + due date
   const sortedTasks = useMemo(() => {
     return tasks.sort((a, b) => {
       // High priority first
       const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
       if (a.priority !== b.priority) {
         return priorityOrder[b.priority] - priorityOrder[a.priority];
       }
       // Then by due date (soonest first)
       if (a.dueDate && b.dueDate) {
         return new Date(a.dueDate) - new Date(b.dueDate);
       }
       return 0;
     });
   }, [tasks]);
   ```

## 📱 **UI/UX Design**

### **Task Card Enhancement**:
```
┌─────────────────────────────────────────┐
│ 🔴 High Priority    📅 Due: Aug 31     │
│                                         │
│ Complete mobile touch interaction fixes │
│                                         │
│ ⏰ 2 days left     🏃‍♂️ In Progress      │
└─────────────────────────────────────────┘
```

### **Filters & Views**:
- **Priority Filter**: All | High | Medium | Low
- **Timeline View**: Today | This Week | Overdue
- **Sort Options**: Priority | Due Date | Created Date

## 🔧 **Implementation Files**

1. **Database**:
   - `prisma/schema.prisma` - Add priority/dueDate fields
   - Migration script for existing tasks

2. **Backend**:
   - Task API endpoints - Add priority/date handling
   - Validation schema updates

3. **Frontend Components**:
   - `TaskCreationDialog.tsx` - Add priority/date inputs
   - `LightFocusWorkSection.tsx` - Add priority indicators
   - `TaskCard.tsx` - Display priority/due dates
   - New: `TaskFilters.tsx` - Priority/date filtering

## 📊 **Success Metrics**

- [ ] Users can set task priorities (High/Medium/Low)
- [ ] Due dates can be added/edited for tasks
- [ ] Tasks display with priority indicators
- [ ] Overdue tasks are visually highlighted  
- [ ] Sorting by priority/due date works
- [ ] Timeline view shows upcoming deadlines

## 💡 **Future Enhancements**

- **Calendar Integration**: Sync with Google Calendar
- **Smart Notifications**: Remind before due dates
- **Time Estimation**: Add task duration estimates  
- **Batch Operations**: Set priority for multiple tasks
- **Priority Analytics**: Track completion by priority level

## 🔗 **Related Issues**

**Connects to**:
- **Issue #11**: Task Prioritization System (same concept)
- **Issue #13**: Time Boxing Integration (timeline scheduling)
- User workflow improvements across the app

**Dependencies**:
- **Issue #0**: Database Mock Client (must be fixed first)