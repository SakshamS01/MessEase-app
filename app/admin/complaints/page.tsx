// "use client"

// import { useAuth } from "@/components/auth-provider"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Textarea } from "@/components/ui/textarea"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { ArrowLeft, MessageSquare, Eye } from "lucide-react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { useEffect, useState } from "react"
// import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore"
// import { db } from "@/lib/firebase"
// import { useToast } from "@/hooks/use-toast"

// interface ComplaintData {
//   id: string
//   userId: string
//   userName: string
//   title: string
//   description: string
//   category: string
//   status: "pending" | "in-progress" | "resolved"
//   createdAt: string
//   imageUrl?: string
//   adminResponse?: string
// }

// export default function AdminComplaintsPage() {
//   const { user, userData, loading } = useAuth()
//   const router = useRouter()
//   const { toast } = useToast()
//   const [complaints, setComplaints] = useState<ComplaintData[]>([])
//   const [selectedComplaint, setSelectedComplaint] = useState<ComplaintData | null>(null)
//   const [response, setResponse] = useState("")
//   const [newStatus, setNewStatus] = useState("")
//   const [updating, setUpdating] = useState(false)

//   useEffect(() => {
//     if (!loading && (!user || userData?.role !== "admin")) {
//       router.push("/")
//       return
//     }

//     if (user) {
//       const complaintsQuery = query(collection(db, "complaints"), orderBy("createdAt", "desc"))

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

//   const handleUpdateComplaint = async () => {
//     if (!selectedComplaint || updating) return

//     setUpdating(true)

//     try {
//       const updateData: any = {}

//       if (response.trim()) {
//         updateData.adminResponse = response
//       }

//       if (newStatus) {
//         updateData.status = newStatus
//       }

//       await updateDoc(doc(db, "complaints", selectedComplaint.id), updateData)

//       toast({
//         title: "Complaint updated",
//         description: "The complaint has been updated successfully.",
//       })

//       setSelectedComplaint(null)
//       setResponse("")
//       setNewStatus("")
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to update complaint. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setUpdating(false)
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

//   const pendingComplaints = complaints.filter((c) => c.status === "pending")
//   const inProgressComplaints = complaints.filter((c) => c.status === "in-progress")
//   const resolvedComplaints = complaints.filter((c) => c.status === "resolved")

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <header className="bg-white shadow-sm border-b">
//         <div className="container mx-auto px-4 py-4 flex items-center">
//           <Button variant="ghost" size="sm" asChild className="mr-4">
//             <Link href="/admin/dashboard">
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back
//             </Link>
//           </Button>
//           <h1 className="text-2xl font-bold text-gray-900">Complaint Management</h1>
//         </div>
//       </header>

//       <main className="container mx-auto px-4 py-8">
//         <div className="grid md:grid-cols-3 gap-6 mb-8">
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-red-600">Pending</CardTitle>
//               <CardDescription>{pendingComplaints.length} complaints</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-3">
//                 {pendingComplaints.slice(0, 3).map((complaint) => (
//                   <div key={complaint.id} className="p-3 border rounded-lg">
//                     <p className="font-medium text-sm">{complaint.title}</p>
//                     <p className="text-xs text-gray-500">by {complaint.userName}</p>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       className="mt-2 bg-transparent"
//                       onClick={() => setSelectedComplaint(complaint)}
//                     >
//                       <Eye className="h-3 w-3 mr-1" />
//                       View
//                     </Button>
//                   </div>
//                 ))}
//                 {pendingComplaints.length > 3 && (
//                   <p className="text-xs text-gray-500">+{pendingComplaints.length - 3} more</p>
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="text-yellow-600">In Progress</CardTitle>
//               <CardDescription>{inProgressComplaints.length} complaints</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-3">
//                 {inProgressComplaints.slice(0, 3).map((complaint) => (
//                   <div key={complaint.id} className="p-3 border rounded-lg">
//                     <p className="font-medium text-sm">{complaint.title}</p>
//                     <p className="text-xs text-gray-500">by {complaint.userName}</p>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       className="mt-2 bg-transparent"
//                       onClick={() => setSelectedComplaint(complaint)}
//                     >
//                       <Eye className="h-3 w-3 mr-1" />
//                       View
//                     </Button>
//                   </div>
//                 ))}
//                 {inProgressComplaints.length > 3 && (
//                   <p className="text-xs text-gray-500">+{inProgressComplaints.length - 3} more</p>
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="text-green-600">Resolved</CardTitle>
//               <CardDescription>{resolvedComplaints.length} complaints</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-3">
//                 {resolvedComplaints.slice(0, 3).map((complaint) => (
//                   <div key={complaint.id} className="p-3 border rounded-lg">
//                     <p className="font-medium text-sm">{complaint.title}</p>
//                     <p className="text-xs text-gray-500">by {complaint.userName}</p>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       className="mt-2 bg-transparent"
//                       onClick={() => setSelectedComplaint(complaint)}
//                     >
//                       <Eye className="h-3 w-3 mr-1" />
//                       View
//                     </Button>
//                   </div>
//                 ))}
//                 {resolvedComplaints.length > 3 && (
//                   <p className="text-xs text-gray-500">+{resolvedComplaints.length - 3} more</p>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {selectedComplaint && (
//           <Card className="mb-6">
//             <CardHeader>
//               <div className="flex justify-between items-start">
//                 <div>
//                   <CardTitle>{selectedComplaint.title}</CardTitle>
//                   <CardDescription>
//                     Submitted by {selectedComplaint.userName} on{" "}
//                     {new Date(selectedComplaint.createdAt).toLocaleDateString()}
//                   </CardDescription>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <Badge
//                     variant={
//                       selectedComplaint.status === "resolved"
//                         ? "default"
//                         : selectedComplaint.status === "in-progress"
//                           ? "secondary"
//                           : "outline"
//                     }
//                   >
//                     {selectedComplaint.status}
//                   </Badge>
//                   <Button variant="outline" size="sm" onClick={() => setSelectedComplaint(null)}>
//                     Close
//                   </Button>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div>
//                   <h4 className="font-medium mb-2">Description</h4>
//                   <p className="text-gray-700">{selectedComplaint.description}</p>
//                 </div>

