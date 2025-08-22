# Wallet System Testing Guide

## System Overview
The wallet system tracks interview minutes in real-time, consuming time as interviews progress.

## Key Components

### 1. **useInterviewTimer Hook** (`hooks/useInterviewTimer.ts`)
- Manages timer state with refs to persist across renders
- Syncs with database every 30 seconds
- Handles pause/resume functionality
- Prevents duplicate updates with `isUpdatingRef`

### 2. **InterviewTimer Component** (`components/InterviewTimer.tsx`)
- Visual timer display with wallet balance
- Shows elapsed time and remaining minutes
- Progress bar with warning states
- Auto-stops when minutes expire

### 3. **InterviewContainer** (`components/InterviewContainer.tsx`)
- Coordinates timer and interview agent
- Handles timer end events
- Manages interview state changes
- Shows wallet check when insufficient minutes

### 4. **Wallet Actions** (`lib/actions/user.action.ts`)
- `consumeWalletTime`: Deducts actual seconds used
- `addWalletMinutes`: Adds minutes to wallet
- `getWalletBalance`: Gets current balance
- Transaction-based updates for consistency

## Testing Steps

### 1. Test Wallet Balance
1. Go to `/test-wallet`
2. Check current balance displays correctly
3. Click "Add 30 Minutes" - balance should increase
4. Click "Consume 5 Minutes" - balance should decrease
5. Verify all changes persist after page refresh

### 2. Test Interview Timer
1. Go to `/profile` and ensure you have minutes
2. Start an interview at `/interview`
3. Verify timer shows:
   - Current wallet balance
   - Elapsed time counting up
   - Progress bar filling
4. Let interview run for 1+ minute
5. End interview and verify minutes were consumed

### 3. Test Timer Persistence
1. Start an interview
2. Let it run for 30 seconds
3. Navigate away and back
4. Timer should NOT reset
5. Check console for sync messages every 30 seconds

### 4. Test Insufficient Minutes
1. Set wallet to 0 minutes (use test page)
2. Try to start interview
3. Should see wallet check component
4. Cannot proceed without minutes

### 5. Test Timer Expiry
1. Set wallet to 1 minute
2. Start interview
3. Let timer run out
4. Should see warning at low balance
5. Interview should auto-end when time expires

## Debug Console Messages

Look for these in browser console:

```
⏱️ Starting interview timer...
🔄 Syncing X seconds to wallet...
✅ Wallet synced. Remaining: X minutes
📍 Interview state changed: true/false
⏰ Timer ended - no more minutes!
```

## Common Issues & Solutions

### Issue: Timer Resets on Re-render
**Solution**: Using refs (`totalElapsedRef`, `startTimeRef`) to persist state

### Issue: Duplicate Wallet Updates
**Solution**: `isUpdatingRef` flag prevents concurrent updates

### Issue: Minutes Not Updating
**Solution**: Check Firebase permissions and transaction logs

### Issue: Timer Not Starting
**Solution**: Verify `isInterviewActive` prop is updating correctly

## Production Checklist

- [ ] Remove test buttons from profile page
- [ ] Remove `/test-wallet` route
- [ ] Set proper sync interval (30s is good)
- [ ] Add error recovery for failed syncs
- [ ] Test with real VAPI calls
- [ ] Monitor Firebase usage costs
- [ ] Add analytics tracking

## Key Improvements Made

1. **Persistent Timer State**: Uses refs to maintain state across renders
2. **Atomic Updates**: Firebase transactions ensure consistency
3. **Real-time Tracking**: Actual seconds used, not estimated
4. **Error Recovery**: Graceful handling of sync failures
5. **Visual Feedback**: Clear progress indicators and warnings
6. **Auto-stop**: Interview ends when minutes expire
7. **Debug Logging**: Comprehensive console messages for troubleshooting

## API Flow

1. User starts interview → `setIsInterviewActive(true)`
2. Timer starts → Updates every second
3. Every 30s → Sync with Firebase
4. User ends interview → `setIsInterviewActive(false)`
5. Final sync → Consume remaining seconds
6. Redirect → Show feedback page

## Security Considerations

- Server-side validation of wallet balance
- Transaction-based updates prevent race conditions
- User isolation - can only update own wallet
- Rate limiting on wallet operations (TODO)
- Audit logging for all wallet changes (TODO)
