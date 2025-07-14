"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChefHat, Users, MessageSquare, Package, LogOut, Plus } from "lucide-react"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { collection, query, where, onSnapshot, getDocs, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalStudents: number
  pendingComplaints: number
  todayMenuSet: boolean
  lowStockItems: number
}

export default function AdminDashboard() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    pendingComplaints: 0,
    todayMenuSet: false,
    lowStockItems: 0,
  })

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "admin")) {
      router.push("/")
      return
    }

    if (user) {
      // Get total students
      const studentsQuery = query(collection(db, "users"), where("role", "==", "student"))

      getDocs(studentsQuery).then((snapshot) => {
        setStats((prev) => ({ ...prev, totalStudents: snapshot.size }))
      })

      // Get pending complaints
      const complaintsQuery = query(collection(db, "complaints"), where("status", "==", "pending"))

      const unsubscribeComplaints = onSnapshot(complaintsQuery, (snapshot) => {
        setStats((prev) => ({ ...prev, pendingComplaints: snapshot.size }))
      })

      // Check if today's menu is set
      const today = new Date().toISOString().split("T")[0]
      const menuQuery = query(collection(db, "menus"), where("date", "==", today))

      const unsubscribeMenu = onSnapshot(menuQuery, (snapshot) => {
        setStats((prev) => ({ ...prev, todayMenuSet: !snapshot.empty }))
      })

      // Get low stock items
      const inventoryQuery = query(collection(db, "inventory"), where("quantity", "<=", 10))

      const unsubscribeInventory = onSnapshot(inventoryQuery, (snapshot) => {
        setStats((prev) => ({ ...prev, lowStockItems: snapshot.size }))
      })

      return () => {
        unsubscribeComplaints()
        unsubscribeMenu()
        unsubscribeInventory()
      }
    }
  }, [user, userData, loading, router])

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/")
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

  const [pollForm, setPollForm] = useState({ question: "", options: "" });
  const [submittingPoll, setSubmittingPoll] = useState(false);
  const { toast } = useToast();

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPoll(true);

    try {
      await addDoc(collection(db, "polls"), {
        question: pollForm.question,
        options: pollForm.options.split(",").map((opt) => opt.trim()),
        isActive: true,
        createdBy: "admin",
        createdAt: new Date().toISOString(),
      });

      toast({
        title: "Poll created",
        description: "Students can now vote on this poll.",
      });

      setPollForm({ question: "", options: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create poll. Try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingPoll(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {userData?.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Complaints</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.pendingComplaints}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Menu</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge variant={stats.todayMenuSet ? "default" : "destructive"}>
                  {stats.todayMenuSet ? "Set" : "Not Set"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Menu status</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">Need restocking</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button asChild className="h-20 flex-col">
            <Link href="/admin/menu">
              <ChefHat className="h-6 w-6 mb-2" />
              Manage Menu
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
            <Link href="/admin/complaints">
              <MessageSquare className="h-6 w-6 mb-2" />
              Handle Complaints
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
            <Link href="/admin/inventory">
              <Package className="h-6 w-6 mb-2" />
              Manage Inventory
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
            <Link href="/admin/announcements">
              <Plus className="h-6 w-6 mb-2" />
              Announcements
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Poll</CardTitle>
              <CardDescription>Let students vote on meals or decisions</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleCreatePoll}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="question">Poll Question</Label>
                  <Input
                    id="question"
                    value={pollForm.question}
                    onChange={(e) => setPollForm({ ...pollForm, question: e.target.value })}
                    placeholder="e.g. What should be tomorrow’s dinner?"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="options">Options (comma separated)</Label>
                  <Input
                    id="options"
                    value={pollForm.options}
                    onChange={(e) => setPollForm({ ...pollForm, options: e.target.value })}
                    placeholder="e.g. Paneer, Rajma, Chole"
                    required
                  />
                </div>

                <Button type="submit" disabled={submittingPoll}>
                  {submittingPoll ? "Creating..." : "Create Poll"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* First PolL code given by GPT */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Start a New Poll</CardTitle>
              <CardDescription>Create a poll for students to vote on</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/polls">
                <Button variant="default" className="w-full">
                  + Create New Poll
                </Button>
              </Link>
            </CardContent>
          </Card> */}

          {/* Quick action panel by v0.dev */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/admin/menu/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Today's Menu
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/admin/announcements/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Announcement
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start bg-transparent">
                <Link href="/admin/inventory/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Inventory Item
                </Link>
              </Button>
            </CardContent>
          </Card> */}

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Menu Management</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Complaint System</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Inventory Tracking</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">AI Assistant</span>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
