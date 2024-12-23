// src/processors/PersonalityProcessor.ts

import { 
  AnalyticsProcessor, 
  AnalyticsData, 
  ProcessedResult,
  ParticipantData 
} from '../types/chat';
import { 
  PersonalityProfile,
  CharacterClass,
  ActivityMetrics,
  CommunicationMetrics,
  InteractionMetrics,
  Highlight,
  CHARACTER_CLASSES,
  ACHIEVEMENTS
} from '../types/personality';

export class PersonalityProcessor implements AnalyticsProcessor {
  type = 'personality';
  dependencies = ['basic'];

  async process(data: AnalyticsData): Promise<ProcessedResult> {
    const profiles = new Map<string, PersonalityProfile>();
  
    for (const [userId, participant] of data.participants) {
      profiles.set(userId, await this.analyzeParticipant(participant, data));
    }
  
    return {
      type: this.type,
      timestamp: new Date(),
      data: profiles
    };
  }

  private async analyzeParticipant(
    participant: ParticipantData, 
    data: AnalyticsData
  ): Promise<PersonalityProfile> {
    const characterClass = this.determineCharacterClass(participant);
    const activityMetrics = this.calculateActivityMetrics(participant);
    const communicationMetrics = this.calculateCommunicationMetrics(participant);
    const interactionMetrics = this.calculateInteractionMetrics(participant, data);
    const achievements = this.calculateAchievements(participant, data);
    const highlights = this.generateHighlights(participant, data);

    return {
      characterClass,
      traits: {
        activityPattern: this.determineActivityPattern(activityMetrics),
        communicationStyle: this.determineCommunicationStyle(communicationMetrics),
        groupRole: this.determineGroupRole(interactionMetrics)
      },
      metrics: {
        responseTime: communicationMetrics.responseTime,
        messageLength: communicationMetrics.averageMessageLength,
        activityConsistency: activityMetrics.periodActivity.morning + 
                           activityMetrics.periodActivity.afternoon +
                           activityMetrics.periodActivity.evening +
                           activityMetrics.periodActivity.night,
        socialConnection: interactionMetrics.engagementScore
      },
      specialAbilities: this.determineSpecialAbilities(participant, activityMetrics, communicationMetrics, interactionMetrics),
      achievements,
      activityMetrics,
      communicationMetrics,
      interactionMetrics,
      highlights
    };
  }

  private determineCharacterClass(participant: ParticipantData): CharacterClass {
    // Simple logic for demo - you can make this more sophisticated
    const nightMessages = participant.messages.filter(msg => {
      const hour = msg.timestamp.getHours();
      return hour >= 22 || hour <= 4;
    }).length;

    const nightPercentage = (nightMessages / participant.messages.length) * 100;

    if (nightPercentage > 30) {
      return {
        id: 'NIGHT_GUARDIAN',
        ...CHARACTER_CLASSES.NIGHT_GUARDIAN
      };
    }

    const emojiMessages = participant.messages.filter(msg => msg.metadata.hasEmoji).length;
    const emojiPercentage = (emojiMessages / participant.messages.length) * 100;

    if (emojiPercentage > 40) {
      return {
        id: 'EMOJI_WIZARD',
        ...CHARACTER_CLASSES.EMOJI_WIZARD
      };
    }

    // Default to Social Butterfly
    return {
      id: 'SOCIAL_BUTTERFLY',
      ...CHARACTER_CLASSES.SOCIAL_BUTTERFLY
    };
  }

  private calculateActivityMetrics(participant: ParticipantData): ActivityMetrics {
    const hourlyDistribution = new Array(24).fill(0);
    const weeklyDistribution = new Array(7).fill(0);
    let morning = 0, afternoon = 0, evening = 0, night = 0;

    participant.messages.forEach(msg => {
      const hour = msg.timestamp.getHours();
      const day = msg.timestamp.getDay();

      hourlyDistribution[hour]++;
      weeklyDistribution[day]++;

      if (hour >= 5 && hour < 12) morning++;
      else if (hour >= 12 && hour < 17) afternoon++;
      else if (hour >= 17 && hour < 22) evening++;
      else night++;
    });

    const total = participant.messages.length;
    return {
      hourlyDistribution,
      weeklyDistribution,
      periodActivity: {
        morning: (morning / total) * 100,
        afternoon: (afternoon / total) * 100,
        evening: (evening / total) * 100,
        night: (night / total) * 100
      }
    };
  }

  private calculateCommunicationMetrics(participant: ParticipantData): CommunicationMetrics {
    const messageLengths = participant.messages.map(m => m.content.length);
    const averageLength = messageLengths.reduce((a, b) => a + b, 0) / messageLengths.length;
    const variance = messageLengths.reduce((a, b) => a + Math.pow(b - averageLength, 2), 0) / messageLengths.length;

    const emojiCount = new Map<string, number>();
    participant.messages.forEach(msg => {
      Array.from(msg.content.matchAll(/[\p{Emoji}]/gu)).forEach(match => {
        const emoji = match[0];
        emojiCount.set(emoji, (emojiCount.get(emoji) || 0) + 1);
      });
    });

    return {
      averageMessageLength: averageLength,
      messageVariability: Math.sqrt(variance),
      responseTime: 0, // This should be calculated from the data.interactions
      emojiUsage: {
        frequency: participant.messages.filter(m => m.metadata.hasEmoji).length / participant.messages.length,
        favorites: Array.from(emojiCount.entries())
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
      },
      mediaSharing: participant.messages.filter(m => m.type === 'media').length / participant.messages.length
    };
  }

