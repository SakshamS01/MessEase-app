"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Package, AlertTriangle, Edit } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

interface InventoryItem {
  id: string
  name: string
  quantity: number
  unit: string
  lowStockThreshold: number
  lastUpdated: string
  category: string
}

export default function InventoryPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "",
    lowStockThreshold: "",
    category: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "admin")) {
      router.push("/")
      return
    }

    if (user) {
      const inventoryQuery = query(collection(db, "inventory"), orderBy("name", "asc"))

      const unsubscribe = onSnapshot(inventoryQuery, (snapshot) => {
        const inventoryData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as InventoryItem[]
        setInventory(inventoryData)
      })

      return () => unsubscribe()
    }
  }, [user, userData, loading, router])

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)

    try {
      const itemData = {
        name: formData.name,
        quantity: Number.parseInt(formData.quantity),
        unit: formData.unit,
        lowStockThreshold: Number.parseInt(formData.lowStockThreshold),
        category: formData.category,
        lastUpdated: new Date().toISOString(),
      }

      if (editingItem) {
        await updateDoc(doc(db, "inventory", editingItem.id), itemData)
        toast({
          title: "Item updated",
          description: "Inventory item has been updated successfully.",
        })
      } else {
        await addDoc(collection(db, "inventory"), itemData)
        toast({
          title: "Item added",
          description: "New inventory item has been added successfully.",
        })
      }

      setFormData({ name: "", quantity: "", unit: "", lowStockThreshold: "", category: "" })
      setShowForm(false)
      setEditingItem(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save inventory item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      quantity: item.quantity.toString(),
      unit: item.unit,
      lowStockThreshold: item.lowStockThreshold.toString(),
      category: item.category,
    })
    setShowForm(true)
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

  const lowStockItems = inventory.filter((item) => item.quantity <= item.lowStockThreshold)
  const categories = [...new Set(inventory.map((item) => item.category))]

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
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {lowStockItems.length > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-800">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Low Stock Alert
              </CardTitle>
              <CardDescription className="text-orange-700">
                {lowStockItems.length} items are running low on stock
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} {item.unit} remaining
                      </p>
                    </div>
                    <Badge variant="destructive">Low Stock</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingItem ? "Edit Item" : "Add New Item"}</CardTitle>
              <CardDescription>
                {editingItem ? "Update inventory item details" : "Add a new item to inventory"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitItem} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Rice, Wheat, Vegetables"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Grains, Vegetables, Spices"
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Current Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="100"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="kg, liters, pieces"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                    <Input
                      id="lowStockThreshold"
                      type="number"
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                      placeholder="10"
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : editingItem ? "Update Item" : "Add Item"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingItem(null)
                      setFormData({ name: "", quantity: "", unit: "", lowStockThreshold: "", category: "" })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {categories.map((category) => {
            const categoryItems = inventory.filter((item) => item.category === category)

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    {category}
                  </CardTitle>
                  <CardDescription>{categoryItems.length} items in this category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryItems.map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{item.name}</h4>
                          <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} {item.unit}
                          </p>
                          <p className="text-sm text-gray-600">
                            Alert at: {item.lowStockThreshold} {item.unit}
                          </p>
                          <p className="text-xs text-gray-500">
                            Updated: {new Date(item.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                        {item.quantity <= item.lowStockThreshold && (
                          <Badge variant="destructive" className="mt-2">
                            Low Stock
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {inventory.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No inventory items added yet</p>
                <Button className="mt-4" onClick={() => setShowForm(true)}>
                  Add Your First Item
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
