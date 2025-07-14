// "use client"

// import type React from "react"

// import { useAuth } from "@/components/auth-provider"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { ArrowLeft, Plus, Megaphone, Trash2 } from "lucide-react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { useEffect, useState } from "react"
// import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore"
// import { db } from "@/lib/firebase"
// import { useToast } from "@/hooks/use-toast"

// interface Announcement {
//   id: string
//   title: string
//   message: string
//   audience: "all" | "students"
//   priority: "low" | "medium" | "high"
//   createdAt: string
//   createdBy: string
// }

// export default function AnnouncementsPage() {
//   const { user, userData, loading } = useAuth()
//   const router = useRouter()
//   const { toast } = useToast()
//   const [announcements, setAnnouncements] = useState<Announcement[]>([])
//   const [showForm, setShowForm] = useState(false)
//   const [formData, setFormData] = useState({
//     title: "",
//     message: "",
//     audience: "",
//     priority: "",
//   })
//   const [submitting, setSubmitting] = useState(false)

//   useEffect(() => {
//     if (!loading && (!user || userData?.role !== "admin")) {
//       router.push("/")
//       return
//     }

//     if (user) {
//       const announcementsQuery = query(collection(db, "announcements"), orderBy("createdAt", "desc"))

//       const unsubscribe = onSnapshot(announcementsQuery, (snapshot) => {
//         const announcementsData = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         })) as Announcement[]
//         setAnnouncements(announcementsData)
//       })

//       return () => unsubscribe()
//     }
//   }, [user, userData, loading, router])

//   const handleSubmitAnnouncement = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!user) return

//     setSubmitting(true)

//     try {
//       await addDoc(collection(db, "announcements"), {
//         title: formData.title,
//         message: formData.message,
//         audience: formData.audience,
//         priority: formData.priority,
//         createdAt: new Date().toISOString(),
//         createdBy: user.uid,
//         createdByName: userData?.name,
//       })

//       toast({
//         title: "Announcement posted",
//         description: "Your announcement has been posted successfully.",
//       })