  private calculateInteractionMetrics(participant: ParticipantData, data: AnalyticsData): InteractionMetrics {
    const threads = data.interactions.threads;
    const responseTimes = data.interactions.responseTimes.get(participant.id) || [];
    
    return {
      initiationRate: threads.filter(t => t.startMessage.sender === participant.id).length / threads.length,
      responseRate: responseTimes.length / participant.messages.length,
      engagementScore: this.calculateEngagementScore(participant, data),
      conversationImpact: this.calculateConversationImpact(participant, data)
    };
  }

  private calculateEngagementScore(participant: ParticipantData, data: AnalyticsData): number {
    // Calculate engagement based on interaction patterns
    // This is a simplified version - you can make it more sophisticated
    const interactionSet = data.interactions.interactions.get(participant.id) || new Set();
    return (interactionSet.size / data.participants.size) * 100;
  }

  private calculateConversationImpact(participant: ParticipantData, data: AnalyticsData): number {
    // Calculate how much a participant's messages lead to responses
    // This is a simplified version - you can make it more sophisticated
    return participant.messages.length / data.messages.length * 100;
  }

  private generateHighlights(participant: ParticipantData, data: AnalyticsData): Highlight[] {
    const highlights: Highlight[] = [];

    // Most active day
    const messageCounts = new Map<string, number>();
    participant.messages.forEach(msg => {
      const date = msg.timestamp.toISOString().split('T')[0];
      messageCounts.set(date, (messageCounts.get(date) || 0) + 1);
    });

    const [mostActiveDate, messageCount] = Array.from(messageCounts.entries())
      .sort(([,a], [,b]) => b - a)[0];

    highlights.push({
      type: 'moment',
      timestamp: new Date(mostActiveDate),
      description: `Most active day with ${messageCount} messages`,
      impact: 85
    });

    return highlights;
  }

  private determineSpecialAbilities(
    participant: ParticipantData,
    activityMetrics: ActivityMetrics,
    communicationMetrics: CommunicationMetrics,
    interactionMetrics: InteractionMetrics
  ): string[] {
    const abilities: string[] = [];

    if (activityMetrics.periodActivity.night > 30) {
      abilities.push('Night Owl');
    }

    if (communicationMetrics.emojiUsage.frequency > 0.4) {
      abilities.push('Emoji Master');
    }

    if (interactionMetrics.initiationRate > 0.3) {
      abilities.push('Conversation Starter');
    }

    if (interactionMetrics.engagementScore > 80) {
      abilities.push('Social Connector');
    }

    return abilities;
  }

  private calculateAchievements(participant: ParticipantData, data: AnalyticsData) {
    const achievements = [];
    
    // Speed Demon Achievement
    if (participant.messages.length > 100) {
      achievements.push({
        id: 'SPEED_DEMON',
        ...ACHIEVEMENTS.SPEED_DEMON,
        progress: Math.min(participant.messages.length / 100 * 100, 100),
        unlockedAt: new Date()
      });
    }

    // Night Owl Achievement
    const nightMessages = participant.messages.filter(msg => {
      const hour = msg.timestamp.getHours();
      return hour >= 0 && hour < 5;
    }).length;

    if (nightMessages > 0) {
      achievements.push({
        id: 'NIGHT_OWL',
        ...ACHIEVEMENTS.NIGHT_OWL,
        progress: Math.min(nightMessages / 1000 * 100, 100),
        unlockedAt: nightMessages >= 1000 ? new Date() : undefined
      });
    }

    return achievements;
  }

  private determineActivityPattern(metrics: ActivityMetrics): string {
    const { morning, afternoon, evening, night } = metrics.periodActivity;
    if (night > 30) return 'Night Owl';
    if (morning > 40) return 'Early Bird';
    if (afternoon > 40) return 'Midday Maven';
    if (evening > 40) return 'Evening Person';
    return 'Balanced Schedule';
  }

  private determineCommunicationStyle(metrics: CommunicationMetrics): string {
    if (metrics.emojiUsage.frequency > 0.4) return 'Expressive';
    if (metrics.averageMessageLength > 100) return 'Detailed';
    if (metrics.messageVariability > 50) return 'Variable';
    return 'Concise';
  }

  private determineGroupRole(metrics: InteractionMetrics): string {
    if (metrics.initiationRate > 0.3) return 'Leader';
    if (metrics.responseRate > 0.8) return 'Supporter';
    if (metrics.conversationImpact > 70) return 'Influencer';
    return 'Contributor';
  }
}