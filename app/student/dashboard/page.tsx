// "use client"

// import { useAuth } from "@/components/auth-provider"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Calendar, DollarSign, MessageSquare, Vote, Bot, LogOut } from "lucide-react"
// import { signOut } from "firebase/auth"
// import { auth } from "@/lib/firebase"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { useEffect, useState } from "react"
// import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore"
// import { db } from "@/lib/firebase"

// interface MenuData {
//   id: string
//   date: string
//   breakfast: string[]
//   lunch: string[]
//   dinner: string[]
// }

// interface ComplaintData {
//   id: string
//   title: string
//   status: "pending" | "in-progress" | "resolved"
//   createdAt: string
// }

// export default function StudentDashboard() {
//   const { user, userData, loading } = useAuth()
//   const router = useRouter()
//   const [todayMenu, setTodayMenu] = useState<MenuData | null>(null)
//   const [recentComplaints, setRecentComplaints] = useState<ComplaintData[]>([])

//   useEffect(() => {
//     if (!loading && (!user || userData?.role !== "student")) {
//       router.push("/")
//       return
//     }

//     if (user) {
//       // Fetch today's menu
//       // const today = new Date().toISOString().split("T")[0]
//       const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
//       const menuQuery = query(collection(db, "menus"), where("date", "==", today), limit(1))

//       const unsubscribeMenu = onSnapshot(menuQuery, (snapshot) => {
//         if (!snapshot.empty) {
//           const menuDoc = snapshot.docs[0]
//           setTodayMenu({ id: menuDoc.id, ...menuDoc.data() } as MenuData)
//         }
//       })

//       // Fetch recent complaints
//       const complaintsQuery = query(
//         collection(db, "complaints"),
//         where("userId", "==", user.uid),
//         orderBy("createdAt", "desc"),
//         limit(3),
//       )

//       const unsubscribeComplaints = onSnapshot(complaintsQuery, (snapshot) => {
//         const complaints = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         })) as ComplaintData[]
//         setRecentComplaints(complaints)
//       })

//       return () => {
//         unsubscribeMenu()
//         unsubscribeComplaints()
//       }
//     }
//   }, [user, userData, loading, router])

//   const handleLogout = async () => {
//     await signOut(auth)
//     router.push("/")
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
//       </div>
//     )
//   }

//   if (!user || userData?.role !== "student") {
//     return null
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <header className="bg-white shadow-sm border-b">
//         <div className="container mx-auto px-4 py-4 flex justify-between items-center">
//           <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
//           <div className="flex items-center space-x-4">
//             <span className="text-sm text-gray-600">Welcome, {userData?.name}</span>
//             <Button variant="outline" size="sm" onClick={handleLogout}>
//               <LogOut className="h-4 w-4 mr-2" />
//               Logout
//             </Button>
//           </div>
//         </div>
//       </header>

//       <main className="container mx-auto px-4 py-8">
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Today's Menu</CardTitle>
//               <Calendar className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               {todayMenu ? (
//                 <div className="space-y-2">
//                   <div>
//                     <p className="text-xs font-medium text-gray-500">Breakfast</p>
//                     <p className="text-sm">{todayMenu.breakfast.join(", ")}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs font-medium text-gray-500">Lunch</p>
//                     <p className="text-sm">{todayMenu.lunch.join(", ")}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs font-medium text-gray-500">Dinner</p>
//                     <p className="text-sm">{todayMenu.dinner.join(", ")}</p>
//                   </div>
//                 </div>
//               ) : (
//                 <p className="text-sm text-gray-500">No menu available for today</p>
//               )}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Mess Fees</CardTitle>
//               <DollarSign className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">₹2,500</div>
//               <p className="text-xs text-muted-foreground">Due: 15th Jan 2024</p>
//               <Badge variant="outline" className="mt-2">
//                 Pending
//               </Badge>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Active Complaints</CardTitle>
//               <MessageSquare className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{recentComplaints.length}</div>
//               <p className="text-xs text-muted-foreground">Recent submissions</p>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           <Button asChild className="h-20 flex-col">
//             <Link href="/student/menu">
//               <Calendar className="h-6 w-6 mb-2" />
//               View Menu
//             </Link>
//           </Button>
//           <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
//             <Link href="/student/poll">
//               <Vote className="h-6 w-6 mb-2" />
//               Vote for Menu
//             </Link>
//           </Button>
//           <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
//             <Link href="/student/fees">
//               <DollarSign className="h-6 w-6 mb-2" />
//               Track Fees
//             </Link>
//           </Button>
//           <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
//             <Link href="/student/complaints">
//               <MessageSquare className="h-6 w-6 mb-2" />
//               Complaints
//             </Link>
//           </Button>
//         </div>

