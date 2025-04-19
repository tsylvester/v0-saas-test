import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/logger"
import { generateText } from "@/lib/ai"
import type {
  ChatSession,
  ChatMessage,
  SendMessageRequest,
  CreateChatSessionRequest,
  UpdateChatTitleRequest,
} from "types"

/**
 * Get all chat sessions for the current user
 */
export async function getChatSessions(): Promise<ChatSession[]> {
  logger.info("Getting chat sessions")

  try {
    const { data, error } = await supabase.from("chat_sessions").select("*").order("created_at", { ascending: false })

    if (error) {
      logger.error("Get chat sessions error", { error })
      throw error
    }

    logger.info("Chat sessions retrieved successfully", { count: data.length })
    return data.map((session) => ({
      id: session.id,
      title: session.title,
      messages: [],
      createdAt: session.created_at,
      updatedAt: session.updated_at,
    }))
  } catch (error) {
    logger.error("Get chat sessions error", { error })
    throw error
  }
}

/**
 * Get a chat session by ID
 */
export async function getChatSession(chatId: string): Promise<ChatSession> {
  logger.info("Getting chat session", { chatId })

  try {
    // Get the chat session
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("id", chatId)
      .single()

    if (sessionError) {
      logger.error("Get chat session error", { error: sessionError })
      throw sessionError
    }

    // Get the chat messages
    const { data: messages, error: messagesError } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })

    if (messagesError) {
      logger.error("Get chat messages error", { error: messagesError })
      throw messagesError
    }

    logger.info("Chat session retrieved successfully", { messageCount: messages.length })
    return {
      id: session.id,
      title: session.title,
      messages: messages.map((message) => ({
        id: message.id,
        content: message.content,
        role: message.role as "user" | "assistant" | "system",
        timestamp: message.created_at,
      })),
      createdAt: session.created_at,
      updatedAt: session.updated_at,
    }
  } catch (error) {
    logger.error("Get chat session error", { error })
    throw error
  }
}

/**
 * Create a new chat session
 */
export async function createChatSession({ title }: CreateChatSessionRequest): Promise<ChatSession> {
  logger.info("Creating chat session", { title })

  try {
    const { data, error } = await supabase.from("chat_sessions").insert({ title }).select().single()

    if (error) {
      logger.error("Create chat session error", { error })
      throw error
    }

    logger.info("Chat session created successfully", { chatId: data.id })
    return {
      id: data.id,
      title: data.title,
      messages: [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    logger.error("Create chat session error", { error })
    throw error
  }
}

/**
 * Update a chat session title
 */
export async function updateChatTitle({ chatId, title }: UpdateChatTitleRequest): Promise<void> {
  logger.info("Updating chat title", { chatId, title })

  try {
    const { error } = await supabase
      .from("chat_sessions")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", chatId)

    if (error) {
      logger.error("Update chat title error", { error })
      throw error
    }

    logger.info("Chat title updated successfully")
  } catch (error) {
    logger.error("Update chat title error", { error })
    throw error
  }
}

/**
 * Delete a chat session
 */
export async function deleteChatSession(chatId: string): Promise<void> {
  logger.info("Deleting chat session", { chatId })

  try {
    const { error } = await supabase.from("chat_sessions").delete().eq("id", chatId)

    if (error) {
      logger.error("Delete chat session error", { error })
      throw error
    }

    logger.info("Chat session deleted successfully")
  } catch (error) {
    logger.error("Delete chat session error", { error })
    throw error
  }
}

/**
 * Send a message in a chat session
 */
export async function sendMessage({ chatId, message }: SendMessageRequest): Promise<ChatMessage[]> {
  logger.info("Sending message", { chatId, messageLength: message.length })

  try {
    // Get previous messages for context
    const { data: previousMessages, error: previousMessagesError } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })
      .limit(10)

    if (previousMessagesError) {
      logger.error("Get previous messages error", { error: previousMessagesError })
      throw previousMessagesError
    }

    // Insert the user message
    const { data: userMessage, error: userMessageError } = await supabase
      .from("chat_messages")
      .insert({
        chat_id: chatId,
        content: message,
        role: "user",
      })
      .select()
      .single()

    if (userMessageError) {
      logger.error("Insert user message error", { error: userMessageError })
      throw userMessageError
    }

    // Update the chat session's updated_at timestamp
    await supabase.from("chat_sessions").update({ updated_at: new Date().toISOString() }).eq("id", chatId)

    // Generate AI response
    const context = previousMessages.map((msg) => `${msg.role}: ${msg.content}`).join("\n")

    const aiResponse = await generateText(message, context)

    // Insert the AI response
    const { data: assistantMessage, error: assistantMessageError } = await supabase
      .from("chat_messages")
      .insert({
        chat_id: chatId,
        content: aiResponse,
        role: "assistant",
      })
      .select()
      .single()

    if (assistantMessageError) {
      logger.error("Insert assistant message error", { error: assistantMessageError })
      throw assistantMessageError
    }

    logger.info("Message sent and response received successfully")
    return [
      {
        id: userMessage.id,
        content: userMessage.content,
        role: "user",
        timestamp: userMessage.created_at,
      },
      {
        id: assistantMessage.id,
        content: assistantMessage.content,
        role: "assistant",
        timestamp: assistantMessage.created_at,
      },
    ]
  } catch (error) {
    logger.error("Send message error", { error })
    throw error
  }
}
