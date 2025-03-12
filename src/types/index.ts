export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  modelId?: string
}

export interface ModelConfig {
  id: string
  name: string
  baseUrl: string
  apiKey: string
  enabled: boolean
}

export interface ModelResponse {
  modelId: string
  content: string
  error?: string
  latency?: number
  tokens?: {
    prompt: number
    completion: number
    total: number
  }
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
} 