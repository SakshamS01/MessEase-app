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
// import { ArrowLeft, Plus, MessageSquare } from "lucide-react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { useEffect, useState } from "react"
// import { collection, query, where, orderBy, onSnapshot, addDoc } from "firebase/firestore"
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
// import { db, storage } from "@/lib/firebase"
// import { useToast } from "@/hooks/use-toast"
// import { serverTimestamp } from "firebase/firestore"

// interface ComplaintData {
//   id: string
//   title: string
//   description: string
//   category: string
//   status: "pending" | "in-progress" | "resolved"
//   createdAt: string
//   imageUrl?: string
//   adminResponse?: string
// }

// export default function ComplaintsPage() {
//   const { user, userData, loading } = useAuth()
//   const router = useRouter()
//   const { toast } = useToast()
//   const [complaints, setComplaints] = useState<ComplaintData[]>([])
//   const [showForm, setShowForm] = useState(false)
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     category: "",
//   })
//   const [selectedImage, setSelectedImage] = useState<File | null>(null)
//   const [submitting, setSubmitting] = useState(false)

//   useEffect(() => {
//     if (!loading && (!user || userData?.role !== "student")) {
//       router.push("/")
//       return
//     }

//     if (user) {
//       const complaintsQuery = query(
//         collection(db, "complaints"),
//         where("userId", "==", user.uid),
//         orderBy("createdAt", "desc"),
//       )

//       const unsubscribe = onSnapshot(complaintsQuery, (snapshot) => {
//         const complaintsData = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         })) as ComplaintData[]
//         setComplaints(complaintsData)
//       })

//       return () => unsubscribe()
//     }
//   }, [user, userData, loading, router])

//   const handleSubmitComplaint = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!user) return

//     setSubmitting(true)

//     try {
//       let imageUrl = ""

//       if (selectedImage) {
//         const imageRef = ref(storage, `complaints/${user.uid}/${Date.now()}_${selectedImage.name}`)
//         await uploadBytes(imageRef, selectedImage)
//         imageUrl = await getDownloadURL(imageRef)
//       }

//       await addDoc(collection(db, "complaints"), {
//         userId: user.uid,
//         userName: userData?.name,
//         title: formData.title,
//         description: formData.description,
//         category: formData.category,
//         status: "pending",
//         createdAt: serverTimestamp(),
//         imageUrl: imageUrl || null,
//       })

//       toast({
//         title: "Complaint submitted",
//         description: "Your complaint has been submitted successfully.",
//       })

//       setFormData({ title: "", description: "", category: "" })
//       setSelectedImage(null)
//       setShowForm(false)
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to submit complaint. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setSubmitting(false)
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
//         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
//           <div className="flex items-center">
//             <Button variant="ghost" size="sm" asChild className="mr-4">
//               <Link href="/student/dashboard">
//                 <ArrowLeft className="h-4 w-4 mr-2" />
//                 Back
//               </Link>
//             </Button>
//             <h1 className="text-2xl font-bold text-gray-900">Complaints & Feedback</h1>
//           </div>
//           <Button onClick={() => setShowForm(!showForm)}>
//             <Plus className="h-4 w-4 mr-2" />
//             New Complaint
//           </Button>
//         </div>
//       </header>

