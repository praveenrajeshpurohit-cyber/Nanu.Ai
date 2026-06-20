/**
 * types.ts
 * Core type definitions for Nanu.AI
 */

export interface GeneratedWebsiteSection {
  id: string;
  type: 'hero' | 'features' | 'about' | 'pricing' | 'cta' | 'contact' | 'faq' | 'gallery' | 'testimonials';
  title: string;
  subtitle?: string;
  badge?: string;
  content?: string;
  primaryButtonText?: string;
  primaryButtonTextLink?: string;
  secondaryButtonText?: string;
  items?: {
    id: string;
    title: string;
    description: string;
    icon?: string;
    price?: string;
    features?: string[];
    role?: string;
    value?: string;
    imageUrl?: string;
  }[];
  bgColor?: string; // e.g., 'bg-slate-900', 'bg-gradient-to-r from-violet-600 to-indigo-600'
  textColor?: string; // e.g., 'text-white', 'text-slate-100'
}

export interface GeneratedWebsiteConfig {
  siteName: string;
  theme: {
    primaryColor: string; // Tailwind color class / hex
    secondaryColor: string;
    fontFamily: 'sans' | 'serif' | 'mono';
    style: 'modern' | 'minimal' | 'glassmorphism' | 'brutalist' | 'neon';
  };
  sections: GeneratedWebsiteSection[];
}

export type RequestStatus = 'pending' | 'processing' | 'completed' | 'delivered';

export interface WebsiteRequest {
  id: string;
  prompt: string;
  status: RequestStatus;
  orderId: string;
  createdAt: string;
  userEmail?: string;
  userPhone?: string;
  selectedPlan?: string;
  generatedConfig?: GeneratedWebsiteConfig;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  category: string; // 'Business', 'E-commerce', 'Portfolio', 'Landing Page', 'Custom App'
  imageUrl: string;
  tags: string[];
  liveUrl: string;
  featured: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'new' | 'replied' | 'archived';
}

export interface PaymentConfirmation {
  id: string;
  orderId: string;
  name: string;
  email: string;
  phone: string;
  transactionId: string;
  amount: number;
  screenshot?: string; // b64
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface AdminSettings {
  pricing: number; // e.g., 1500
  contactNumber: string;
  contactEmail: string;
  whatsappNumber: string;
  founderName: string;
  founderPhoto: string; // base64 or placeholder url
  founderBio: string;
  qrCode: string; // base64 or placeholder url
  adminUsername?: string;
  adminPassword?: string;
  enabledSections: {
    hero: boolean;
    builder: boolean;
    pricing: boolean;
    portfolio: boolean;
    services: boolean;
    about: boolean;
    howItWorks: boolean;
    contact: boolean;
    faq: boolean;
  };
}