//         <div className="grid md:grid-cols-2 gap-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Recent Complaints</CardTitle>
//               <CardDescription>Your latest feedback submissions</CardDescription>
//             </CardHeader>
//             <CardContent>
//               {recentComplaints.length > 0 ? (
//                 <div className="space-y-3">
//                   {recentComplaints.map((complaint) => (
//                     <div key={complaint.id} className="flex justify-between items-center">
//                       <div>
//                         <p className="text-sm font-medium">{complaint.title}</p>
//                         <p className="text-xs text-gray-500">{new Date(complaint.createdAt).toLocaleDateString()}</p>
//                       </div>
//                       <Badge
//                         variant={
//                           complaint.status === "resolved"
//                             ? "default"
//                             : complaint.status === "in-progress"
//                               ? "secondary"
//                               : "outline"
//                         }
//                       >
//                         {complaint.status}
//                       </Badge>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-sm text-gray-500">No complaints submitted yet</p>
//               )}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>AI Assistant</CardTitle>
//               <CardDescription>Ask questions about mess services</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Button asChild className="w-full">
//                 <Link href="/student/chat">
//                   <Bot className="h-4 w-4 mr-2" />
//                   Chat with MessBot
//                 </Link>
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       </main>
//     </div>
//   )
// }

// "use client"

// import { useAuth } from "@/components/auth-provider"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Calendar, DollarSign, MessageSquare, Vote, Bot, LogOut } from "lucide-react"
// import { signOut } from "firebase/auth"
// import { auth, db } from "@/lib/firebase"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { useEffect, useState } from "react"
// import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore"

// interface MenuData {
//   id: string
//   date: string
//   breakfast: string[]
//   lunch: string[]
//   dinner: string[]
// }

// interface ComplaintData {
//   id: string
//   title: string
//   status: "pending" | "in-progress" | "resolved"
//   createdAt: string
// }

// interface AnnouncementData {
//   id: string
//   title: string
//   message: string
//   createdAt: string
//   createdByName?: string
//   priority: "low" | "medium" | "high"
//   audience: "all" | "student" | "admin"
// }

// export default function StudentDashboard() {
//   const { user, userData, loading } = useAuth()
//   const router = useRouter()
//   const [todayMenu, setTodayMenu] = useState<MenuData | null>(null)
//   const [recentComplaints, setRecentComplaints] = useState<ComplaintData[]>([])
//   const [announcements, setAnnouncements] = useState<AnnouncementData[]>([])

//   useEffect(() => {
//     if (!loading && (!user || userData?.role !== "student")) {
//       router.push("/")
//       return
//     }

//     if (user) {
//       const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })

//       const menuQuery = query(collection(db, "menus"), where("date", "==", today), limit(1))
//       const unsubscribeMenu = onSnapshot(menuQuery, (snapshot) => {
//         if (!snapshot.empty) {
//           const menuDoc = snapshot.docs[0]
//           setTodayMenu({ id: menuDoc.id, ...menuDoc.data() } as MenuData)
//         }
//       })

//       const complaintsQuery = query(
//         collection(db, "complaints"),
//         where("userId", "==", user.uid),
//         orderBy("createdAt", "desc"),
//         limit(3)
//       )
//       const unsubscribeComplaints = onSnapshot(complaintsQuery, (snapshot) => {
//         const complaints = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         })) as ComplaintData[]
//         setRecentComplaints(complaints)
//       })

//       const announcementsQuery = query(
//         collection(db, "announcements"),
//         where("audience", "in", ["all", "student"]),
//         orderBy("createdAt", "desc"),
//         limit(5)
//       )
//       const unsubscribeAnnouncements = onSnapshot(announcementsQuery, (snapshot) => {
//         const announcementsData = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         })) as AnnouncementData[]
//         setAnnouncements(announcementsData)
//       })

//       return () => {
//         unsubscribeMenu()
//         unsubscribeComplaints()
//         unsubscribeAnnouncements()
//       }
//     }
//   }, [user, userData, loading, router])

//   const handleLogout = async () => {
//     await signOut(auth)
//     router.push("/")
//   }

//   const getPriorityBadge = (priority: string) => {
//     switch (priority) {
//       case "high":
//         return <Badge className="bg-red-500 hover:bg-red-600">High</Badge>
//       case "medium":
//         return <Badge className="bg-yellow-400 text-black hover:bg-yellow-500">Medium</Badge>
//       case "low":
//       default:
//         return <Badge className="bg-green-500 hover:bg-green-600">Low</Badge>
//     }
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
//       </div>
//     )
//   }

