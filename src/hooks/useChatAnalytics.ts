// hooks/useChatAnalytics.ts

import { useState, useEffect } from 'react';
import { ChatAnalyticsManager } from '../lib/ChatAnalyticsManager';
import { PersonalityProcessor } from '../processors/PersonalityProcessor';
import { 
  ProcessedResult, 
  PersonalityProcessedResult,
  BasicStatsProcessedResult,
  PersonalityProfile
} from '../types/chat';

type ResultsMap = Map<string, ProcessedResult>;

export function useChatAnalytics(chatContent: string | null) {
  const [results, setResults] = useState<ResultsMap>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!chatContent) return;

    const analyzeChat = async () => {
      setLoading(true);
      setError(null);

      try {
        const manager = new ChatAnalyticsManager();
        
        // Register processors
        manager.registerProcessor(new PersonalityProcessor());
        
        // Process chat
        const results = await manager.processChat(chatContent);
        setResults(results);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Analysis failed'));
      } finally {
        setLoading(false);
      }
    };

    analyzeChat();
  }, [chatContent]);

  return {
    results,
    loading,
    error,
    // Helper functions with proper typing
    getPersonalityProfiles: () => 
      (results.get('personality') as PersonalityProcessedResult)?.data,
    getBasicStats: () => 
      (results.get('basic') as BasicStatsProcessedResult)?.data,
  };
}