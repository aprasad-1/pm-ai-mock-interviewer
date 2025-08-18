// Interview Question Templates and Assistant Mapping

export interface QuestionSet {
  id: string;
  title: string;
  description: string;
  category: 'product-management' | 'technical' | 'behavioral' | 'leadership' | 'design';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  questions: string[];
  assistantTemplate: string; // Maps to environment variable
}

export const interviewQuestionSets: QuestionSet[] = [
  {
    id: 'product-design',
    title: 'Product Design Questions',
    description: 'Design products, improve user experience, and demonstrate user-centered thinking',
    category: 'product-management',
    difficulty: 'intermediate',
    duration: 45,
    assistantTemplate: 'VAPI_ASSISTANT_PRODUCT_DESIGN',
    questions: [
      "Design an app for an amusement park.",
      "Design a product to encourage voting.",
      "How would you design what an advertisement looks like in virtual reality?",
      "Design a product for elderly users.",
      "How would you improve the user experience of a mobile banking app?",
      "Design a better way for families to plan and coordinate their weekly meals.",
      "How would you design a feature for discovering new podcasts on Spotify?",
      "Design a feature to help users find parking on Google Maps.",
      "How would you design a product that serves both B2B and B2C markets?",
      "Design a social media platform for professionals over 50.",
      "How would you improve the checkout experience for an e-commerce site?",
      "Design a fitness app for people with disabilities.",
      "How would you design a learning platform for remote teams?",
      "Design a product to help people reduce food waste.",
      "How would you improve the onboarding experience for a SaaS product?"
    ]
  },
  {
    id: 'product-strategy',
    title: 'Product Strategy Questions',
    description: 'Long-term planning, market analysis, and strategic decision-making',
    category: 'product-management',
    difficulty: 'advanced',
    duration: 45,
    assistantTemplate: 'VAPI_ASSISTANT_PRODUCT_STRATEGY',
    questions: [
      "Should Amazon enter the food delivery business?",
      "What is the biggest threat to YouTube?",
      "You're a PM working for a beverage company. How would you price a new line of high-end, mineral water bottles for the US market?",
      "Should Netflix create a gaming platform?",
      "How would you monetize WhatsApp without compromising user experience?",
      "What's the biggest opportunity for Slack in the next 5 years?",
      "Should Apple enter the healthcare market?",
      "How would you compete with TikTok if you were Instagram?",
      "What market should Uber enter next and why?",
      "How would you position a new productivity app against Notion?",
      "Should Google build a social media platform?",
      "How would you expand Airbnb into the business travel market?",
      "What's the biggest threat to Zoom and how would you address it?",
      "How would you monetize a free meditation app?",
      "Should Tesla enter the ride-sharing market?"
    ]
  },
  {
    id: 'analytical-metrics',
    title: 'Analytical & Metrics Questions',
    description: 'Data analysis, A/B testing, and metrics-driven decision making',
    category: 'product-management',
    difficulty: 'intermediate',
    duration: 30,
    assistantTemplate: 'VAPI_ASSISTANT_ANALYTICAL',
    questions: [
      "You're the PM of YouTube's Analytics. What would you pick as the three key metrics, and why?",
      "How would you determine success for Instagram Reels?",
      "Devise an A/B test to improve user frustration with Google Maps.",
      "Facebook friend requests are down 10%. What do you do?",
      "What metrics would you track for a subscription-based mobile app?",
      "User engagement on your platform dropped 15% last month. How do you investigate?",
      "How would you set up A/B testing for a checkout flow?",
      "Your app's retention rate is declining. What's your analysis approach?",
      "How would you measure the ROI of a new customer acquisition channel?",
      "Daily active users are flat but revenue is growing. What's happening?",
      "How would you analyze the impact of a pricing change?",
      "Your conversion rate dropped after a redesign. How do you investigate?",
      "What would be your North Star metric for a food delivery app?",
      "How would you measure user satisfaction for a B2B product?",
      "Your feature has high engagement but low retention. What's your hypothesis?"
    ]
  },
  {
    id: 'execution-problem-solving',
    title: 'Execution & Problem Solving Questions',
    description: 'Root cause analysis, problem-solving, and execution strategies',
    category: 'product-management',
    difficulty: 'intermediate',
    duration: 35,
    assistantTemplate: 'VAPI_ASSISTANT_EXECUTION',
    questions: [
      "Determine the right number of photos to show in Facebook's Newsfeed.",
      "As a PM at Stripe, one of the merchants is noticing an increase in fraud. How would you solve this problem?",
      "Your team missed the last three product deadlines. How do you fix this?",
      "A key engineer just quit in the middle of a critical project. What's your plan?",
      "Your biggest competitor just launched a feature you were planning. What do you do?",
      "Customer support tickets increased 200% after your last release. How do you handle this?",
      "Your CEO wants to add 10 new features but you only have resources for 2. How do you proceed?",
      "A critical bug is affecting 5% of users. How do you decide whether to fix it immediately?",
      "Your product launch was successful but operations can't handle the load. What's your approach?",
      "Two different teams want to use your API in conflicting ways. How do you resolve this?",
      "Your product has great reviews but low adoption. What's your investigation plan?",
      "A major client is threatening to leave unless you build their specific feature. How do you respond?",
      "Your development team says a feature will take 6 months but sales promised it in 2. What do you do?",
      "User complaints about your product are trending on social media. How do you respond?",
      "Your product roadmap conflicts with engineering capacity. How do you reconcile this?"
    ]
  },
  {
    id: 'estimation-market-sizing',
    title: 'Estimation & Market Sizing Questions',
    description: 'Market sizing, estimation problems, and quantitative reasoning',
    category: 'product-management',
    difficulty: 'intermediate',
    duration: 25,
    assistantTemplate: 'VAPI_ASSISTANT_ESTIMATION',
    questions: [
      "Estimate the number of Uber drivers needed in the San Francisco Bay Area.",
      "How much does the Empire State Building weigh?",
      "How much does the Google Play store make in a year?",
      "How many windows are in New York City?",
      "Estimate the market size for food delivery apps in the US.",
      "How many iPhones are sold globally each year?",
      "Estimate the number of searches Google processes per day.",
      "How much revenue does Netflix generate from subscriptions annually?",
      "Estimate the number of Airbnb listings worldwide.",
      "How many hours of video are uploaded to YouTube every minute?",
      "Estimate the total addressable market for project management software.",
      "How many people use social media daily in India?",
      "Estimate the number of coffee shops in Seattle.",
      "How much data does Facebook store?",
      "Estimate the market opportunity for electric vehicle charging stations."
    ]
  },
  {
    id: 'behavioral-cultural-fit',
    title: 'Behavioral & Cultural Fit Questions',
    description: 'Past experiences, leadership skills, and cultural fit assessment',
    category: 'behavioral',
    difficulty: 'beginner',
    duration: 30,
    assistantTemplate: 'VAPI_ASSISTANT_BEHAVIORAL',
    questions: [
      "Tell me about yourself.",
      "What's your favorite product and why?",
      "Why do you want to work at this company?",
      "Tell me about a time you had a conflict with an engineering counterpart.",
      "Tell me about a time you had to get your leadership to buy into your vision.",
      "What's your biggest strength?",
      "What's your biggest weakness?",
      "Describe a time when you failed and what you learned from it.",
      "Tell me about a time you had to make a difficult decision with limited information.",
      "How do you handle disagreement with stakeholders?",
      "Describe a time you had to influence without authority.",
      "Tell me about your most challenging project and how you managed it.",
      "How do you prioritize when everything seems urgent?",
      "Describe a time you had to deliver bad news to stakeholders.",
      "What motivates you as a product manager?"
    ]
  },
  {
    id: 'technical-pm',
    title: 'Technical PM Questions',
    description: 'Technical concepts, system architecture, and engineering collaboration',
    category: 'technical',
    difficulty: 'intermediate',
    duration: 40,
    assistantTemplate: 'VAPI_ASSISTANT_TECHNICAL',
    questions: [
      "What happens when you type a URL in the browser?",
      "How do autonomous vehicles work?",
      "Explain how machine learning recommendations work to a non-technical stakeholder.",
      "How would you explain APIs to a business stakeholder?",
      "What are the technical considerations for building a real-time chat feature?",
      "How does cloud computing work and what are its benefits?",
      "Explain the difference between SQL and NoSQL databases.",
      "How would you approach technical debt as a PM?",
      "What questions would you ask engineers when scoping a new feature?",
      "How do you balance technical excellence with speed to market?",
      "Explain how mobile app performance affects user experience.",
      "What technical factors would you consider when choosing between building vs buying?",
      "How would you communicate technical constraints to non-technical stakeholders?",
      "What role should a PM play in architecture decisions?",
      "How do you ensure product requirements are technically feasible?"
    ]
  }
];

