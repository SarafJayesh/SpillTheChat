export interface ChatMessage {
    timestamp: Date;
    sender: string;
    content: string;
    isMedia: boolean;
  }
  
  export interface ChatStats {
    totalMessages: number;
    participants: string[];
    mediaCount: number;
    timeRange: {
      start: Date;
      end: Date;
    };
  }