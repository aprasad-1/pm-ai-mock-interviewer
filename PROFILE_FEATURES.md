# Profile Page and Minutes Wallet Features

## Overview
This document describes the new profile page and minutes wallet system implemented for the PrepWise application.

## Features Implemented

### 1. User Profile Management
- **Profile Page**: Complete user profile management at `/profile`
- **Editable Fields**: Users can update their display name
- **Read-only Fields**: Email (cannot be changed)
- **Profile Picture**: Support for user profile photos (existing functionality)

### 2. Minutes Wallet System
- **Wallet Display**: Shows remaining interview minutes
- **Free Minutes**: New users get 30 free minutes on signup
- **Minutes Consumption**: 30 minutes consumed per interview session
- **Balance Check**: Prevents interviews when insufficient minutes
- **Real-time Updates**: Wallet balance updates immediately after usage

### 3. Subscription Management
- **Plan Status**: Shows current subscription (Free/Pro)
- **Upgrade Button**: Placeholder for future Stripe integration
- **Plan Benefits**: Clear messaging about plan features

### 4. Enhanced Navigation
- **Profile Link**: Added to UserMenu component
- **Navigation Bar**: Added links to Interviews and Feedback pages
- **Consistent Styling**: Follows existing design patterns

## Technical Implementation

### Database Schema Updates
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  subscriptionStatus: 'free' | 'active' | 'canceled';
  walletMinutes: number;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}
```

### New Server Actions
- `getUserProfile()`: Fetch user profile data
- `updateUserProfile()`: Update user profile information
- `consumeWalletMinutes()`: Deduct minutes from wallet
- `addWalletMinutes()`: Add minutes to wallet
- `adminAddWalletMinutes()`: Admin function for testing

### Security Features
- **Session Validation**: All actions verify user authentication
- **User Isolation**: Users can only access their own data
- **Input Validation**: Form data validation and sanitization
- **Error Handling**: Comprehensive error handling and user feedback

### Integration Points
- **Interview Flow**: Wallet check before starting interviews
- **Minutes Consumption**: Automatic deduction when interviews start
- **Real-time Updates**: Immediate UI updates after changes
- **Toast Notifications**: User feedback for all actions

## Usage Instructions

### For Users
1. **Access Profile**: Click the Profile button in the top navigation
2. **Update Information**: Change display name in the Profile section
3. **Check Wallet**: View remaining minutes in the Wallet section
4. **Manage Subscription**: View plan status and upgrade options

### For Developers
1. **Run Migration**: Use the "Migrate Existing Users" button for existing users
2. **Test Wallet**: Use "Add 30 Test Minutes" button for testing
3. **Monitor Usage**: Check console logs for wallet operations

## Error Handling

### Common Scenarios
- **Insufficient Minutes**: Clear error message with wallet balance
- **Authentication Failures**: Redirect to sign-in page
- **Network Errors**: User-friendly error messages with retry options
- **Validation Errors**: Form-level error display

### Fallback Behavior
- **Profile Unavailable**: Graceful degradation to basic user info
- **Wallet Check Failed**: Interview proceeds with warning
- **Update Failures**: Clear error messages with actionable steps

## Future Enhancements

### Planned Features
- **Stripe Integration**: Real payment processing for Pro plans
- **Minutes Packages**: Purchase additional minutes
- **Usage Analytics**: Detailed interview history and analytics
- **Referral System**: Earn minutes by referring friends

### Technical Improvements
- **Real-time Updates**: WebSocket integration for live wallet updates
- **Caching**: Redis caching for improved performance
- **Rate Limiting**: API rate limiting for security
- **Audit Logs**: Comprehensive logging for compliance

## Testing

### Test Scenarios
1. **New User Signup**: Verify 30 free minutes are granted
2. **Profile Updates**: Test name changes and validation
3. **Wallet Operations**: Test minutes consumption and addition
4. **Interview Flow**: Verify wallet checks prevent insufficient balance
5. **Error Handling**: Test various error scenarios

### Test Data
- Use the "Add 30 Test Minutes" button for wallet testing
- Use the "Migrate Existing Users" button for schema updates
- Monitor console logs for operation tracking

## Deployment Notes

### Pre-deployment Checklist
- [ ] Run migration for existing users
- [ ] Test wallet functionality with test accounts
- [ ] Verify error handling in production environment
- [ ] Check authentication flow integrity

### Post-deployment Monitoring
- [ ] Monitor wallet operations in logs
- [ ] Track user profile update success rates
- [ ] Monitor interview completion rates
- [ ] Check for authentication errors

## Security Considerations

### Data Protection
- **User Isolation**: Strict user data separation
- **Input Sanitization**: All user inputs are validated
- **Session Security**: Secure session cookie handling
- **Rate Limiting**: Prevents abuse of wallet operations

### Access Control
- **Authentication Required**: All profile actions require valid session
- **User Verification**: Actions verify user identity before execution
- **Admin Functions**: Separate admin functions for testing (remove in production)

## Troubleshooting

### Common Issues
1. **Wallet Not Updating**: Check user authentication and session validity
2. **Profile Update Fails**: Verify form data and network connectivity
3. **Migration Errors**: Check Firebase permissions and connection
4. **Interview Blocked**: Verify wallet balance and minutes consumption

### Debug Steps
1. Check browser console for error messages
2. Verify user authentication status
3. Check Firebase console for operation logs
4. Test with fresh user account

## Support

For technical support or questions about these features, please refer to the development team or create an issue in the project repository.
