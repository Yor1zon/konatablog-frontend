"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { ApiClient, type User } from "@/lib/api"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const hasToken = ApiClient.isAuthenticated()
    setIsAuthenticated(hasToken)

    if (!hasToken) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const response = await ApiClient.getProfile()
      if (response.success && response.data) {
        setUser(response.data)
      } else {
        const errorCode = response.error?.code
        if (errorCode === "401" || errorCode === "UNAUTHORIZED" || errorCode === "INVALID_TOKEN") {
          const validation = await ApiClient.validateToken()
          const tokenStillValid = validation.success && validation.data === true
          if (!tokenStillValid) {
            await ApiClient.logout()
            setUser(null)
            setIsAuthenticated(false)
          }
        }
      }
    } catch (error) {
      console.error("[v0] Failed to fetch user profile:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "auth_token") return
      setIsLoading(true)
      refreshUser()
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [refreshUser])

  useEffect(() => {
    const handleTokenEvent = () => {
      setIsLoading(true)
      refreshUser()
    }

    window.addEventListener("konatablog:auth_token_changed", handleTokenEvent)
    return () => window.removeEventListener("konatablog:auth_token_changed", handleTokenEvent)
  }, [refreshUser])

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await ApiClient.login(username, password)
      if (response.success && response.data) {
        setUser(response.data.user)
        setIsAuthenticated(true)
      } else {
        throw new Error(response.error?.message || "Login failed")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await ApiClient.logout()
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