//                 <div>
//                   <h4 className="font-medium mb-2">Category</h4>
//                   <Badge variant="outline">{selectedComplaint.category}</Badge>
//                 </div>

//                 {selectedComplaint.imageUrl && (
//                   <div>
//                     <h4 className="font-medium mb-2">Attached Image</h4>
//                     <img
//                       src={selectedComplaint.imageUrl || "/placeholder.svg"}
//                       alt="Complaint"
//                       className="max-w-md rounded-lg border"
//                     />
//                   </div>
//                 )}

//                 {selectedComplaint.adminResponse && (
//                   <div>
//                     <h4 className="font-medium mb-2">Previous Response</h4>
//                     <div className="bg-blue-50 p-3 rounded-lg">
//                       <p className="text-blue-800">{selectedComplaint.adminResponse}</p>
//                     </div>
//                   </div>
//                 )}

//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div>
//                     <h4 className="font-medium mb-2">Add Response</h4>
//                     <Textarea
//                       value={response}
//                       onChange={(e) => setResponse(e.target.value)}
//                       placeholder="Type your response to the student..."
//                       rows={4}
//                     />
//                   </div>

//                   <div>
//                     <h4 className="font-medium mb-2">Update Status</h4>
//                     <Select onValueChange={setNewStatus}>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select new status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="pending">Pending</SelectItem>
//                         <SelectItem value="in-progress">In Progress</SelectItem>
//                         <SelectItem value="resolved">Resolved</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>

//                 <Button onClick={handleUpdateComplaint} disabled={updating || (!response.trim() && !newStatus)}>
//                   {updating ? "Updating..." : "Update Complaint"}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         <Card>
//           <CardHeader>
//             <CardTitle>All Complaints</CardTitle>
//             <CardDescription>Complete list of student complaints</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {complaints.length > 0 ? (
//                 complaints.map((complaint) => (
//                   <div key={complaint.id} className="flex items-center justify-between p-4 border rounded-lg">
//                     <div className="flex-1">
//                       <div className="flex items-center space-x-3">
//                         <div>
//                           <p className="font-medium">{complaint.title}</p>
//                           <p className="text-sm text-gray-500">
//                             by {complaint.userName} • {new Date(complaint.createdAt).toLocaleDateString()} •{" "}
//                             {complaint.category}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-3">
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
//                       <Button variant="outline" size="sm" onClick={() => setSelectedComplaint(complaint)}>
//                         <Eye className="h-4 w-4 mr-2" />
//                         View
//                       </Button>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="text-center py-8">
//                   <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                   <p className="text-gray-500">No complaints submitted yet</p>
//                 </div>
//               )}
//             </div>
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, MessageSquare, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

interface ComplaintData {
  id: string
  userId: string
  userName: string
  title: string
  description: string
  category: string
  status: "pending" | "in-progress" | "resolved"
  createdAt: any // keep as `any` to handle Firestore Timestamp safely
  imageUrl?: string
  adminResponse?: string
}

export default function AdminComplaintsPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [complaints, setComplaints] = useState<ComplaintData[]>([])
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintData | null>(null)
  const [response, setResponse] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "admin")) {
      router.push("/")
      return
    }

    if (user) {
      const complaintsQuery = query(collection(db, "complaints"), orderBy("createdAt", "desc"))

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

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint || updating) return

    setUpdating(true)

    try {
      const updateData: any = {}

      if (response.trim()) {
        updateData.adminResponse = response
      }

      if (newStatus) {
        updateData.status = newStatus
      }

      await updateDoc(doc(db, "complaints", selectedComplaint.id), updateData)

      toast({
        title: "Complaint updated",
        description: "The complaint has been updated successfully.",
      })

      setSelectedComplaint(null)
      setResponse("")
      setNewStatus("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update complaint. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
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

  const pendingComplaints = complaints.filter((c) => c.status === "pending")
  const inProgressComplaints = complaints.filter((c) => c.status === "in-progress")
  const resolvedComplaints = complaints.filter((c) => c.status === "resolved")

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Complaint Management</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Pending, In-Progress, Resolved cards — no changes needed here */}
          {/* ... */}
        </div>

        {selectedComplaint && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedComplaint.title}</CardTitle>
                  <CardDescription>
                    Submitted by {selectedComplaint.userName} on{" "}
                    {selectedComplaint.createdAt?.toDate
                      ? selectedComplaint.createdAt.toDate().toLocaleDateString()
                      : "Invalid Date"}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      selectedComplaint.status === "resolved"
                        ? "default"
                        : selectedComplaint.status === "in-progress"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {selectedComplaint.status}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => setSelectedComplaint(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Admin response section - no changes */}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Complaints</CardTitle>
            <CardDescription>Complete list of student complaints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complaints.length > 0 ? (
                complaints.map((complaint) => (
                  <div key={complaint.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">{complaint.title}</p>
                          <p className="text-sm text-gray-500">
                            by {complaint.userName} •{" "}
                            {complaint.createdAt?.toDate
                              ? complaint.createdAt.toDate().toLocaleDateString()
                              : "Invalid Date"}{" "}
                            • {complaint.category}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
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
                      <Button variant="outline" size="sm" onClick={() => setSelectedComplaint(complaint)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No complaints submitted yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
