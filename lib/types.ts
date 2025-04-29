export interface ISSPosition {
  latitude: number;
  longitude: number;
  altitude: number;
}

export interface Fact {
  fact: string
  region: string
  source: string
}


export interface LocationFact {
  id: string;
  fact: string;
  location: string; // Ensure location is included
  region?: string;
  source?: string;
}

export type ChatMessage = {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};





