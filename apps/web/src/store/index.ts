import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import chatReducer from "./slices/chatSlice"
import profileReducer from "./slices/profileSlice"
import subscriptionReducer from "./slices/subscriptionSlice"
import { logger } from "@/lib/logger"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    profile: profileReducer,
    subscription: subscriptionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["auth/setUser"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["payload.user"],
        // Ignore these paths in the state
        ignoredPaths: ["auth.user"],
      },
    }),
  devTools: import.meta.env.MODE !== "production",
})

// Log state changes in development
if (import.meta.env.MODE === "development") {
  store.subscribe(() => {
    logger.debug("Redux state updated", store.getState())
  })
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
