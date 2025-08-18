# Deployment Guide

This guide covers deploying the PM Interviewer application to production.

## Prerequisites

- Node.js 18+ installed
- Firebase project configured
- VAPI AI account and API keys
- Vercel account (recommended) or other hosting platform

## Environment Variables

Create a `.env.production` file with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_content\n-----END PRIVATE KEY-----\n"

# VAPI AI Configuration
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_default_assistant_id

# Category-specific assistants
NEXT_PUBLIC_VAPI_ASSISTANT_PRODUCT_DESIGN=assistant_id_for_pm_interviews
NEXT_PUBLIC_VAPI_ASSISTANT_TECHNICAL=assistant_id_for_technical_interviews
NEXT_PUBLIC_VAPI_ASSISTANT_BEHAVIORAL=assistant_id_for_behavioral_interviews
NEXT_PUBLIC_VAPI_ASSISTANT_EXECUTION=assistant_id_for_execution_interviews
NEXT_PUBLIC_VAPI_ASSISTANT_ESTIMATION=assistant_id_for_estimation_interviews
NEXT_PUBLIC_VAPI_ASSISTANT_ANALYTICAL=assistant_id_for_analytical_interviews
NEXT_PUBLIC_VAPI_ASSISTANT_PRODUCT_STRATEGY=assistant_id_for_strategy_interviews

# Production URL
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## Vercel Deployment (Recommended)

### 1. Connect Repository
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository and click "Deploy"

### 2. Configure Environment Variables
1. In your Vercel project dashboard, go to "Settings" → "Environment Variables"
2. Add all environment variables from `.env.production`
3. Set the environment to "Production" for all variables

### 3. Configure Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Deploy
1. Click "Deploy" in the Vercel dashboard
2. Vercel will automatically build and deploy your application
3. Your app will be available at `https://your-project.vercel.app`

## Manual Deployment

### 1. Build the Application
```bash
npm run build
```

### 2. Start Production Server
```bash
npm start
```

### 3. Use Process Manager (PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start npm --name "pm-interviewer" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

## Firebase Configuration

### 1. Update Authorized Domains
1. Go to Firebase Console → Authentication → Settings
2. Add your production domain to "Authorized domains"

### 2. Update Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own transcripts
    match /transcripts/{transcriptId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Users can only access their own interview sessions
    match /interview-sessions/{sessionId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### 3. Update Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## VAPI AI Configuration

### 1. Update Webhook URLs
1. Go to VAPI Dashboard → Assistants
2. Update each assistant's webhook URL to your production domain
3. Example: `https://your-domain.com/api/vapi/webhook`

### 2. Test Webhooks
1. Use VAPI's webhook testing tool
2. Verify webhook endpoints are accessible
3. Check webhook logs for any errors

## Performance Optimization

### 1. Enable Caching
- Use Vercel's edge caching
- Implement proper cache headers
- Use CDN for static assets

### 2. Monitor Performance
- Use Vercel Analytics
- Monitor Core Web Vitals
- Set up performance alerts

## Security Considerations

### 1. Environment Variables
- Never commit `.env` files to version control
- Use Vercel's environment variable encryption
- Rotate API keys regularly

### 2. Firebase Security
- Use proper Firestore security rules
- Implement rate limiting
- Monitor authentication attempts

### 3. API Security
- Validate all input data
- Implement proper error handling
- Use HTTPS in production

## Monitoring and Maintenance

### 1. Error Tracking
- Set up error monitoring (e.g., Sentry)
- Monitor application logs
- Set up alerts for critical errors

### 2. Performance Monitoring
- Monitor response times
- Track user experience metrics
- Set up performance budgets

### 3. Regular Updates
- Keep dependencies updated
- Monitor security advisories
- Regular security audits

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify Node.js version
   - Check for TypeScript errors

2. **Runtime Errors**
   - Check browser console
   - Verify API endpoints
   - Check Firebase configuration

3. **Performance Issues**
   - Enable Vercel Analytics
   - Check bundle size
   - Optimize images and assets

### Support

For deployment issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test locally with production config
4. Check Firebase console for errors

## Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Configure SSL certificates
3. Set up monitoring and alerts
4. Plan for scaling and optimization
