"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useDispatch } from "react-redux"
import { supabase } from "@/lib/supabase"
import { setUser, setLoading } from "@/store/slices/authSlice"
import type { User } from "@supabase/supabase-js"
import { logger } from "@/lib/logger"

interface AuthContextType {
  user: User | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
})

export const useAuth = () => useContext(AuthContext)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          logger.error('Error fetching user', { error: error.message });
          dispatch(setUser(null));
          setUserState(null);
        } else {
          dispatch(setUser(data.user));
          setUserState(data.user);
        }
      } catch (error) {
        logger.error('Unexpected error fetching user', { error });
        dispatch(setUser(null));
        setUserState(null);
      } finally {
        dispatch(setLoading(false));
        setIsLoading(false);
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      logger.info('Auth state changed', { event });
      
      if\