//   if (!user || userData?.role !== "student") {
//     return null
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <header className="bg-white shadow-sm border-b">
//         <div className="container mx-auto px-4 py-4 flex justify-between items-center">
//           <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
//           <div className="flex items-center space-x-4">
//             <span className="text-sm text-gray-600">Welcome, {userData?.name}</span>
//             <Button variant="outline" size="sm" onClick={handleLogout}>
//               <LogOut className="h-4 w-4 mr-2" />
//               Logout
//             </Button>
//           </div>
//         </div>
//       </header>

//       <main className="container mx-auto px-4 py-8">
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Today's Menu</CardTitle>
//               <Calendar className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               {todayMenu ? (
//                 <div className="space-y-2">
//                   <div>
//                     <p className="text-xs font-medium text-gray-500">Breakfast</p>
//                     <p className="text-sm">{todayMenu.breakfast.join(", ")}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs font-medium text-gray-500">Lunch</p>
//                     <p className="text-sm">{todayMenu.lunch.join(", ")}</p>
//                   </div>
//                   <div>
//                     <p className="text-xs font-medium text-gray-500">Dinner</p>
//                     <p className="text-sm">{todayMenu.dinner.join(", ")}</p>
//                   </div>
//                 </div>
//               ) : (
//                 <p className="text-sm text-gray-500">No menu available for today</p>
//               )}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Mess Fees</CardTitle>
//               <DollarSign className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">₹2,500</div>
//               <p className="text-xs text-muted-foreground">Due: 15th Jan 2024</p>
//               <Badge variant="outline" className="mt-2">
//                 Pending
//               </Badge>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Active Complaints</CardTitle>
//               <MessageSquare className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{recentComplaints.length}</div>
//               <p className="text-xs text-muted-foreground">Recent submissions</p>
//             </CardContent>
//           </Card>
//         </div>

//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//           <Button asChild className="h-20 flex-col">
//             <Link href="/student/menu">
//               <Calendar className="h-6 w-6 mb-2" />
//               View Menu
//             </Link>
//           </Button>
//           <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
//             <Link href="/student/poll">
//               <Vote className="h-6 w-6 mb-2" />
//               Vote for Menu
//             </Link>
//           </Button>
//           <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
//             <Link href="/student/fees">
//               <DollarSign className="h-6 w-6 mb-2" />
//               Track Fees
//             </Link>
//           </Button>
//           <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
//             <Link href="/student/complaints">
//               <MessageSquare className="h-6 w-6 mb-2" />
//               Complaints
//             </Link>
//           </Button>
//         </div>

//         <div className="grid md:grid-cols-2 gap-6 mb-8">
//           <Card>
//             <CardHeader>
//               <CardTitle>Recent Complaints</CardTitle>
//               <CardDescription>Your latest feedback submissions</CardDescription>
//             </CardHeader>
//             <CardContent>
//               {recentComplaints.length > 0 ? (
//                 <div className="space-y-3">
//                   {recentComplaints.map((complaint) => (
//                     <div key={complaint.id} className="flex justify-between items-center">
//                       <div>
//                         <p className="text-sm font-medium">{complaint.title}</p>
//                         <p className="text-xs text-gray-500">{new Date(complaint.createdAt).toLocaleDateString()}</p>
//                       </div>
//                       <Badge
//                         variant={
//                           complaint.status === "resolved"
//                             ? "default"
//                             : complaint.status === "in-progress"
//                             ? "secondary"
//                             : "outline"
//                         }
//                       >
//                         {complaint.status}
//                       </Badge>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-sm text-gray-500">No complaints submitted yet</p>
//               )}
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>AI Assistant</CardTitle>
//               <CardDescription>Ask questions about mess services</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <Button asChild className="w-full">
//                 <Link href="/student/chat">
//                   <Bot className="h-4 w-4 mr-2" />
//                   Chat with MessBot
//                 </Link>
//               </Button>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Announcements Section */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Announcements</CardTitle>
//             <CardDescription>Latest mess-related updates</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {announcements.length > 0 ? (
//               <div className="space-y-4">
//                 {announcements.map((a) => (
//                   <div key={a.id} className="p-3 border rounded-lg bg-white shadow-sm">
//                     <div className="flex items-center justify-between mb-1">
//                       <h3 className="text-sm font-semibold">{a.title}</h3>
//                       {getPriorityBadge(a.priority)}
//                     </div>
//                     <p className="text-sm text-gray-600">{a.message}</p>
//                     <div className="mt-2 text-xs text-muted-foreground">
//                       By {a.createdByName || "Admin"} on{" "}
//                       {new Date(a.createdAt).toLocaleDateString("en-IN", {
//                         day: "numeric",
//                         month: "short",
//                         year: "numeric",
//                       })}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-sm text-gray-500">No announcements yet.</p>
//             )}
//           </CardContent>
//         </Card>
//       </main>
//     </div>
//   )
// }

