// types/chat.ts

// Raw message after initial parsing
export interface ParsedMessage {
  timestamp: Date;
  sender: string;
  content: string;
  type: 'text' | 'media' | 'deleted';
  replyTo?: string;  // Message this is replying to
  metadata: {
    hasEmoji: boolean;
    isForwarded: boolean;
    quotedMessage?: string;
    mediaType?: string;
  };
}

// Core data about a participant
export interface ParticipantData {
  id: string;
  name: string;
  messages: ParsedMessage[];
  messageCount: number;
  firstMessage: Date;
  lastMessage: Date;
  activeHours: Set<number>;
  activeDays: Set<string>; // ISO date strings
}

// Time-based statistics
export interface TimeframeData {
  hourly: Map<number, number>;     // Hour -> message count
  daily: Map<string, number>;      // ISO date -> message count
  weekly: Map<number, number>;     // Week number -> message count
  monthly: Map<string, number>;    // Month (YYYY-MM) -> message count
}

// Interaction patterns
export interface InteractionData {
  threads: ChatThread[];
  responseTimes: Map<string, number[]>;  // User -> array of response times
  mentions: Map<string, string[]>;       // User -> array of users mentioned
  interactions: Map<string, Set<string>>; // User -> set of users interacted with
}

// Represents a conversation thread
export interface ChatThread {
  id: string;
  startMessage: ParsedMessage;
  participants: Set<string>;
  messages: ParsedMessage[];
  duration: number;  // In milliseconds
  intensity: number; // Messages per minute
}

// Core analytics data container
export interface AnalyticsData {
  messages: ParsedMessage[];
  participants: Map<string, ParticipantData>;
  timeframes: TimeframeData;
  interactions: InteractionData;
}

// Make ProcessedResult generic to improve type safety
export interface ProcessedResult<T = any> {
  type: string;
  timestamp: Date;
  data: T;
}

// Base interface for all analytics processors
export interface AnalyticsProcessor {
  type: string;
  dependencies: string[];
  process(data: AnalyticsData): Promise<ProcessedResult>;
  update(newData: AnalyticsData): Promise<ProcessedResult>;
}

// Analytics Service interface
export interface AnalyticsService {
  name: string;
  analyze(data: AnalyticsData): Promise<ProcessedResult>;
  isAvailable(): boolean;
}

// Personality specific types
export interface PersonalityProfile {
  archetype: {
    primary: string;
    secondary: string[];
  };
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
}

// Specific ProcessedResult types
export interface PersonalityProcessedResult extends ProcessedResult<Map<string, PersonalityProfile>> {
  type: 'personality';
}

export interface BasicStatsProcessedResult extends ProcessedResult<{
  totalMessages: number;
  participants: string[];
  messagesByParticipant: Record<string, number>;
  mediaCount: number;
  messagesByDate: { date: string; count: number; }[];
  timeDistribution: { hour: number; count: number; }[];
  emojiCount: Record<string, number>;
  averageMessageLength: number;
  mostActiveDate: { date: string; count: number; };
  lateNightPercentage: number;
}> {
  type: 'basic';
}