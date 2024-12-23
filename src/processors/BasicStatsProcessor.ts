// processors/BasicStatsProcessor.ts

import { 
  AnalyticsProcessor, 
  AnalyticsData, 
  ProcessedResult,
  BasicStatsProcessedResult,
  ActivityHeatmapData,
  MoodData
} from '../types/chat';

export class BasicStatsProcessor implements AnalyticsProcessor {
  type = 'basic';
  dependencies = [];

  async process(data: AnalyticsData): Promise<ProcessedResult> {
    // Basic stats calculations (existing code)
    const totalMessages = data.messages.length;
    const participants = Array.from(data.participants.keys());
    const mediaCount = data.messages.filter(m => m.type === 'media').length;

    // Messages by participant
    const messagesByParticipant: Record<string, number> = {};
    data.participants.forEach((participant, id) => {
      messagesByParticipant[id] = participant.messageCount;
    });

    // Messages by date
    const messagesByDate = Array.from(data.timeframes.daily).map(([date, count]) => ({
      date,
      count
    }));

    // Time distribution
    const timeDistribution = Array.from(data.timeframes.hourly).map(([hour, count]) => ({
      hour,
      count
    }));

    // Emoji usage
    const emojiCount: Record<string, number> = {};
    data.messages.forEach(msg => {
      if (msg.metadata.hasEmoji) {
        const emojis = msg.content.match(/[\u{1F300}-\u{1F9FF}]/gu) || [];
        emojis.forEach(emoji => {
          emojiCount[emoji] = (emojiCount[emoji] || 0) + 1;
        });
      }
    });

    // Average message length
    const averageMessageLength = Math.round(
      data.messages.reduce((sum, msg) => sum + msg.content.length, 0) / totalMessages
    );

    // Most active date
    const mostActiveDate = messagesByDate.reduce((max, curr) => 
      curr.count > max.count ? curr : max
    );

    // Late night percentage
    const lateNightMessages = data.messages.filter(msg => {
      const hour = msg.timestamp.getHours();
      return hour >= 22 || hour <= 4;
    }).length;
    const lateNightPercentage = Math.round((lateNightMessages / totalMessages) * 100);

    // Activity Heatmap Data
    const activityHeatmap = this.generateActivityHeatmap(data);

    // Mood Patterns
    const moodPatterns = this.analyzeMoodPatterns(data);

    return {
      type: this.type,
      timestamp: new Date(),
      data: {
        totalMessages,
        participants,
        messagesByParticipant,
        mediaCount,
        messagesByDate,
        timeDistribution,
        emojiCount,
        averageMessageLength,
        mostActiveDate,
        lateNightPercentage,
        activityHeatmap,
        moodPatterns
      }
    };
  }

  private generateActivityHeatmap(data: AnalyticsData): ActivityHeatmapData[] {
    const heatmapData: ActivityHeatmapData[] = [];
    const activityMap = new Map<string, Map<number, number>>();

    // Process messages into daily hour counts
    data.messages.forEach(msg => {
      const date = msg.timestamp.toISOString().split('T')[0];
      const hour = msg.timestamp.getHours();
      const dayOfWeek = msg.timestamp.getDay();

      if (!activityMap.has(date)) {
        activityMap.set(date, new Map());
      }

      const hourMap = activityMap.get(date)!;
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });

    // Convert to array format
    activityMap.forEach((hourMap, date) => {
      hourMap.forEach((count, hour) => {
        heatmapData.push({
          date,
          hour,
          count,
          dayOfWeek: new Date(date).getDay()
        });
      });
    });

    return heatmapData;
  }

  private analyzeMoodPatterns(data: AnalyticsData): MoodData[] {
    return data.messages.map(msg => {
      // Simple sentiment analysis based on emoji presence and common patterns
      let sentiment = 0;
      let intensity = 0.5;

      // Check for positive indicators
      if (msg.content.match(/[😊😄😃😀🙂👍❤️💕✨]/g)) {
        sentiment += 0.5;
        intensity += 0.2;
      }

      // Check for negative indicators
      if (msg.content.match(/[😢😭😞😔👎💔😠😡]/g)) {
        sentiment -= 0.5;
        intensity += 0.2;
      }

      // Check for emphasis (!!!, CAPS, repetition)
      if (msg.content.match(/!{3,}|[A-Z]{3,}|(.)\1{2,}/g)) {
        intensity += 0.3;
      }

      // Normalize values
      sentiment = Math.max(-1, Math.min(1, sentiment));
      intensity = Math.max(0, Math.min(1, intensity));

      return {
        timestamp: msg.timestamp.toISOString(),
        sentiment,
        mood: sentiment > 0.3 ? 'positive' : sentiment < -0.3 ? 'negative' : 'neutral',
        intensity
      };
    });
  }

  async update(newData: AnalyticsData): Promise<ProcessedResult> {
    return await this.process(newData);
  }
}