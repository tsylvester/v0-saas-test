import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { signIn, signUp, signOut, getUser } from "@/api/auth"
import { logger } from "@/lib/logger"
import type { AuthState, SignInCredentials, SignUpCredentials } from "types"

const initialState: AuthState = {
  user: null,
  isLoading: true,
  error: null,
}

export const initializeAuth = createAsyncThunk("auth/initialize", async () => {
  try {
    const user = await getUser()
    return user
  } catch (error) {
    logger.error("Failed to initialize auth", { error })
    return null
  }
})

export const loginUser = createAsyncThunk("auth/login", async (credentials: SignInCredentials, { rejectWithValue }) => {
  try {
    const data = await signIn(credentials)
    return data.user
  } catch (error: any) {
    logger.error("Login failed", { error })
    return rejectWithValue(error.message || "Failed to login")
  }
})

export const registerUser = createAsyncThunk(
  "auth/register",
  async (credentials: SignUpCredentials, { rejectWithValue }) => {
    try {
      const data = await signUp(credentials)
      return data.user
    } catch (error: any) {
      logger.error("Registration failed", { error })
      return rejectWithValue(error.message || "Failed to register")
    }
  },
)

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await signOut()
  return null
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.isLoading = false
    },
    clearUser: (state) => {
      state.user = null
      state.isLoading = false
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || "Failed to initialize auth"
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.isLoading = false
      })
  },
})

export const { setUser, clearUser, clearError } = authSlice.actions
export default authSlice.reducer
