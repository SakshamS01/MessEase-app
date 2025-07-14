import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json()

    if (!message || !userId) {
      return NextResponse.json({ error: "Message and userId are required" }, { status: 400 })
    }

    // Get user data
    const userDoc = await getDoc(doc(db, "users", userId))
    const userData = userDoc.exists() ? userDoc.data() : null

    // Get today's menu
    const today = new Date().toISOString().split("T")[0]
    const menuQuery = query(collection(db, "menus"), where("date", "==", today), limit(1))
    const menuSnapshot = await getDocs(menuQuery)
    const todayMenu = menuSnapshot.empty ? null : menuSnapshot.docs[0].data()

    // Get user's recent complaints
    const complaintsQuery = query(
      collection(db, "complaints"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(5),
    )
    const complaintsSnapshot = await getDocs(complaintsQuery)
    const userComplaints = complaintsSnapshot.docs.map((doc) => doc.data())

    // Create context for Gemini
    const context = `
You are MessBot, an AI assistant for MessEase - a college mess management system. 
You help students with questions about mess services.

Current user: ${userData?.name || "Student"}

Today's Menu (${today}):
${
  todayMenu
    ? `
Breakfast: ${todayMenu.breakfast?.join(", ") || "Not available"}
Lunch: ${todayMenu.lunch?.join(", ") || "Not available"}
Dinner: ${todayMenu.dinner?.join(", ") || "Not available"}
`
    : "No menu available for today"
}

User's Recent Complaints:
${
  userComplaints.length > 0
    ? userComplaints.map((c) => `- ${c.title} (Status: ${c.status})`).join("\n")
    : "No recent complaints"
}

General Information:
- Mess timings: Breakfast (7:00-9:00 AM), Lunch (12:00-2:00 PM), Dinner (7:00-9:00 PM)
- Monthly mess fee: ₹2,500
- Fee due date: 15th of every month
- Complaints are typically resolved within 3-5 business days

Please provide helpful, accurate responses about mess services. Keep responses concise and friendly.
If you don't have specific information, guide the user to the appropriate section of the app.
`

    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    const result = await model.generateContent(`${context}\n\nUser question: ${message}`)
    const response = result.response.text()

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process your message. Please try again." }, { status: 500 })
  }
}
