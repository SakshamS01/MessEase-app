"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

interface UserData {
  uid: string
  email: string
  role: "student" | "admin"
  name: string
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    // Add a small delay to ensure Firebase is fully initialized
    const initAuth = async () => {
      try {
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            setUser(user)
            try {
              // Fetch user data from Firestore
              const userDoc = await getDoc(doc(db, "users", user.uid))
              if (userDoc.exists()) {
                setUserData(userDoc.data() as UserData)
              }
            } catch (error) {
              console.error("Error fetching user data:", error)
            }
          } else {
            setUser(null)
            setUserData(null)
          }
          setLoading(false)
        })
      } catch (error) {
        console.error("Error initializing auth:", error)
        setLoading(false)
      }
    }

    initAuth()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  return <AuthContext.Provider value={{ user, userData, loading }}>{children}</AuthContext.Provider>
}