"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign, MessageSquare, Vote, Bot, LogOut } from "lucide-react"
import { signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore"

interface MenuData {
  id: string
  date: string
  breakfast: string[]
  lunch: string[]
  dinner: string[]
}

interface ComplaintData {
  id: string
  title: string
  status: "pending" | "in-progress" | "resolved"
  createdAt: string
}

interface AnnouncementData {
  id: string
  title: string
  message: string
  createdAt: string
  createdByName?: string
  priority: "low" | "medium" | "high"
  audience: "all" | "student" | "admin"
}

export default function StudentDashboard() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [todayMenu, setTodayMenu] = useState<MenuData | null>(null)
  const [recentComplaints, setRecentComplaints] = useState<ComplaintData[]>([])
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([])

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "student")) {
      router.push("/")
      return
    }

    if (user) {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })

      const menuQuery = query(collection(db, "menus"), where("date", "==", today), limit(1))
      const unsubscribeMenu = onSnapshot(menuQuery, (snapshot) => {
        if (!snapshot.empty) {
          const menuDoc = snapshot.docs[0]
          setTodayMenu({ id: menuDoc.id, ...menuDoc.data() } as MenuData)
        }
      })

      const complaintsQuery = query(
        collection(db, "complaints"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(3)
      )
      const unsubscribeComplaints = onSnapshot(complaintsQuery, (snapshot) => {
        const complaints = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
          }
        }) as ComplaintData[]
        setRecentComplaints(complaints)
      })

      const announcementsQuery = query(
        collection(db, "announcements"),
        where("audience", "in", ["all", "student"]),
        orderBy("createdAt", "desc"),
        limit(5)
      )
      const unsubscribeAnnouncements = onSnapshot(announcementsQuery, (snapshot) => {
        const announcementsData = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString()
          }
        }) as AnnouncementData[]
        setAnnouncements(announcementsData)
      })

      return () => {
        unsubscribeMenu()
        unsubscribeComplaints()
        unsubscribeAnnouncements()
      }
    }
  }, [user, userData, loading, router])

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/")
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-500 hover:bg-red-600">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-400 text-black hover:bg-yellow-500">Medium</Badge>
      case "low":
      default:
        return <Badge className="bg-green-500 hover:bg-green-600">Low</Badge>
    }
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Menu</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {todayMenu ? (
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Breakfast</p>
                    <p className="text-sm">{todayMenu.breakfast.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Lunch</p>
                    <p className="text-sm">{todayMenu.lunch.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Dinner</p>
                    <p className="text-sm">{todayMenu.dinner.join(", ")}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No menu available for today</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mess Fees</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹2,500</div>
              <p className="text-xs text-muted-foreground">Due: 15th Jan 2024</p>
              <Badge variant="outline" className="mt-2">
                Pending
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Complaints</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentComplaints.length}</div>
              <p className="text-xs text-muted-foreground">Recent submissions</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button asChild className="h-20 flex-col">
            <Link href="/student/menu">
              <Calendar className="h-6 w-6 mb-2" />
              View Menu
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
            <Link href="/student/poll">
              <Vote className="h-6 w-6 mb-2" />
              Vote for Menu
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
            <Link href="/student/fees">
              <DollarSign className="h-6 w-6 mb-2" />
              Track Fees
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
            <Link href="/student/complaints">
              <MessageSquare className="h-6 w-6 mb-2" />
              Complaints
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Complaints</CardTitle>
              <CardDescription>Your latest feedback submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentComplaints.length > 0 ? (
                <div className="space-y-3">
                  {recentComplaints.map((complaint) => (
                    <div key={complaint.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{complaint.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <Badge
                        variant={
                          complaint.status === "resolved"
                            ? "default"
                            : complaint.status === "in-progress"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {complaint.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No complaints submitted yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>Ask questions about mess services</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/student/chat">
                  <Bot className="h-4 w-4 mr-2" />
                  Chat with MessBot
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>Latest mess-related updates</CardDescription>
          </CardHeader>
          <CardContent>
            {announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((a) => (
                  <div key={a.id} className="p-3 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold">{a.title}</h3>
                      {getPriorityBadge(a.priority)}
                    </div>
                    <p className="text-sm text-gray-600">{a.message}</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      By {a.createdByName || "Admin"} on{" "}
                      {new Date(a.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No announcements yet.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
