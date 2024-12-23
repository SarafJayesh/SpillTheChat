// types/chat.ts

import { PersonalityProfile } from './personality';

export interface ParsedMessage {
  timestamp: Date;
  sender: string;
  content: string;
  type: 'media' | 'text';
  metadata: {
    hasEmoji: boolean;
    isForwarded: boolean;
  };
}

export interface ParticipantData {
  id: string;
  name: string;
  messages: ParsedMessage[];
  messageCount: number;
  firstMessage: Date;
  lastMessage: Date;
  activeHours: Set<number>;
  activeDays: Set<string>;
}

export interface Thread {
  startMessage: ParsedMessage;
  messages: ParsedMessage[];
}

export interface AnalyticsData {
  messages: ParsedMessage[];
  participants: Map<string, ParticipantData>;
  timeframes: {
    hourly: Map<number, number>;
    daily: Map<string, number>;
    weekly: Map<number, number>;
    monthly: Map<string, number>;
  };
  interactions: {
    threads: Thread[];
    responseTimes: Map<string, number[]>;
    mentions: Map<string, string[]>;
    interactions: Map<string, Set<string>>;
  };
}

export interface TimeDistribution {
  hour: number;
  count: number;
}

export interface ChatStats {
  totalMessages: number;
  participants: string[];
  messagesByParticipant: Record<string, number>;
  mediaCount: number;
  messagesByDate: MessageDate[];
  timeDistribution: TimeDistribution[];
  emojiCount: Record<string, number>;
  averageMessageLength: number;
  mostActiveDate: MessageDate;
  lateNightPercentage: number;
}

export interface ProcessedResult {
  type: string;
  timestamp: Date;
  data: ChatStats | Map<string, PersonalityProfile> | BasicStatsProcessedResult | any;
}

export interface AnalyticsProcessor {
  type: string;
  dependencies: string[];
  process(data: AnalyticsData): Promise<ProcessedResult>;
  update?(newData: AnalyticsData): Promise<ProcessedResult>;
}

export interface BasicStatsProcessedResult {
  totalMessages: number;
  participants: string[];
  messagesByParticipant: Record<string, number>;
  mediaCount: number;
  messagesByDate: MessageDate[];
  timeDistribution: TimeDistribution[];
  emojiCount: Record<string, number>;
  averageMessageLength: number;
  mostActiveDate: MessageDate;
  lateNightPercentage: number;
  activityHeatmap: ActivityHeatmapData[];
  moodPatterns: MoodData[];
}

export interface MessageDate {
  date: string;
  count: number;
}


export interface ActivityHeatmapData {
  date: string;
  hour: number;
  count: number;
  dayOfWeek: number;
}

export interface MoodData {
  timestamp: string;
  sentiment: number;
  mood: 'positive' | 'negative' | 'neutral';
  intensity: number;
}