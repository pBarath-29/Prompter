


export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  submittedPrompts?: string[];
  purchasedCollections?: string[];
  savedPrompts?: string[];
  createdCollections?: string[];
  subscriptionTier: 'free' | 'pro';
  role: 'user' | 'admin';
  status: 'active' | 'banned';
  promptGenerations: number;
  lastGenerationReset: string; // Format 'YYYY-MM'
  promptsSubmittedToday: number;
  lastSubmissionDate: string; // Format 'YYYY-MM-DD'
  hasCompletedTutorial: boolean;
  votes?: { [promptId: string]: 'up' | 'down' };
  themePreference?: 'light' | 'dark';
}

export interface BannedEmail {
  email: string;
  bannedAt: string;
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  createdAt: string;
}

export interface Prompt {
  id: string;
  title: string;
  prompt: string;
  description: string;
  author: User;
  category: Category;
  tags: string[];
  upvotes: number;
  downvotes: number;
  comments: Comment[];
  createdAt: string;
  model: AIModel;
  isPublic: boolean;
  status: 'pending' | 'approved' | 'rejected';
  exampleOutput?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  creator: User;
  price: number;
  promptCount: number;
  coverImage: string;
  promptIds: string[];
  status: 'pending' | 'approved' | 'rejected';
}

export interface HistoryItem {
  id: string;
  title: string;
  prompt: string;
  tags: string[];
  createdAt: string;
}

export type AIModel = 'ChatGPT' | 'Claude' | 'Gemini' | 'MidJourney' | 'DALL-E';
export type Category = 'Education' | 'Coding' | 'Business' | 'Art' | 'Marketing' | 'Fun';
export type Tone = 'Professional' | 'Casual' | 'Creative' | 'Academic' | 'Humorous';
export type FeedbackType = 'General Feedback' | 'Bug Report' | 'Feature Request' | 'Praise';

export interface FeedbackItem {
  id: string;
  user: User;
  type: FeedbackType;
  message: string;
  createdAt: string;
  status: 'pending' | 'reviewed';
}

export interface PromoCode {
  id: string; // The code itself, e.g., "SAVE25"
  discountPercentage: number;
  usageLimit: number;
  timesUsed: number;
  createdAt: string;
}

export const AI_MODELS: AIModel[] = ['ChatGPT', 'Claude', 'Gemini', 'MidJourney', 'DALL-E'];
export const CATEGORIES: Category[] = ['Education', 'Coding', 'Business', 'Art', 'Marketing', 'Fun'];
export const TONES: Tone[] = ['Professional', 'Casual', 'Creative', 'Academic', 'Humorous'];
export const FEEDBACK_TYPES: FeedbackType[] = ['General Feedback', 'Bug Report', 'Feature Request', 'Praise'];