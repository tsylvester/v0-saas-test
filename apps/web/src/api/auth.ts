import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/logger"
import type { SignInCredentials, SignUpCredentials, ResetPasswordRequest, UpdatePasswordRequest } from "types"

/**
 * Sign up a new user
 */
export async function signUp({ email, password, full_name }: SignUpCredentials) {
  logger.info("Signing up user", { email })

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
        },
      },
    })

    if (error) {
      logger.error("Sign up error", { error })
      throw error
    }

    logger.info("User signed up successfully")
    return data
  } catch (error) {
    logger.error("Sign up error", { error })
    throw error
  }
}

/**
 * Sign in a user
 */
export async function signIn({ email, password }: SignInCredentials) {
  logger.info("Signing in user", { email })

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      logger.error("Sign in error", { error })
      throw error
    }

    logger.info("User signed in successfully")
    return data
  } catch (error) {
    logger.error("Sign in error", { error })
    throw error
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  logger.info("Signing out user")

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      logger.error("Sign out error", { error })
      throw error
    }

    logger.info("User signed out successfully")
  } catch (error) {
    logger.error("Sign out error", { error })
    throw error
  }
}

/**
 * Reset a user's password
 */
export async function resetPassword({ email }: ResetPasswordRequest) {
  logger.info("Requesting password reset", { email })

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      logger.error("Password reset request error", { error })
      throw error
    }

    logger.info("Password reset email sent successfully")
  } catch (error) {
    logger.error("Password reset request error", { error })
    throw error
  }
}

/**
 * Update a user's password
 */
export async function updatePassword({ password }: UpdatePasswordRequest) {
  logger.info("Updating user password")

  try {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      logger.error("Password update error", { error })
      throw error
    }

    logger.info("Password updated successfully")
  } catch (error) {
    logger.error("Password update error", { error })
    throw error
  }
}

/**
 * Get the current session
 */
export async function getSession() {
  logger.info("Getting current session")

  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      logger.error("Get session error", { error })
      throw error
    }

    return data.session
  } catch (error) {
    logger.error("Get session error", { error })
    throw error
  }
}

/**
 * Get the current user
 */
export async function getUser() {
  logger.info("Getting current user")

  try {
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      logger.error("Get user error", { error })
      throw error
    }

    return data.user
  } catch (error) {
    logger.error("Get user error", { error })
    throw error
  }
}
