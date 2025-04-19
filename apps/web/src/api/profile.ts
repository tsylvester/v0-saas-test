import { supabase } from "@/lib/supabase"
import { logger } from "@/lib/logger"
import type { Profile, UpdateProfileRequest } from "types"

/**
 * Get the current user's profile
 */
export async function getProfile(): Promise<Profile> {
  logger.info("Getting user profile")

  try {
    const { data: user } = await supabase.auth.getUser()

    if (!user.user) {
      throw new Error("User not found")
    }

    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.user.id).single()

    if (error) {
      logger.error("Get profile error", { error })
      throw error
    }

    logger.info("Profile retrieved successfully")
    return data as Profile
  } catch (error) {
    logger.error("Get profile error", { error })
    throw error
  }
}

/**
 * Update the current user's profile
 */
export async function updateProfile({ full_name, username }: UpdateProfileRequest): Promise<Profile> {
  logger.info("Updating user profile")

  try {
    const { data: user } = await supabase.auth.getUser()

    if (!user.user) {
      throw new Error("User not found")
    }

    // Update auth metadata
    if (full_name) {
      await supabase.auth.updateUser({
        data: { full_name },
      })
    }

    // Update profile
    const updates = {
      ...(full_name && { full_name }),
      ...(username && { username }),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("profiles").update(updates).eq("id", user.user.id).select().single()

    if (error) {
      logger.error("Update profile error", { error })
      throw error
    }

    logger.info("Profile updated successfully")
    return data as Profile
  } catch (error) {
    logger.error("Update profile error", { error })
    throw error
  }
}

/**
 * Upload a profile avatar
 */
export async function uploadAvatar(file: File): Promise<string> {
  logger.info("Uploading avatar")

  try {
    const { data: user } = await supabase.auth.getUser()

    if (!user.user) {
      throw new Error("User not found")
    }

    const fileExt = file.name.split(".").pop()
    const filePath = `avatars/${user.user.id}-${Date.now()}.${fileExt}`

    // Upload the file
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

    if (uploadError) {
      logger.error("Avatar upload error", { error: uploadError })
      throw uploadError
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath)

    const avatarUrl = urlData.publicUrl

    // Update the user's avatar URL
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl },
    })

    if (updateError) {
      logger.error("Avatar update error", { error: updateError })
      throw updateError
    }

    // Update the profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.user.id)

    if (profileError) {
      logger.error("Profile update error", { error: profileError })
      throw profileError
    }

    logger.info("Avatar uploaded successfully")
    return avatarUrl
  } catch (error) {
    logger.error("Avatar upload error", { error })
    throw error
  }
}
