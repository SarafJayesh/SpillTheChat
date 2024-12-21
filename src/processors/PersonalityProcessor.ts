// processors/PersonalityProcessor.ts

import { 
  AnalyticsProcessor, 
  AnalyticsData, 
  ProcessedResult,
  ParticipantData 
} from '../types/chat';

interface PersonalityProfile {
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

export class PersonalityProcessor implements AnalyticsProcessor {
  type = 'personality';
  dependencies = ['basic'];  // Requires basic stats processor first

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
    const activityPattern = this.determineActivityPattern(participant);
    const communicationStyle = this.analyzeCommunicationStyle(participant);
    const metrics = this.calculateMetrics(participant, data);
    const specialAbilities = this.detectSpecialAbilities(participant, data);

    return {
      archetype: {
        primary: this.determinePrimaryArchetype(activityPattern, communicationStyle, metrics),
        secondary: this.determineSecondaryArchetypes(participant, data)
      },
      traits: {
        activityPattern,
        communicationStyle,
        groupRole: this.determineGroupRole(participant, data)
      },
      metrics,
      specialAbilities
    };
  }

  private determineActivityPattern(participant: ParticipantData): string {
    const hourCounts = new Array(24).fill(0);
    participant.messages.forEach(msg => {
      hourCounts[msg.timestamp.getHours()]++;
    });

    const nightActivity = hourCounts.slice(22).concat(hourCounts.slice(0, 4))
      .reduce((a, b) => a + b, 0);
    const morningActivity = hourCounts.slice(5, 11)
      .reduce((a, b) => a + b, 0);
    const dayActivity = hourCounts.slice(11, 18)
      .reduce((a, b) => a + b, 0);
    const eveningActivity = hourCounts.slice(18, 22)
      .reduce((a, b) => a + b, 0);

    const total = participant.messageCount;
    const nightPercentage = (nightActivity / total) * 100;
    const morningPercentage = (morningActivity / total) * 100;

    if (nightPercentage > 20) return 'Night Owl';
    if (morningPercentage > 15) return 'Early Bird';
    if (dayActivity > eveningActivity) return 'Day Hawk';
    return 'Evening Person';
  }

  private analyzeCommunicationStyle(participant: ParticipantData): string {
    const messageLengths = participant.messages.map(m => m.content.length);
    const avgLength = messageLengths.reduce((a, b) => a + b, 0) / messageLengths.length;
    const emojiCount = participant.messages.filter(m => m.metadata.hasEmoji).length;
    const emojiPercentage = (emojiCount / participant.messageCount) * 100;

    if (avgLength > 100) return 'Detailed Communicator';
    if (emojiPercentage > 30) return 'Expressive Communicator';
    if (avgLength < 20) return 'Concise Communicator';
    return 'Balanced Communicator';
  }

  private calculateMetrics(participant: ParticipantData, data: AnalyticsData): {
    responseTime: number;
    messageLength: number;
    activityConsistency: number;
    socialConnection: number;
  } {
    // Calculate average response time
    const responseTimes = data.interactions.responseTimes.get(participant.id) || [];
    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    // Calculate message length metrics
    const messageLengths = participant.messages.map(m => m.content.length);
    const avgMessageLength = messageLengths.reduce((a, b) => a + b, 0) / messageLengths.length;

    // Calculate activity consistency
    const daysActive = participant.activeDays.size;
    const totalDays = Math.ceil(
      (participant.lastMessage.getTime() - participant.firstMessage.getTime()) / (1000 * 60 * 60 * 24)
    );
    const activityConsistency = (daysActive / totalDays) * 100;

    // Calculate social connection score
    const interactions = data.interactions.interactions.get(participant.id) || new Set();
    const totalParticipants = data.participants.size;
    const socialConnection = (interactions.size / (totalParticipants - 1)) * 100;

    return {
      responseTime: avgResponseTime,
      messageLength: avgMessageLength,
      activityConsistency,
      socialConnection
    };
  }

  private detectSpecialAbilities(participant: ParticipantData, data: AnalyticsData): string[] {
    const abilities: string[] = [];
    const metrics = this.calculateMetrics(participant, data);

    // Conversation Starter
    const threadStarts = data.interactions.threads.filter(
      thread => thread.startMessage.sender === participant.id
    ).length;
    if (threadStarts / participant.messageCount > 0.25) {
      abilities.push('Conversation Starter');
    }

    // Quick Responder
    if (metrics.responseTime < 120) { // Less than 2 minutes average
      abilities.push('Quick Responder');
    }

    // Consistent Contributor
    if (metrics.activityConsistency > 70) {
      abilities.push('Consistent Contributor');
    }

    // Social Connector
    if (metrics.socialConnection > 80) {
      abilities.push('Social Connector');
    }

    // Night Warrior
    const nightMessages = participant.messages.filter(msg => {
      const hour = msg.timestamp.getHours();
      return hour >= 22 || hour <= 4;
    }).length;
    if ((nightMessages / participant.messageCount) > 0.3) {
      abilities.push('Night Warrior');
    }

    return abilities;
  }

  private determinePrimaryArchetype(
    activityPattern: string,
    communicationStyle: string,
    metrics: any
  ): string {
    // Combine different factors to determine primary archetype
    const archetypes = new Map<string, number>();
    
    // Activity-based archetypes
    archetypes.set('Night Owl', 
      activityPattern === 'Night Owl' ? 100 : 0);
    archetypes.set('Early Bird', 
      activityPattern === 'Early Bird' ? 100 : 0);
    
    // Communication-based archetypes
    archetypes.set('Social Butterfly', 
      metrics.socialConnection > 80 ? 90 : 
      metrics.socialConnection > 60 ? 70 : 0);
    archetypes.set('Deep Thinker', 
      metrics.messageLength > 100 ? 90 :
      metrics.messageLength > 70 ? 70 : 0);
    
    // Return the archetype with highest score
    return Array.from(archetypes.entries())
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  private determineSecondaryArchetypes(
    participant: ParticipantData,
    data: AnalyticsData
  ): string[] {
    const archetypes: string[] = [];
    const metrics = this.calculateMetrics(participant, data);

    // Check for secondary characteristics
    if (metrics.responseTime < 180) {
      archetypes.push('Quick Responder');
    }
    
    if (participant.messages.filter(m => m.metadata.hasEmoji).length 
        / participant.messageCount > 0.25) {
      archetypes.push('Emoji Enthusiast');
    }
    
    const threadStarts = data.interactions.threads
      .filter(thread => thread.startMessage.sender === participant.id).length;
    if (threadStarts / data.interactions.threads.length > 0.2) {
      archetypes.push('Conversation Starter');
    }

    return archetypes;
  }

  private determineGroupRole(
    participant: ParticipantData,
    data: AnalyticsData
  ): string {
    const metrics = this.calculateMetrics(participant, data);
    const threadStarts = data.interactions.threads
      .filter(thread => thread.startMessage.sender === participant.id).length;
    
    if (threadStarts / data.interactions.threads.length > 0.3) {
      return 'Leader';
    }
    
    if (metrics.socialConnection > 80) {
      return 'Connector';
    }
    
    if (metrics.responseTime < 120) {
      return 'Responder';
    }
    
    if (metrics.messageLength > 100) {
      return 'Contributor';
    }
    
    return 'Supporter';
  }

  async update(newData: AnalyticsData): Promise<ProcessedResult> {
    return await this.process(newData);
  }
}