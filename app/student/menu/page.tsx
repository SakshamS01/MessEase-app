"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clock, Star } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface MenuData {
  id: string
  date: string
  breakfast: string[]
  lunch: string[]
  dinner: string[]
  nutritionalInfo?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
}

export default function MenuPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [menus, setMenus] = useState<MenuData[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "student")) {
      router.push("/")
      return
    }

    if (user) {
      // Fetch menus for the next 7 days
      const menusQuery = query(collection(db, "menus"), orderBy("date", "asc"), limit(7))

      const unsubscribe = onSnapshot(menusQuery, (snapshot) => {
        const menuData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MenuData[]
        setMenus(menuData)
      })

      return () => unsubscribe()
    }
  }, [user, userData, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || userData?.role !== "student") {
    return null
  }

  const selectedMenu = menus.find((menu) => menu.date === selectedDate)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/student/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Mess Menu</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Select Date</h2>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 7 }, (_, i) => {
              const date = new Date()
              date.setDate(date.getDate() + i)
              const dateString = date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
              const isSelected = selectedDate === dateString

              return (
                <Button
                  key={dateString}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDate(dateString)}
                >
                  {date.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </Button>
              )
            })}
          </div>
        </div>

        {selectedMenu ? (
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Breakfast
                </CardTitle>
                <CardDescription>7:00 AM - 9:00 AM</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedMenu.breakfast.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item}</span>
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Lunch
                </CardTitle>
                <CardDescription>12:00 PM - 2:00 PM</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedMenu.lunch.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item}</span>
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Dinner
                </CardTitle>
                <CardDescription>7:00 PM - 9:00 PM</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedMenu.dinner.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item}</span>
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No menu available for the selected date</p>
            </CardContent>
          </Card>
        )}

        {selectedMenu?.nutritionalInfo && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Nutritional Information</CardTitle>
              <CardDescription>Approximate values per serving</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedMenu.nutritionalInfo.calories}</div>
                  <div className="text-sm text-gray-500">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedMenu.nutritionalInfo.protein}g</div>
                  <div className="text-sm text-gray-500">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{selectedMenu.nutritionalInfo.carbs}g</div>
                  <div className="text-sm text-gray-500">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{selectedMenu.nutritionalInfo.fat}g</div>
                  <div className="text-sm text-gray-500">Fat</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
