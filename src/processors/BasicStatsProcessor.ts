import { 
    AnalyticsProcessor, 
    AnalyticsData, 
    ProcessedResult,
    BasicStatsProcessedResult
  } from '../types/chat';
  
  export class BasicStatsProcessor implements AnalyticsProcessor {
    type = 'basic';
    dependencies = [];  // No dependencies
  
    async process(data: AnalyticsData): Promise<ProcessedResult> {
      // Calculate message data
      const totalMessages = data.messages.length;
      const participants = Array.from(data.participants.keys());
      
      // Calculate media count
      const mediaCount = data.messages.filter(m => m.type === 'media').length;
  
      // Get messages by participant
      const messagesByParticipant: Record<string, number> = {};
      data.participants.forEach((participant, id) => {
        messagesByParticipant[id] = participant.messageCount;
      });
  
      // Get messages by date
      const messagesByDate = Array.from(data.timeframes.daily).map(([date, count]) => ({
        date,
        count
      }));
  
      // Get time distribution
      const timeDistribution = Array.from(data.timeframes.hourly).map(([hour, count]) => ({
        hour,
        count
      }));
  
      // Calculate emoji usage
      const emojiCount: Record<string, number> = {};
      data.messages.forEach(msg => {
        if (msg.metadata.hasEmoji) {
          // Extract emojis and count them
          const emojis = msg.content.match(/[\u{1F300}-\u{1F9FF}]/gu) || [];
          emojis.forEach(emoji => {
            emojiCount[emoji] = (emojiCount[emoji] || 0) + 1;
          });
        }
      });
  
      // Calculate average message length
      const averageMessageLength = Math.round(
        data.messages.reduce((sum, msg) => sum + msg.content.length, 0) / totalMessages
      );
  
      // Find most active date
      const mostActiveDate = messagesByDate.reduce((max, curr) => 
        curr.count > max.count ? curr : max
      );
  
      // Calculate late night percentage
      const lateNightMessages = data.messages.filter(msg => {
        const hour = msg.timestamp.getHours();
        return hour >= 22 || hour <= 4;
      }).length;
      const lateNightPercentage = Math.round((lateNightMessages / totalMessages) * 100);
  
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
          lateNightPercentage
        }
      };
    }
  
    async update(newData: AnalyticsData): Promise<ProcessedResult> {
      return await this.process(newData);
    }
  }