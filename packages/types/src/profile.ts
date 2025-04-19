export interface Profile {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
  website?: string
  created_at: string
  updated_at: string
}

export interface UpdateProfileRequest {
  full_name?: string
  username?: string
}

export interface UpdateEmailRequest {
  email: string
}

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
}
