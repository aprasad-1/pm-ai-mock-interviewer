export interface User {
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

export interface UserProfile {
  name: string;
  email: string;
  photoURL?: string;
  subscriptionStatus: 'free' | 'active' | 'canceled';
  walletMinutes: number;
  stripeCustomerId?: string;
}
