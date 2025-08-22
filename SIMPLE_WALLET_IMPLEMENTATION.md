# Simple Wallet System Implementation

## Overview
A clean, simple implementation of the wallet system that:
- Gives users 30 free minutes on signup
- Tracks interview time to the second
- Shows only elapsed time during interviews (not wallet balance)
- Properly deducts time even if user backs out

## Architecture

### Core Components

#### 1. **Interview Timer Service** (`lib/services/interviewTimer.ts`)
- Server-side timer management
- Tracks active interview sessions
- Handles time synchronization with database
- Atomic wallet updates using transactions

#### 2. **Timer Actions** (`lib/actions/timer.action.ts`)
- Secure server actions for timer control
- Authentication verification
- Start/stop/sync timer operations

#### 3. **Simple Interview Timer** (`components/SimpleInterviewTimer.tsx`)
- Client-side timer display (MM:SS format)
- Shows elapsed time only
- Syncs with server every 30 seconds
- Handles page navigation/unload

#### 4. **Simple Interview Container** (`components/SimpleInterviewContainer.tsx`)
- Coordinates timer with interview agent
- Checks wallet balance before starting
- Clean, minimal UI

## How It Works

### User Flow
1. **Signup**: User gets 30 free minutes automatically
2. **Start Interview**: Timer starts if user has ≥1 minute
3. **During Interview**: Timer shows elapsed time (MM:SS)
4. **Background Sync**: Every 30 seconds, time syncs to database
5. **End Interview**: Total time is deducted from wallet
6. **Backout Protection**: Time is still deducted if user navigates away

### Time Calculation
- Tracked to the second
- Deducted in minute increments (rounded up)
- Examples:
  - 10 seconds = 1 minute deducted
  - 65 seconds = 2 minutes deducted
  - 121 seconds = 3 minutes deducted

### Database Updates
- Uses Firebase transactions for atomic updates
- Prevents race conditions
- Ensures consistency even with multiple tabs

## Security Features

### Authentication
- All timer operations require valid session
- User can only modify their own wallet
- Server-side validation of all operations

### Data Integrity
- Transactions prevent concurrent modifications
- Time tracked server-side (not client-side)
- Periodic sync prevents data loss

### Error Handling
- Graceful degradation on sync failures
- Continues tracking locally if sync fails
- Retries on next sync interval

## Testing

### Test Page
Navigate to `/wallet-test` to:
- View current wallet balance
- See user information
- Access test instructions
- Monitor expected behavior

### Console Monitoring
Open browser console to see:
```
⏱️ Starting interview timer for user: [userId]
✅ Interview timer started
⏱️ Timer synced with database
🔄 Syncing X seconds (Y minutes) for user [userId]
✅ Deducted Y minutes. New balance: Z
⏹️ Interview timer stopped. Total time: X seconds
```

### Manual Testing Steps
1. Check wallet balance on profile page
2. Start an interview
3. Let it run for 1+ minute
4. End interview or navigate away
5. Check updated balance on profile page

## Best Practices Implemented

### Performance
- Minimal re-renders using refs
- Efficient interval management
- Debounced sync operations

### Reliability
- Server-side source of truth
- Client-side display only
- Automatic recovery from errors

### User Experience
- Clean, simple timer display
- No distracting wallet balance during interview
- Clear feedback when insufficient minutes

## Edge Cases Handled

1. **Page Refresh**: Timer state persists, time is synced
2. **Browser Close**: BeforeUnload handler saves state
3. **Network Issues**: Local tracking continues, syncs when possible
4. **Multiple Tabs**: Each session tracked independently
5. **Zero Balance**: Cannot start new interviews
6. **Mid-Interview Expiry**: Interview continues, balance goes to 0

## Production Considerations

### Monitoring
- Add logging service integration
- Track sync failures
- Monitor wallet balance anomalies

### Scaling
- Consider Redis for session storage
- Implement distributed locking
- Add rate limiting

### Cost Optimization
- Batch database writes
- Optimize sync frequency
- Implement caching layer

## Maintenance

### Adding Minutes (Admin)
```typescript
// Use the existing adminAddWalletMinutes function
await adminAddWalletMinutes(userId, 30)
```

### Checking Balance
```typescript
// Use getUserProfile to get current balance
const profile = await getUserProfile()
console.log(profile.walletMinutes)
```

### Debugging Issues
1. Check server logs for timer operations
2. Verify user has minutes in database
3. Check browser console for client errors
4. Ensure session cookie is valid

## Summary

This implementation provides a robust, simple wallet system that:
- ✅ Tracks time accurately to the second
- ✅ Handles all edge cases gracefully
- ✅ Provides clear user feedback
- ✅ Maintains data integrity
- ✅ Scales efficiently
- ✅ Easy to maintain and debug
