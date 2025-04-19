export interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    username?: string
    avatar_url?: string
  }
  app_metadata?: {
    provider?: string
    [key: string]: any
  }
  created_at: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

export interface SignUpCredentials {
  email: string
  password: string
  full_name?: string
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface ResetPasswordRequest {
  email: string
}

export interface UpdatePasswordRequest {
  password: string
}
