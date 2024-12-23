// types/personality.ts

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export interface CharacterClass {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  rarity: Rarity;
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: Rarity;
  unlockedAt?: Date;
  progress: number; // 0-100
}

export interface ActivityMetrics {
  hourlyDistribution: number[];    // 24 hours
  weeklyDistribution: number[];    // 7 days
  periodActivity: {
    morning: number;   // 5-11
    afternoon: number; // 12-17
    evening: number;   // 18-21
    night: number;     // 22-4
  };
}

export interface CommunicationMetrics {
  averageMessageLength: number;
  messageVariability: number;
  responseTime: number;
  emojiUsage: {
    frequency: number;
    favorites: Array<[string, number]>; // [emoji, count]
  };
  mediaSharing: number;
}

export interface InteractionMetrics {
  initiationRate: number;        // How often they start conversations
  responseRate: number;          // How often they respond
  engagementScore: number;       // Overall engagement in conversations
  conversationImpact: number;    // How much their messages drive discussion
}

export interface Highlight {
  type: 'message' | 'moment' | 'achievement';
  timestamp: Date;
  description: string;
  context?: string;
  impact: number;  // 0-100
}

// Profile and metrics interfaces
export interface PersonalityProfile {
    characterClass: CharacterClass;
    traits: {
      activityPattern: string;
      communicationStyle: string;
      groupRole: string;
    };
    metrics: {
      responseTime: number;
      messageLength: number;
      activityConsistency: number;
      socialConnection: number;
    };
    specialAbilities: string[];
    achievements: Achievement[];
    activityMetrics: ActivityMetrics;
    communicationMetrics: CommunicationMetrics;
    interactionMetrics: InteractionMetrics;
    highlights: Highlight[];
  }  

// Constants for predefined values
export const CHARACTER_CLASSES: Record<string, Omit<CharacterClass, 'id'>> = {
  MEME_LORD: {
    name: 'Meme Lord',
    icon: '👑',
    description: 'Master of internet culture, speaks fluently in GIFs and emojis',
    color: '#FFD700',
    rarity: 'Legendary'
  },
  NIGHT_GUARDIAN: {
    name: 'Night Guardian',
    icon: '🌙',
    description: 'Protector of late-night conversations',
    color: '#4A90E2',
    rarity: 'Epic'
  },
  CONVERSATION_CATALYST: {
    name: 'Conversation Catalyst',
    icon: '⚡',
    description: 'Sparks engaging discussions out of thin air',
    color: '#FF6B6B',
    rarity: 'Rare'
  },
  EMOJI_WIZARD: {
    name: 'Emoji Wizard',
    icon: '✨',
    description: 'Communicates complex ideas through emojis alone',
    color: '#50E3C2',
    rarity: 'Epic'
  },
  SAGE_ADVISOR: {
    name: 'Sage Advisor',
    icon: '🧙‍♂️',
    description: 'Provides wisdom and guidance to the group',
    color: '#9B51E0',
    rarity: 'Legendary'
  },
  SOCIAL_BUTTERFLY: {
    name: 'Social Butterfly',
    icon: '🦋',
    description: 'Connects with everyone, keeps conversations flowing',
    color: '#FF9A9E',
    rarity: 'Rare'
  }
};

export const ACHIEVEMENTS: Record<string, Omit<Achievement, 'id' | 'progress' | 'unlockedAt'>> = {
  SPEED_DEMON: {
    name: 'Speed Demon',
    icon: '⚡',
    description: 'Responded to 100 messages within 30 seconds',
    rarity: 'Epic'
  },
  NIGHT_OWL: {
    name: 'Night Owl',
    icon: '🦉',
    description: 'Sent 1000 messages between midnight and 5 AM',
    rarity: 'Rare'
  },
  EMOJI_MASTER: {
    name: 'Emoji Master',
    icon: '🎭',
    description: 'Used over 100 different emojis',
    rarity: 'Epic'
  },
  CONVERSATION_STARTER: {
    name: 'Conversation Starter',
    icon: '🎯',
    description: 'Started 50 active discussions',
    rarity: 'Common'
  }
};

