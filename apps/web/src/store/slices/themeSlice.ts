import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

type ThemeMode = "light" | "dark" | "system"

interface ThemeState {
  mode: ThemeMode
}

// Get initial theme from localStorage or default to system
const getInitialTheme = (): ThemeMode => {
  if (typeof window !== "undefined") {
    const savedTheme = localStorage.getItem("theme") as ThemeMode
    return savedTheme || "system"
  }
  return "system"
}

const initialState: ThemeState = {
  mode: getInitialTheme(),
}

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", action.payload)
      }
    },
  },
})

export const { setTheme } = themeSlice.actions

export default themeSlice.reducer
