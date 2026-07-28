import {
  LayoutDashboard,
  Bot,
  Users,
  Bell,
  Sparkles,
} from 'lucide-react';

import { LucideIcon } from 'lucide-react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface TourStep {
  /** Unique identifier for the step */
  id: string;
  /** CSS selector of the target element to highlight */
  target: string;
  /** Step title displayed in the tooltip */
  title: string;
  /** Step description displayed in the tooltip */
  description: string;
  /** Preferred placement of the tooltip relative to the target */
  placement: 'top' | 'right' | 'bottom' | 'left' | 'auto';
  /** Optional Lucide icon component */
  icon?: LucideIcon;
  /** Callback fired before this step is shown */
  onBeforeStep?: () => void | Promise<void>;
  /** Callback fired after this step is completed (user clicks Next) */
  onAfterStep?: () => void | Promise<void>;
  /** Spotlight padding override in pixels */
  spotlightPadding?: number;
  /** Condition to determine if the step should be shown */
  condition?: () => boolean;
  /** Custom button text overrides */
  customButtonText?: {
    next?: string;
    prev?: string;
  };
}

export interface TourConfig {
  /** Unique tour identifier for storage */
  tourId: string;
  /** List of steps in the tour */
  steps: TourStep[];
  /** Auto start delay in milliseconds */
  autoStartDelay?: number;
}

// ─────────────────────────────────────────────
// Dashboard Tour Steps
// ─────────────────────────────────────────────

export const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome-hero',
    target: '#tour-welcome-hero',
    title: 'Your Digital Twin Command Center',
    description:
      'Welcome to your NetTwin dashboard! This is your central hub for creating, managing, and monitoring your AI digital twin.',
    placement: 'bottom',
    icon: LayoutDashboard,
    spotlightPadding: 16,
    customButtonText: { next: "Let's begin! →" },
  },
  {
    id: 'twin-card',
    target: '#tour-twin-card',
    title: 'Your Active Digital Twin',
    description:
      'This card shows your active AI twin. Here, you can edit your twin\'s bio and identity, download its QR code, sync its knowledge base, or preview the live chatbot view.',
    placement: 'bottom',
    icon: Bot,
    spotlightPadding: 12,
  },
  {
    id: 'stats-cards',
    target: '#tour-stats-cards',
    title: 'Leads Breakdown',
    description:
      'See a summary of your leads. You can click on any card (New, Contacted, Qualified, or Converted) to filter the leads list below by that status.',
    placement: 'bottom',
    icon: Sparkles,
    spotlightPadding: 12,
  },
  {
    id: 'leads-section',
    target: '#tour-leads-section',
    title: 'Leads & Conversations',
    description:
      'Track every prospect captured by your digital twin. Click on any lead to open their details and read the full conversation transcript between them and your AI twin!',
    placement: 'top',
    icon: Users,
    spotlightPadding: 12,
  },
  {
    id: 'user-menu',
    target: '#tour-user-menu',
    title: 'Profile & Settings',
    description:
      'Click your avatar dropdown at any time to update your profile photo, adjust account settings, manage your billing subscription, or log out.',
    placement: 'bottom',
    icon: Bell,
    spotlightPadding: 12,
    customButtonText: { next: 'Finish 🎉' },
  },
];

export const DASHBOARD_TOUR_CONFIG: TourConfig = {
  tourId: 'nettwin_dashboard_tour_v1',
  steps: DASHBOARD_TOUR_STEPS,
  autoStartDelay: 1500,
};