//       <main className="container mx-auto px-4 py-8">
//         {showForm && (
//           <Card className="mb-6">
//             <CardHeader>
//               <CardTitle>Submit New Complaint</CardTitle>
//               <CardDescription>Help us improve our mess services</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleSubmitComplaint} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="title">Title</Label>
//                   <Input
//                     id="title"
//                     value={formData.title}
//                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                     placeholder="Brief description of the issue"
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="category">Category</Label>
//                   <Select onValueChange={(value) => setFormData({ ...formData, category: value })}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select category" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="food-quality">Food Quality</SelectItem>
//                       <SelectItem value="hygiene">Hygiene</SelectItem>
//                       <SelectItem value="service">Service</SelectItem>
//                       <SelectItem value="facilities">Facilities</SelectItem>
//                       <SelectItem value="other">Other</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="description">Description</Label>
//                   <Textarea
//                     id="description"
//                     value={formData.description}
//                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                     placeholder="Detailed description of the issue"
//                     rows={4}
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="image">Upload Image (Optional)</Label>
//                   <Input
//                     id="image"
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
//                   />
//                 </div>
//                 <div className="flex space-x-2">
//                   <Button type="submit" disabled={submitting}>
//                     {submitting ? "Submitting..." : "Submit Complaint"}
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
//           {complaints.length > 0 ? (
//             complaints.map((complaint) => (
//               <Card key={complaint.id}>
//                 <CardHeader>
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <CardTitle className="text-lg">{complaint.title}</CardTitle>
//                       <CardDescription>
//                         {new Date(complaint.createdAt).toLocaleDateString()} • {complaint.category}
//                       </CardDescription>
//                     </div>
//                     <Badge
//                       variant={
//                         complaint.status === "resolved"
//                           ? "default"
//                           : complaint.status === "in-progress"
//                             ? "secondary"
//                             : "outline"
//                       }
//                     >
//                       {complaint.status}
//                     </Badge>
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   <p className="text-gray-700 mb-4">{complaint.description}</p>
//                   {complaint.imageUrl && (
//                     <div className="mb-4">
//                       <img
//                         src={complaint.imageUrl || "/placeholder.svg"}
//                         alt="Complaint"
//                         className="max-w-xs rounded-lg"
//                       />
//                     </div>
//                   )}
//                   {complaint.adminResponse && (
//                     <div className="bg-blue-50 p-3 rounded-lg">
//                       <p className="text-sm font-medium text-blue-900 mb-1">Admin Response:</p>
//                       <p className="text-sm text-blue-800">{complaint.adminResponse}</p>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             ))
//           ) : (
//             <Card>
//               <CardContent className="text-center py-8">
//                 <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                 <p className="text-gray-500">No complaints submitted yet</p>
//                 <Button className="mt-4" onClick={() => setShowForm(true)}>
//                   Submit Your First Complaint
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
import { ArrowLeft, Plus, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

interface ComplaintData {
  id: string
  title: string
  description: string
  category: string
  status: "pending" | "in-progress" | "resolved"
  createdAt: any
  imageUrl?: string
  adminResponse?: string
}

export default function ComplaintsPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [complaints, setComplaints] = useState<ComplaintData[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "student")) {
      router.push("/")
      return
    }

    if (user) {
      const complaintsQuery = query(
        collection(db, "complaints"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
      )

      const unsubscribe = onSnapshot(complaintsQuery, (snapshot) => {
        const complaintsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ComplaintData[]
        setComplaints(complaintsData)
      })

      return () => unsubscribe()
    }
  }, [user, userData, loading, router])

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)

    try {
      let imageUrl = ""

      if (selectedImage) {
        const imageRef = ref(storage, `complaints/${user.uid}/${Date.now()}_${selectedImage.name}`)
        await uploadBytes(imageRef, selectedImage)
        imageUrl = await getDownloadURL(imageRef)
      }

      await addDoc(collection(db, "complaints"), {
        userId: user.uid,
        userName: userData?.name,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        status: "pending",
        createdAt: serverTimestamp(),
        imageUrl: imageUrl || null,
      })

      toast({
        title: "Complaint submitted",
        description: "Your complaint has been submitted successfully.",
      })

      setFormData({ title: "", description: "", category: "" })
      setSelectedImage(null)
      setShowForm(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit complaint. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" asChild className="mr-4">
              <Link href="/student/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Complaints & Feedback</h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            New Complaint
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Submit New Complaint</CardTitle>
              <CardDescription>Help us improve our mess services</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitComplaint} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food-quality">Food Quality</SelectItem>
                      <SelectItem value="hygiene">Hygiene</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="facilities">Facilities</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed description of the issue"
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Upload Image (Optional)</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Complaint"}
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
          {complaints.length > 0 ? (
            complaints.map((complaint) => (
              <Card key={complaint.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{complaint.title}</CardTitle>
                      <CardDescription>
                        {(complaint.createdAt as any)?.toDate?.().toLocaleDateString?.() || "Unknown Date"} • {complaint.category}
                      </CardDescription>
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
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{complaint.description}</p>
                  {complaint.imageUrl && (
                    <div className="mb-4">
                      <img
                        src={complaint.imageUrl || "/placeholder.svg"}
                        alt="Complaint"
                        className="max-w-xs rounded-lg"
                      />
                    </div>
                  )}
                  {complaint.adminResponse && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-900 mb-1">Admin Response:</p>
                      <p className="text-sm text-blue-800">{complaint.adminResponse}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No complaints submitted yet</p>
                <Button className="mt-4" onClick={() => setShowForm(true)}>
                  Submit Your First Complaint
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
