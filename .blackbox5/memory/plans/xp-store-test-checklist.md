# XP Store Phase 3 Test Checklist

## Pre-Flight Setup

- [ ] Backup database before running migration
- [ ] Copy SQL from `/Users/shaansisodia/DEV/SISO-ECOSYSTEM/SISO-INTERNAL/.blackbox/migrations/create_xp_store_rewards.sql`
- [ ] Run migration in Supabase SQL Editor
- [ ] Verify table created: `SELECT * FROM xp_store_rewards;` (should return 8 rows)

## Database Verification

- [ ] Table structure matches schema
- [ ] 8 rewards seeded correctly
- [ ] RLS policies enabled
- [ ] Indexes created
- [ ] Trigger for `updated_at` works

## Admin Panel Tests

### Access Control
- [ ] Admin users see "Manage Store" button
- [ ] Non-admin users don't see "Manage Store" button
- [ ] Button opens StoreManagementPanel dialog

### List View
- [ ] All 8 rewards display
- [ ] Category badges show correct colors
- [ ] Active/inactive status visible
- [ ] Prices display correctly
- [ ] Icons display correctly

### Add Reward
- [ ] "Add Reward" button opens form
- [ ] All form fields present:
  - [ ] Category selector
  - [ ] Name input
  - [ ] Description textarea
  - [ ] Icon emoji picker
  - [ ] Base price input
  - [ ] Current price input
  - [ ] Unlock at input (optional)
  - [ ] Max daily use input (optional)
  - [ ] Availability window input (optional)
  - [ ] Active toggle
- [ ] Form validation works (name required)
- [ ] Submit creates new reward
- [ ] Success toast appears
- [ ] New reward appears in list
- [ ] Dialog closes after submit

### Edit Reward
- [ ] Edit button opens form with existing data
- [ ] All fields populate correctly
- [ ] Can modify all fields
- [ ] Submit updates reward
- [ ] Success toast appears
- [ ] Changes visible in list
- [ ] Dialog closes after submit

### Toggle Active
- [ ] Eye icon toggles active/inactive
- [ ] Visual feedback shows status change
- [ ] Success toast appears
- [ ] Inactive rewards show grayed out

### Delete Reward
- [ ] Delete button shows confirmation dialog
- [ ] Dialog shows reward name
- [ ] Cancel button closes dialog
- [ ] Confirm button deletes reward
- [ ] Success toast appears
- [ ] Reward removed from list

### Error Handling
- [ ] Network errors show toast
- [ ] Validation errors show inline
- [ ] Loading states display during operations

## Store View Tests

### Balance Header
- [ ] XP balance displays correctly
- [ ] Matches user_gamification_progress.total_xp
- [ ] Icon displays correctly
- [ ] Description text shows

### Reward Catalog
- [ ] Rewards load from database
- [ ] All active rewards display
- [ ] Inactive rewards hidden
- [ ] Search functionality works
- [ ] Category filter works
- [ ] Price filter works (affordable, saving, all)
- [ ] Sort functionality works (price, popularity, satisfaction)
- [ ] Affordability badges display correctly:
  - [ ] Available (green)
  - [ ] Almost (orange)
  - [ ] Saving (gray)
  - [ ] Locked (gray with unlock info)

### Reward Cards
- [ ] Icon displays
- [ ] Name displays
- [ ] Category badge shows
- [ ] Description shows
- [ ] Price displays correctly
- [ ] Base price shows if different
- [ ] Unlock progress bar shows (if applicable)
- [ ] Purchase button state correct based on affordability
- [ ] Purchase statistics show (if any)

### Psychology Features
- [ ] Near-miss notifications work
- [ ] Spending power calculations correct
- [ ] Price change indicators show
- [ ] Trend indicators show (up/down)
- [ ] Milestone unlock progress accurate

## Fallback Tests

### Database Connection Failure
- [ ] Simulate connection failure
- [ ] Verify fallback to hardcoded rewards
- [ ] No errors shown to user
- [ ] Store remains functional

### Empty Database
- [ ] Delete all rewards from database
- [ ] Verify fallback to hardcoded rewards
- [ ] Warning logged to console

## Integration Tests

### Real-time Updates
- [ ] Add reward in admin panel
- [ ] Refresh store view
- [ ] Verify new reward appears
- [ ] Edit reward in admin panel
- [ ] Refresh store view
- [ ] Verify changes visible
- [ ] Deactivate reward in admin panel
- [ ] Refresh store view
- [ ] Verify reward hidden

### Admin State
- [ ] Login as admin
- [ ] Verify management button appears
- [ ] Logout
- [ ] Verify management button disappears

## Performance Tests

- [ ] Store loads within 2 seconds
- [ ] Admin panel loads within 2 seconds
- [ ] Search responds within 500ms
- [ ] Filter updates within 500ms
- [ ] Sort updates within 500ms

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile responsive

## Regression Tests

### Existing Functionality
- [ ] Dashboard tab works
- [ ] History tab works
- [ ] Achievements tab works
- [ ] XP calculations correct
- [ ] Level progress accurate
- [ ] Streak tracking works
- [ ] Analytics display correctly

### Psychology Features
- [ ] No regressions in psychology calculations
- [ ] All badges display correctly
- [ ] Progress bars accurate
- [ ] Notifications work as expected

## Known Issues to Monitor

1. **Purchase Flow**: Shows "coming soon" message (expected behavior)
2. **Refresh**: Uses `window.location.reload()` - monitor for jarring UX
3. **Concurrent Edits**: No conflict resolution if two admins edit same reward

## Post-Deployment

- [ ] Monitor Supabase logs for errors
- [ ] Check browser console for client-side errors
- [ ] Verify RLS policies working correctly
- [ ] Monitor query performance
- [ ] Gather user feedback

## Rollback Plan

If critical issues found:
1. Delete all rewards from `xp_store_rewards` table
2. Drop `xp_store_rewards` table
3. Revert `xpStoreService.ts` changes
4. Remove admin panel integration from dashboard

## Sign-off

- [ ] Developer testing complete
- [ ] QA testing complete
- [ ] Product owner approval
- [ ] Ready for deployment
