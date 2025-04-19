export interface ChatMessage {
  id: string
  content: string
  role: "user" | "assistant" | "system"
  timestamp: string
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface ChatState {
  sessions: ChatSession[]
  activeSessionId: string | null
  isLoading: boolean
  error: string | null
}

export interface SendMessageRequest {
  chatId: string
  message: string
}

export interface SendMessageResponse {
  message: ChatMessage
}

export interface CreateChatSessionRequest {
  title: string
}

export interface UpdateChatTitleRequest {
  chatId: string
  title: string
}
