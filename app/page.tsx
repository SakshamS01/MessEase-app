"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChefHat, Users, MessageSquare, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && userData) {
      if (userData.role === "student") {
        router.push("/student/dashboard")
      } else if (userData.role === "admin") {
        router.push("/admin/dashboard")
      }
    }
  }, [user, userData, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading MessEase...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <ChefHat className="h-16 w-16 text-primary mr-4" />
            <h1 className="text-6xl font-bold text-gray-900">MessEase</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Smart mess management system for colleges. Streamline menu planning, fee tracking, and student feedback all
            in one place.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <ChefHat className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle>Menu Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>View daily menus and vote for your favorite dishes</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle>Fee Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Track mess fees, payment history, and due dates</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <MessageSquare className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle>Feedback System</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Submit complaints and track their resolution status</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mx-auto mb-2" />
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Comprehensive analytics for mess administrators</CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-x-4">
          <Button asChild size="lg">
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/register">Register</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
