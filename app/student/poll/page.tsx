"use client"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Vote } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, increment } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

interface PollOption {
  id: string
  name: string
  votes: number
}

interface Poll {
  id: string
  date: string
  mealType: "breakfast" | "lunch" | "dinner"
  question: string
  options: PollOption[]
  totalVotes: number
  active: boolean
}

export default function PollPage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [polls, setPolls] = useState<Poll[]>([])
  const [userVotes, setUserVotes] = useState<Record<string, string>>({})
  const [voting, setVoting] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "student")) {
      router.push("/")
      return
    }

    if (user) {
      // Get active polls
      const pollsQuery = query(collection(db, "polls"), where("active", "==", true))

      const unsubscribePolls = onSnapshot(pollsQuery, (snapshot) => {
        const pollsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Poll[]
        setPolls(pollsData)
      })

      // Get user's votes
      const votesQuery = query(collection(db, "votes"), where("userId", "==", user.uid))

      const unsubscribeVotes = onSnapshot(votesQuery, (snapshot) => {
        const votes: Record<string, string> = {}
        snapshot.docs.forEach((doc) => {
          const data = doc.data()
          votes[data.pollId] = data.optionId
        })
        setUserVotes(votes)
      })

      return () => {
        unsubscribePolls()
        unsubscribeVotes()
      }
    }
  }, [user, userData, loading, router])

  const handleVote = async (pollId: string, optionId: string) => {
    if (!user || voting[pollId]) return

    setVoting({ ...voting, [pollId]: true })

    try {
      // Add user's vote
      await addDoc(collection(db, "votes"), {
        userId: user.uid,
        pollId: pollId,
        optionId: optionId,
        createdAt: new Date().toISOString(),
      })

      // Update poll option vote count
      const pollRef = doc(db, "polls", pollId)
      await updateDoc(pollRef, {
        [`options.${polls.find((p) => p.id === pollId)?.options.findIndex((o) => o.id === optionId)}.votes`]:
          increment(1),
        totalVotes: increment(1),
      })

      toast({
        title: "Vote submitted",
        description: "Thank you for your vote!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit vote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setVoting({ ...voting, [pollId]: false })
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
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href="/student/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Menu Polls</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Vote for Tomorrow's Menu</h2>
          <p className="text-gray-600">Help us decide what to serve by voting for your favorite dishes!</p>
        </div>

        <div className="space-y-6">
          {polls.length > 0 ? (
            polls.map((poll) => {
              const hasVoted = userVotes[poll.id]
              const userVotedOption = hasVoted ? poll.options.find((o) => o.id === hasVoted) : null

              return (
                <Card key={poll.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Vote className="h-5 w-5 mr-2" />
                      {poll.question}
                    </CardTitle>
                    <CardDescription>
                      {poll.mealType.charAt(0).toUpperCase() + poll.mealType.slice(1)} for{" "}
                      {new Date(poll.date).toLocaleDateString()}
                      {poll.totalVotes > 0 && ` • ${poll.totalVotes} votes`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {poll.options.map((option) => {
                        const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0
                        const isSelected = userVotedOption?.id === option.id

                        return (
                          <div key={option.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className={`font-medium ${isSelected ? "text-primary" : ""}`}>{option.name}</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">
                                  {option.votes} votes ({percentage.toFixed(1)}%)
                                </span>
                                {!hasVoted && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleVote(poll.id, option.id)}
                                    disabled={voting[poll.id]}
                                  >
                                    {voting[poll.id] ? "Voting..." : "Vote"}
                                  </Button>
                                )}
                                {isSelected && <span className="text-sm text-primary font-medium">✓ Your vote</span>}
                              </div>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        )
                      })}
                    </div>
                    {hasVoted && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          Thank you for voting! You voted for "{userVotedOption?.name}".
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Vote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active polls at the moment</p>
                <p className="text-sm text-gray-400 mt-2">Check back later for new voting opportunities!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
