"use client"

import { useEffect } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { supabase } from "@/lib/supabase"
import { setUser, setLoading } from "@/store/slices/authSlice"
import { logger } from "@/lib/logger"

// Layouts
import AppLayout from "@/components/layout/AppLayout"
import AuthLayout from "@/components/layout/AuthLayout"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

// Pages
import LandingPage from "@/pages/LandingPage"
import SignInPage from "@/pages/auth/SignInPage"
import SignUpPage from "@/pages/auth/SignUpPage"
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage"
import UpdatePasswordPage from "@/pages/auth/UpdatePasswordPage"
import DashboardPage from "@/pages/DashboardPage"
import ChatPage from "@/pages/ChatPage"
import ProfilePage from "@/pages/ProfilePage"
import SubscriptionsPage from "@/pages/SubscriptionsPage"
import NotFoundPage from "@/pages/NotFoundPage"

export default function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    // Set initial loading state
    dispatch(setLoading(true))

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      logger.info("Initial session check", { hasSession: !!session })
      dispatch(setUser(session?.user || null))
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      logger.info("Auth state changed", { event })
      dispatch(setUser(session?.user || null))
    })

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [dispatch])

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/update-password" element={<UpdatePasswordPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:id" element={<ChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
        </Route>
      </Route>

      {/* Redirect /app to /dashboard */}
      <Route path="/app" element={<Navigate to="/dashboard" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
