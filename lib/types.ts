export interface ISSPosition {
  latitude: number
  longitude: number
  timestamp: Date
}

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