// Helper function to get assistant ID from environment
export const getAssistantId = (template: string): string | undefined => {
  const envKey = template.startsWith('NEXT_PUBLIC_') ? template : `NEXT_PUBLIC_${template}`;
  return process.env[envKey];
};

// Helper function to get question set by ID
export const getQuestionSet = (id: string): QuestionSet | undefined => {
  return interviewQuestionSets.find(set => set.id === id);
};

// Helper function to get question sets by category
export const getQuestionSetsByCategory = (category: string): QuestionSet[] => {
  return interviewQuestionSets.filter(set => set.category === category);
};

// Helper function to get a random question from a category
export const getRandomQuestion = (categoryId: string): string | null => {
  const questionSet = interviewQuestionSets.find(set => set.id === categoryId);
  if (!questionSet || questionSet.questions.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * questionSet.questions.length);
  return questionSet.questions[randomIndex];
};

// Helper function to get multiple random questions (no duplicates)
export const getRandomQuestions = (categoryId: string, count: number = 1): string[] => {
  const questionSet = interviewQuestionSets.find(set => set.id === categoryId);
  if (!questionSet || questionSet.questions.length === 0) {
    return [];
  }
  
  const shuffled = [...questionSet.questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

// Generate system prompt for random question selection
export const generateInterviewPrompt = (categoryId: string, questionCount: number = 1): string => {
  const questionSet = interviewQuestionSets.find(set => set.id === categoryId);
  if (!questionSet) {
    return "You are a professional interviewer. Conduct a structured interview.";
  }
  
  const randomQuestions = getRandomQuestions(categoryId, questionCount);
  
  const categoryPrompts = {
    'product-design': `You are Alex, a Senior Product Manager conducting a product design interview. You focus on user empathy, design thinking, and feature prioritization.

METHODOLOGY: Guide the candidate through the C.I.R.C.L.E.S. framework:
- Comprehend the situation (clarifying questions)
- Identify users (specific personas)
- Report user needs (pain points)
- List solutions (brainstorming)
- Cut through & prioritize (MVP focus)
- Evaluate trade-offs (risks and downsides)
- Summarize recommendation (final proposal)`,

    'product-strategy': `You are Alex, a Senior Product Manager conducting a strategic thinking interview. You focus on market analysis, competitive positioning, and long-term planning.

FOCUS AREAS:
- Market identification and opportunity sizing
- Competitive analysis and differentiation
- Go-to-market strategy and pricing
- Product roadmap and vision
- Business model considerations`,

    'analytical-metrics': `You are Alex, a Senior Product Manager conducting an analytical interview. You focus on data-driven decision making and metrics.

METHODOLOGY: Guide them through:
- Problem identification and hypothesis formation
- Metric selection and measurement framework
- Experiment design (A/B testing)
- Data interpretation and insights
- Action planning based on results`,

    'execution-problem-solving': `You are Alex, a Senior Product Manager conducting an execution interview. You focus on problem-solving and operational excellence.

METHODOLOGY: For RCA questions, guide them through:
- Problem definition and impact assessment
- Hypothesis generation (multiple potential causes)
- Investigation plan and data gathering
- Root cause identification
- Solution development and implementation plan`,

    'estimation-market-sizing': `You are Alex, a Senior Product Manager conducting an estimation interview. You focus on quantitative reasoning and market sizing.

METHODOLOGY: Guide them through:
- Problem breakdown into smaller components
- Assumption identification and validation
- Calculation approach and logic
- Sanity checking and bounds testing
- Business implications of the estimate`,

    'behavioral-cultural-fit': `You are Alex, a Senior Product Manager conducting a behavioral interview. You focus on past experiences and leadership capabilities.

METHODOLOGY: Use STAR method prompting:
- Situation: What was the context?
- Task: What was your responsibility?
- Action: What specific actions did you take?
- Result: What was the outcome and what did you learn?`,

    'technical-pm': `You are Alex, a Senior Product Manager conducting a technical interview. You focus on technical understanding and engineering collaboration.

FOCUS AREAS:
- System architecture and design principles
- Technical trade-offs and constraints
- Engineering collaboration and communication
- Technical feasibility assessment
- Technology trends and implications`
  };

  const prompt = categoryPrompts[categoryId as keyof typeof categoryPrompts] || categoryPrompts['product-design'];

  return `${prompt}

INTERVIEW QUESTION (ask this specific question):
${randomQuestions[0]}

VOICE INTERVIEW RULES:
- Start with a warm greeting
- Ask the question above
- Wait for their complete response
- Ask 2-3 brief follow-up questions to probe deeper
- Keep YOUR responses short and conversational (max 20 words)
- Be professional yet warm and encouraging
- Use natural speech patterns with brief pauses

PROCESS:
1. Greet the candidate warmly
2. Ask the specific question provided above
3. Listen to their complete response
4. Ask relevant follow-up questions based on their answer
5. Conclude: "Thank you for that thoughtful response. You'll receive detailed feedback shortly."

CRITICAL RULES:
- NEVER provide answers, hints, or solutions yourself
- Your role is to guide, probe, and evaluate - not to solve
- Keep responses concise for voice conversation
- Focus on their thought process and reasoning`;
};
