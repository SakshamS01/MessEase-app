"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

interface MenuData {
  id: string
  date: string
  breakfast: string[]
  lunch: string[]
  dinner: string[]
}

export default function MenuManagePage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [menus, setMenus] = useState<MenuData[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    date: "",
    breakfast: "",
    lunch: "",
    dinner: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "admin")) {
      router.push("/")
      return
    }

    if (user) {
      const menusQuery = query(collection(db, "menus"), orderBy("date", "desc"))

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

  const handleSubmitMenu = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)

    try {
      await addDoc(collection(db, "menus"), {
        date: new Date(formData.date).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
        breakfast: formData.breakfast.split(",").map((item) => item.trim()),
        lunch: formData.lunch.split(",").map((item) => item.trim()),
        dinner: formData.dinner.split(",").map((item) => item.trim()),
        createdBy: user.uid,
        // createdAt: new Date().toISOString(),
        createdAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })

      })

      toast({
        title: "Menu added",
        description: "Menu has been added successfully.",
      })

      setFormData({ date: "", breakfast: "", lunch: "", dinner: "" })
      setShowForm(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add menu. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteMenu = async (menuId: string) => {
    try {
      await deleteDoc(doc(db, "menus", menuId))
      toast({
        title: "Menu deleted",
        description: "Menu has been deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete menu. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || userData?.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" asChild className="mr-4">
              <Link href="/admin/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Menu
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Menu</CardTitle>
              <CardDescription>Set menu for a specific date</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitMenu} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breakfast">Breakfast Items</Label>
                  <Input
                    id="breakfast"
                    value={formData.breakfast}
                    onChange={(e) => setFormData({ ...formData, breakfast: e.target.value })}
                    placeholder="Idli, Sambar, Chutney (comma separated)"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lunch">Lunch Items</Label>
                  <Input
                    id="lunch"
                    value={formData.lunch}
                    onChange={(e) => setFormData({ ...formData, lunch: e.target.value })}
                    placeholder="Rice, Dal, Vegetable, Roti (comma separated)"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dinner">Dinner Items</Label>
                  <Input
                    id="dinner"
                    value={formData.dinner}
                    onChange={(e) => setFormData({ ...formData, dinner: e.target.value })}
                    placeholder="Chapati, Curry, Rice, Dal (comma separated)"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Adding..." : "Add Menu"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {menus.length > 0 ? (
            menus.map((menu) => (
              <Card key={menu.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>
                        {new Date(menu.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardTitle>
                      <CardDescription>Menu for {menu.date}</CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteMenu(menu.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Breakfast</h4>
                      <div className="space-y-1">
                        {menu.breakfast.map((item, index) => (
                          <Badge key={index} variant="outline" className="mr-1 mb-1">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Lunch</h4>
                      <div className="space-y-1">
                        {menu.lunch.map((item, index) => (
                          <Badge key={index} variant="outline" className="mr-1 mb-1">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Dinner</h4>
                      <div className="space-y-1">
                        {menu.dinner.map((item, index) => (
                          <Badge key={index} variant="outline" className="mr-1 mb-1">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No menus added yet</p>
                <Button className="mt-4" onClick={() => setShowForm(true)}>
                  Add Your First Menu
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
