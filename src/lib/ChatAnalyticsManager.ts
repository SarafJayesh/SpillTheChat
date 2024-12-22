
import { 
    AnalyticsData, 
    AnalyticsProcessor, 
    ParsedMessage, 
    ProcessedResult 
  } from '../types/chat';
  
  export class ChatAnalyticsManager {
    private processors: Map<string, AnalyticsProcessor>;
    private data: AnalyticsData;
    private results: Map<string, ProcessedResult>;
    private processingOrder: string[];
  
    constructor() {
      this.processors = new Map();
      this.results = new Map();
      this.processingOrder = [];
      this.data = this.initializeData();
    }
  
    private initializeData(): AnalyticsData {
      return {
        messages: [],
        participants: new Map(),
        timeframes: {
          hourly: new Map(),
          daily: new Map(),
          weekly: new Map(),
          monthly: new Map()
        },
        interactions: {
          threads: [],
          responseTimes: new Map(),
          mentions: new Map(),
          interactions: new Map()
        }
      };
    }
  
    registerProcessor(processor: AnalyticsProcessor): void {
      this.processors.set(processor.type, processor);
      this.updateProcessingOrder();
    }
  
    private updateProcessingOrder(): void {
      // Create dependency graph and sort processors
      const graph = new Map<string, string[]>();
      this.processors.forEach(processor => {
        graph.set(processor.type, processor.dependencies);
      });
  
      // Topological sort based on dependencies
      this.processingOrder = this.topologicalSort(graph);
    }
  
    private topologicalSort(graph: Map<string, string[]>): string[] {
      const result: string[] = [];
      const visited = new Set<string>();
      const temp = new Set<string>();
  
      const visit = (node: string) => {
        if (temp.has(node)) {
          throw new Error('Circular dependency detected');
        }
        if (!visited.has(node)) {
          temp.add(node);
          const deps = graph.get(node) || [];
          deps.forEach(dep => visit(dep));
          temp.delete(node);
          visited.add(node);
          result.unshift(node);
        }
      };
  
      graph.forEach((_, node) => {
        if (!visited.has(node)) {
          visit(node);
        }
      });
  
      return result;
    }
  
    async processChat(rawChat: string): Promise<Map<string, ProcessedResult>> {
      console.log('Starting chat processing');
      this.data = await this.parseChat(rawChat);
      console.log('Parsed chat data:', this.data);
      
      for (const processorType of this.processingOrder) {
        console.log(`Running processor: ${processorType}`);
        const processor = this.processors.get(processorType);
        if (processor) {
          try {
            const result = await processor.process(this.data);
            console.log(`Processor ${processorType} result:`, result);
            this.results.set(processorType, result);
          } catch (error) {
            console.error(`Error in processor ${processorType}:`, error);
          }
        }
      }
    
      return this.results;
    }
  
    private async parseChat(rawChat: string): Promise<AnalyticsData> {
      const lines = rawChat.split('\n');
      const data = this.initializeData();
      
      for (const line of lines) {
        const message = this.parseMessage(line);
        if (message) {
          data.messages.push(message);
          this.updateParticipantData(data, message);
          this.updateTimeframes(data, message);
          this.updateInteractions(data, message);
        }
      }
  
      return data;
    }
  
    private parseMessage(line: string): ParsedMessage | null {
      const match = line.match(/^(\d{2}\/\d{2}\/\d{2}),\s(\d{2}:\d{2})\s-\s([^:]+):\s(.+)$/);
      
      if (match) {
        const [_, date, time, sender, content] = match;
        return {
          timestamp: new Date(`20${date.split('/').reverse().join('-')}T${time}`),
          sender: sender.trim(),
          content: content.trim(),
          type: content.includes('<Media omitted>') ? 'media' : 'text',
          metadata: {
            hasEmoji: /[\u{1F300}-\u{1F9FF}]/u.test(content),
            isForwarded: content.includes('Forwarded'),
          }
        };
      }
      return null;
    }
  
    private updateParticipantData(data: AnalyticsData, message: ParsedMessage): void {
      const participant = data.participants.get(message.sender) || {
        id: message.sender,
        name: message.sender,
        messages: [],
        messageCount: 0,
        firstMessage: message.timestamp,
        lastMessage: message.timestamp,
        activeHours: new Set(),
        activeDays: new Set()
      };
  
      participant.messages.push(message);
      participant.messageCount++;
      participant.lastMessage = message.timestamp;
      participant.activeHours.add(message.timestamp.getHours());
      participant.activeDays.add(message.timestamp.toISOString().split('T')[0]);
  
      data.participants.set(message.sender, participant);
    }
  
    private updateTimeframes(data: AnalyticsData, message: ParsedMessage): void {
      const hour = message.timestamp.getHours();
      const day = message.timestamp.toISOString().split('T')[0];
      const month = day.substring(0, 7);
      const week = this.getWeekNumber(message.timestamp);
  
      this.incrementMapCount(data.timeframes.hourly, hour);
      this.incrementMapCount(data.timeframes.daily, day);
      this.incrementMapCount(data.timeframes.weekly, week);
      this.incrementMapCount(data.timeframes.monthly, month);
    }
  
    private updateInteractions(data: AnalyticsData, message: ParsedMessage): void {
      // Update interactions map
      const interactions = data.interactions.interactions.get(message.sender) || new Set();
      
      // Look for mentions in message
      const mentions = message.content.match(/@[\w\s]+/g) || [];
      mentions.forEach(mention => {
        const mentionedUser = mention.slice(1).trim();
        interactions.add(mentionedUser);
        
        const userMentions = data.interactions.mentions.get(message.sender) || [];
        userMentions.push(mentionedUser);
        data.interactions.mentions.set(message.sender, userMentions);
      });
  
      data.interactions.interactions.set(message.sender, interactions);
    }
  
    private incrementMapCount(map: Map<any, number>, key: any): void {
      map.set(key, (map.get(key) || 0) + 1);
    }
  
    private getWeekNumber(date: Date): number {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
      return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    }
  
    getResults(): Map<string, ProcessedResult> {
      return this.results;
    }
  
    getData(): AnalyticsData {
      return this.data;
    }
  }