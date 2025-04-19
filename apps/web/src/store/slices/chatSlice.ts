import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import {
  getChatSessions,
  getChatSession,
  createChatSession,
  sendMessage,
  updateChatTitle,
  deleteChatSession,
} from "@/api/chat"
import { logger } from "@/lib/logger"
import type { ChatState, SendMessageRequest, CreateChatSessionRequest, UpdateChatTitleRequest } from "types"

const initialState: ChatState = {
  sessions: [],
  activeSessionId: null,
  isLoading: false,
  error: null,
}

export const fetchChatSessions = createAsyncThunk("chat/fetchSessions", async () => {
  return await getChatSessions()
})

export const fetchChatSession = createAsyncThunk("chat/fetchSession", async (chatId: string) => {
  return await getChatSession(chatId)
})

export const createNewChatSession = createAsyncThunk("chat/createSession", async (data: CreateChatSessionRequest) => {
  return await createChatSession(data)
})

export const updateChatSessionTitle = createAsyncThunk("chat/updateTitle", async (data: UpdateChatTitleRequest) => {
  await updateChatTitle(data)
  return data
})

export const deleteChatSessionById = createAsyncThunk("chat/deleteSession", async (chatId: string) => {
  await deleteChatSession(chatId)
  return chatId
})

export const sendChatMessage = createAsyncThunk(
  "chat/sendMessage",
  async (data: SendMessageRequest, { rejectWithValue }) => {
    try {
      const messages = await sendMessage(data)
      return { chatId: data.chatId, messages }
    } catch (error: any) {
      logger.error("Send message failed", { error })
      return rejectWithValue(error.message || "Failed to send message")
    }
  },
)

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveSession: (state, action) => {
      state.activeSessionId = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sessions
      .addCase(fetchChatSessions.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchChatSessions.fulfilled, (state, action) => {
        state.isLoading = false
        state.sessions = action.payload
      })
      .addCase(fetchChatSessions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed to fetch chat sessions"
      })
      // Fetch session
      .addCase(fetchChatSession.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchChatSession.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.sessions.findIndex((s) => s.id === action.payload.id)
        if (index !== -1) {
          state.sessions[index] = action.payload
        } else {
          state.sessions.push(action.payload)
        }
        state.activeSessionId = action.payload.id
      })
      .addCase(fetchChatSession.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed to fetch chat session"
      })
      // Create session
      .addCase(createNewChatSession.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createNewChatSession.fulfilled, (state, action) => {
        state.isLoading = false
        state.sessions.unshift(action.payload)
        state.activeSessionId = action.payload.id
      })
      .addCase(createNewChatSession.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed to create chat session"
      })
      // Update title
      .addCase(updateChatSessionTitle.fulfilled, (state, action) => {
        const { chatId, title } = action.payload
        const session = state.sessions.find((s) => s.id === chatId)
        if (session) {
          session.title = title
        }
      })
      // Delete session
      .addCase(deleteChatSessionById.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter((s) => s.id !== action.payload)
        if (state.activeSessionId === action.payload) {
          state.activeSessionId = state.sessions[0]?.id || null
        }
      })
      // Send message
      .addCase(sendChatMessage.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isLoading = false
        const { chatId, messages } = action.payload
        const session = state.sessions.find((s) => s.id === chatId)
        if (session) {
          session.messages = [...session.messages, ...messages]
          // Move this session to the top of the list
          state.sessions = [session, ...state.sessions.filter((s) => s.id !== chatId)]
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})
