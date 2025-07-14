"use client"

import type React from "react"
import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChefHat } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { LoadingSpinner } from "@/components/loading-spinner"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"


export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // Redirect if already logged in
  if (authLoading) {
    return <LoadingSpinner />
  }

  if (user) {
    router.push("/")
    return <LoadingSpinner />
  }

  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setLoading(true)
  //   setError("")

  //   try {
  //     await signInWithEmailAndPassword(auth, email, password)
  //     router.push("/")
  //   } catch (error: any) {
  //     console.error("Login error:", error)
  //     setError(error.message || "Failed to sign in. Please try again.")
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password)
      const user = userCred.user

      const userRef = doc(db, "users", user.uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          role: "student", // default role
          createdAt: new Date().toISOString(),
        })
        console.log("✅ New profile created")
      } else {
        console.log("👤 Profile already exists")
      }

      const userData = (await getDoc(userRef)).data()
      if (userData?.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/student/dashboard")
      }

    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Failed to sign in. Please try again.")
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <ChefHat className="h-8 w-8 text-primary mr-2" />
            <CardTitle className="text-2xl">MessEase</CardTitle>
          </div>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {"Don't have an account? "}
              <Link href="/auth/register" className="text-primary hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
