# PM Interviewer

AI-powered Product Manager interview practice platform built with Next.js 15, Firebase, and VAPI.

## Features

- 🤖 **AI-Powered Interviews**: Practice with realistic AI interviewers
- 🎤 **Voice Conversations**: Natural voice-based interview experience
- 📊 **Instant Feedback**: Get detailed analysis and scoring
- 📱 **Mobile Optimized**: Works seamlessly on all devices
- 🔐 **Secure Authentication**: Firebase-based user management
- 📚 **Multiple Categories**: Product design, strategy, technical, and behavioral questions

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore), VAPI AI
- **AI**: OpenAI GPT-4, VAPI Voice AI
- **UI**: shadcn/ui components, React Hook Form + Zod

## Quick Start

### 1. Clone and Install
```bash
git clone <repo-url>
cd pm-ai-mock-interviewer
npm install
```

### 2. Environment Variables
Create `.env.local` in root:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
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

# Optional: Category-specific assistants
NEXT_PUBLIC_VAPI_ASSISTANT_PRODUCT_DESIGN=assistant_id_for_pm_interviews
NEXT_PUBLIC_VAPI_ASSISTANT_TECHNICAL=assistant_id_for_technical_interviews
NEXT_PUBLIC_VAPI_ASSISTANT_BEHAVIORAL=assistant_id_for_behavioral_interviews
NEXT_PUBLIC_VAPI_ASSISTANT_EXECUTION=assistant_id_for_execution_interviews
NEXT_PUBLIC_VAPI_ASSISTANT_ESTIMATION=assistant_id_for_estimation_interviews
NEXT_PUBLIC_VAPI_ASSISTANT_ANALYTICAL=assistant_id_for_analytical_interviews
NEXT_PUBLIC_VAPI_ASSISTANT_PRODUCT_STRATEGY=assistant_id_for_strategy_interviews

# Base URL for production
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## Project Structure
```
app/
├── (auth)/          # Authentication pages
├── (root)/          # Protected main application
├── api/             # API routes
├── globals.css      # Global styles
└── layout.tsx       # Root layout

components/
├── ui/              # shadcn/ui components
├── Agent.tsx        # AI interviewer component
├── AuthForm.tsx     # Authentication forms
├── InterviewCard.tsx # Interview display components
└── UserMenu.tsx     # User navigation

lib/
├── actions/         # Server actions
├── firebase/        # Firebase configuration
├── interview-templates.ts # Interview question sets
└── vapi.sdk.ts      # VAPI AI integration
```

## Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm run start
```

## Environment Setup

### Firebase Setup
1. Create a new Firebase project
2. Enable Authentication (Email/Password, Google)
3. Create Firestore database
4. Download service account key for admin SDK

### VAPI AI Setup
1. Sign up at [vapi.ai](https://vapi.ai)
2. Create assistants for different interview categories
3. Get your API key and assistant IDs
4. Configure webhook endpoints if needed

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@pminterviewer.com or create an issue in the repository.