# PM Interviewer - Local Development Setup

AI-powered PM interview practice platform built with Next.js 15, Firebase, and Tailwind CSS.

## Quick Setup

### 1. Clone and Install
```bash
git clone <repo-url>
cd pm-ai-mock-interviewer
npm install
```


### 3. Environment Variables
Create `.env.local` in root:

```env
# Get these from Firebase 
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_content\n-----END PRIVATE KEY-----\n"
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## Project Structure
```
app/
├── (auth)/          # Sign-in/up pages
├── (root)/          # Protected main app
├── globals.css      # Tailwind styles
└── layout.tsx       # Root layout

components/
├── ui/              # shadcn/ui components
├── AuthForm.tsx     # Login/signup form
├── InterviewCard.tsx
└── UserMenu.tsx     # Logout functionality

firebase/
├── client.ts        # Firebase client config
└── admin.ts         # Firebase admin config

lib/actions/
├── auth.action.ts   # Authentication server actions
└── general.action.ts # Data fetching
```

## Key Features Working
- ✅ Email/password authentication
- ✅ Google sign-in
- ✅ Session management with cookies
- ✅ Route protection
- ✅ Responsive UI with Tailwind CSS v4
- ✅ Toast notifications

## Development Commands
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run ESLint
```

## Tech Stack
- **Next.js 15** - App Router, Server Actions
- **TypeScript** - Type safety
- **Firebase** - Auth + Firestore
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - UI components
- **React Hook Form + Zod** - Form handling

## Common Issues
- **Firestore index errors**: Click the provided link in error to create indexes
- **Auth not working**: Check Firebase config and authorized domains
- **Env vars not loading**: Restart dev server after adding `.env.local`

## Next Steps
- Add interview creation flow
- Implement AI interviewer chat
- Add interview history/results
- Deploy to Vercel

---
*Questions? Check the terminal output or Firebase console for detailed error messages.*