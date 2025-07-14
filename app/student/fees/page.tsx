"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, DollarSign, Calendar, CreditCard, Download } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface FeeRecord {
  id: string
  month: string
  amount: number
  dueDate: string
  paidDate?: string
  status: "paid" | "pending" | "overdue"
}

export default function FeesPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([])
  const [totalDue, setTotalDue] = useState(0)

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "student")) {
      router.push("/")
      return
    }

    if (user) {
      // Mock fee data - in real app, fetch from Firestore
      const mockFeeRecords: FeeRecord[] = [
        {
          id: "1",
          month: "January 2024",
          amount: 2500,
          dueDate: "2024-01-15",
          paidDate: "2024-01-10",
          status: "paid",
        },
        {
          id: "2",
          month: "February 2024",
          amount: 2500,
          dueDate: "2024-02-15",
          paidDate: "2024-02-12",
          status: "paid",
        },
        {
          id: "3",
          month: "March 2024",
          amount: 2500,
          dueDate: "2024-03-15",
          status: "pending",
        },
        {
          id: "4",
          month: "April 2024",
          amount: 2500,
          dueDate: "2024-04-15",
          status: "pending",
        },
      ]

      setFeeRecords(mockFeeRecords)

      const due = mockFeeRecords
        .filter((record) => record.status !== "paid")
        .reduce((sum, record) => sum + record.amount, 0)

      setTotalDue(due)
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
          <h1 className="text-2xl font-bold text-gray-900">Mess Fees</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Due</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₹{totalDue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Outstanding amount</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Due Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15th Mar</div>
              <p className="text-xs text-muted-foreground">2024</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Fee</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹2,500</div>
              <p className="text-xs text-muted-foreground">Per month</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fee History</CardTitle>
            <CardDescription>Your mess fee payment records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feeRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{record.month}</p>
                      <p className="text-sm text-gray-500">
                        Due: {new Date(record.dueDate).toLocaleDateString()}
                        {record.paidDate && ` • Paid: ${new Date(record.paidDate).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">₹{record.amount.toLocaleString()}</p>
                      <Badge
                        variant={
                          record.status === "paid"
                            ? "default"
                            : record.status === "overdue"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {record.status}
                      </Badge>
                    </div>
                    {record.status === "paid" && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Receipt
                      </Button>
                    )}
                    {record.status === "pending" && <Button size="sm">Pay Now</Button>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>How to pay your mess fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Online Payment</h4>
                <p className="text-sm text-gray-600">
                  Pay online through the college portal or UPI. Payments are processed instantly.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Offline Payment</h4>
                <p className="text-sm text-gray-600">
                  Visit the mess office during working hours (9 AM - 5 PM) to pay in cash or by card.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Late Payment</h4>
                <p className="text-sm text-gray-600">
                  A late fee of ₹100 will be charged for payments made after the due date.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