//       setFormData({ title: "", message: "", audience: "", priority: "" })
//       setShowForm(false)
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to post announcement. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   const handleDeleteAnnouncement = async (announcementId: string) => {
//     try {
//       await deleteDoc(doc(db, "announcements", announcementId))
//       toast({
//         title: "Announcement deleted",
//         description: "The announcement has been deleted successfully.",
//       })
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to delete announcement. Please try again.",
//         variant: "destructive",
//       })
//     }
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
//       </div>
//     )
//   }

//   if (!user || userData?.role !== "admin") {
//     return null
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <header className="bg-white shadow-sm border-b">
//         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
//           <div className="flex items-center">
//             <Button variant="ghost" size="sm" asChild className="mr-4">
//               <Link href="/admin/dashboard">
//                 <ArrowLeft className="h-4 w-4 mr-2" />
//                 Back
//               </Link>
//             </Button>
//             <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
//           </div>
//           <Button onClick={() => setShowForm(!showForm)}>
//             <Plus className="h-4 w-4 mr-2" />
//             New Announcement
//           </Button>
//         </div>
//       </header>

//       <main className="container mx-auto px-4 py-8">
//         {showForm && (
//           <Card className="mb-6">
//             <CardHeader>
//               <CardTitle>Create New Announcement</CardTitle>
//               <CardDescription>Post important updates and notifications</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleSubmitAnnouncement} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="title">Title</Label>
//                   <Input
//                     id="title"
//                     value={formData.title}
//                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                     placeholder="Announcement title"
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="message">Message</Label>
//                   <Textarea
//                     id="message"
//                     value={formData.message}
//                     onChange={(e) => setFormData({ ...formData, message: e.target.value })}
//                     placeholder="Detailed announcement message"
//                     rows={4}
//                     required
//                   />
//                 </div>
//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="audience">Audience</Label>
//                     <Select onValueChange={(value) => setFormData({ ...formData, audience: value })}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select audience" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="all">All Users</SelectItem>
//                         <SelectItem value="students">Students Only</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="priority">Priority</Label>
//                     <Select onValueChange={(value) => setFormData({ ...formData, priority: value })}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select priority" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="low">Low</SelectItem>
//                         <SelectItem value="medium">Medium</SelectItem>
//                         <SelectItem value="high">High</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <div className="flex space-x-2">
//                   <Button type="submit" disabled={submitting}>
//                     {submitting ? "Posting..." : "Post Announcement"}
//                   </Button>
//                   <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
//                     Cancel
//                   </Button>
//                 </div>
//               </form>
//             </CardContent>
//           </Card>
//         )}

//         <div className="space-y-4">
//           {announcements.length > 0 ? (
//             announcements.map((announcement) => (
//               <Card key={announcement.id}>
//                 <CardHeader>
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <CardTitle className="flex items-center">
//                         <Megaphone className="h-5 w-5 mr-2" />
//                         {announcement.title}
//                       </CardTitle>
//                       <CardDescription>
//                         {new Date(announcement.createdAt).toLocaleDateString()} •{" "}
//                         {new Date(announcement.createdAt).toLocaleTimeString()}
//                       </CardDescription>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <Badge
//                         variant={
//                           announcement.priority === "high"
//                             ? "destructive"
//                             : announcement.priority === "medium"
//                               ? "secondary"
//                               : "outline"
//                         }
//                       >
//                         {announcement.priority} priority
//                       </Badge>
//                       <Badge variant="outline">{announcement.audience}</Badge>
//                       <Button variant="outline" size="sm" onClick={() => handleDeleteAnnouncement(announcement.id)}>
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-gray-700 whitespace-pre-wrap">{announcement.message}</p>
//                 </CardContent>
//               </Card>
//             ))
//           ) : (
//             <Card>
//               <CardContent className="text-center py-8">
//                 <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                 <p className="text-gray-500">No announcements posted yet</p>
//                 <Button className="mt-4" onClick={() => setShowForm(true)}>
//                   Post Your First Announcement
//                 </Button>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </main>
//     </div>
//   )
// }

"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Megaphone, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { serverTimestamp } from "firebase/firestore"

interface Announcement {
  id: string
  title: string
  message: string
  audience: "all" | "students"
  priority: "low" | "medium" | "high"
  createdAt: string
  createdBy: string
}

export default function AnnouncementsPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    audience: "",
    priority: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "admin")) {
      router.push("/")
      return
    }

    if (user) {
      const announcementsQuery = query(collection(db, "announcements"), orderBy("createdAt", "desc"))

      const unsubscribe = onSnapshot(announcementsQuery, (snapshot) => {
        const announcementsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Announcement[]
        setAnnouncements(announcementsData)
      })

      return () => unsubscribe()
    }
  }, [user, userData, loading, router])

  const handleSubmitAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)

    try {
      await addDoc(collection(db, "announcements"), {
        title: formData.title,
        message: formData.message,
        audience: formData.audience,
        priority: formData.priority,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        createdByName: userData?.name,
      })

      toast({
        title: "Announcement posted",
        description: "Your announcement has been posted successfully.",
      })

      setFormData({ title: "", message: "", audience: "", priority: "" })
      setShowForm(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post announcement. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      await deleteDoc(doc(db, "announcements", announcementId))
      toast({
        title: "Announcement deleted",
        description: "The announcement has been deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete announcement. Please try again.",
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
            <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Announcement</CardTitle>
              <CardDescription>Post important updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitAnnouncement} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Announcement title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Detailed announcement message"
                    rows={4}
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="audience">Audience</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, audience: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="students">Students Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Posting..." : "Post Announcement"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <Megaphone className="h-5 w-5 mr-2" />
                        {announcement.title}
                      </CardTitle>
                      <CardDescription>
                        {new Date(announcement.createdAt).toLocaleDateString()} •{" "}
                        {new Date(announcement.createdAt).toLocaleTimeString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          announcement.priority === "high"
                            ? "destructive"
                            : announcement.priority === "medium"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {announcement.priority} priority
                      </Badge>
                      <Badge variant="outline">{announcement.audience}</Badge>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{announcement.message}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No announcements posted yet</p>
                <Button className="mt-4" onClick={() => setShowForm(true)}>
                  Post Your First Announcement
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
