// hooks/useChatAnalytics.ts

import { useState, useEffect } from 'react';
import { ChatAnalyticsManager } from '../lib/ChatAnalyticsManager';
import { PersonalityProcessor } from '../processors/PersonalityProcessor';
import { BasicStatsProcessor } from '../processors/BasicStatsProcessor';
import { ProcessedResult, ChatStats } from '../types/chat';
import { PersonalityProfile } from '../types/personality';

interface AnalyticsResults {
  results: Map<string, ProcessedResult>;
  loading: boolean;
  error: Error | null;
}

interface TypedResults extends Omit<AnalyticsResults, 'results'> {
  results: Map<string, {
    type: string;
    timestamp: Date;
    data: ChatStats | Map<string, PersonalityProfile>;
  }>;
}

export function useChatAnalytics(chatContent: string): TypedResults {
  const [results, setResults] = useState<Map<string, ProcessedResult>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const analyzeChat = async () => {
      try {
        setLoading(true);
        setError(null);

        const manager = new ChatAnalyticsManager();
        manager.registerProcessor(new BasicStatsProcessor());
        manager.registerProcessor(new PersonalityProcessor());

        const processedResults = await manager.processChat(chatContent);
        
        // Validate and type the results
        const validatedResults = new Map<string, ProcessedResult>();
        
        processedResults.forEach((result, key) => {
          if (key === 'personality') {
            // Ensure personality data matches our PersonalityProfile type
            const profileData = result.data as Map<string, PersonalityProfile>;
            validatedResults.set(key, {
              ...result,
              data: profileData
            });
          } else if (key === 'basic') {
            // Ensure basic stats match our ChatStats type
            const statsData = result.data as ChatStats;
            validatedResults.set(key, {
              ...result,
              data: statsData
            });
          }
        });

        setResults(validatedResults);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to analyze chat'));
      } finally {
        setLoading(false);
      }
    };

    if (chatContent) {
      analyzeChat();
    }
  }, [chatContent]);

  return { results, loading, error };
}