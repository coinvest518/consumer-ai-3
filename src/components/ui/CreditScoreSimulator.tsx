"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, HelpCircle, RefreshCw } from "lucide-react"

interface CreditScoreData {
  currentScore: number
  maxScore: number
  change: number
  rating: string
  lastUpdate: string
  chartData: { month: string; score: number }[]
}

interface CreditScoreSimulatorProps {
  userName?: string
  onScoreUpdate?: (newScore: number) => void
}

const CreditScoreSimulator: React.FC<CreditScoreSimulatorProps> = ({ userName = "User", onScoreUpdate }) => {
  const [creditData, setCreditData] = useState<CreditScoreData>({
    currentScore: 708,
    maxScore: 850,
    change: 10,
    rating: "Good Credit",
    lastUpdate: "Today, Oct 20",
    chartData: [
      { month: "Sep", score: 655 },
      { month: "Oct", score: 708 },
    ],
  })

  const [isAnimating, setIsAnimating] = useState(false)

  const getCreditRating = (score: number): string => {
    if (score >= 800) return "Excellent Credit"
    if (score >= 740) return "Very Good Credit"
    if (score >= 670) return "Good Credit"
    if (score >= 580) return "Fair Credit"
    return "Poor Credit"
  }

  const getRatingColor = (rating: string): string => {
    switch (rating) {
      case "Excellent Credit":
        return "bg-green-500"
      case "Very Good Credit":
        return "bg-blue-500"
      case "Good Credit":
        return "bg-blue-500"
      case "Fair Credit":
        return "bg-yellow-500"
      case "Poor Credit":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const simulateScoreChange = () => {
    if (isAnimating) return

    setIsAnimating(true)

    // Generate a random score change between -50 and +50
    const change = Math.floor(Math.random() * 101) - 50
    const newScore = Math.max(300, Math.min(850, creditData.currentScore + change))
    const newRating = getCreditRating(newScore)

    // Update chart data
    const newChartData = [creditData.chartData[creditData.chartData.length - 1], { month: "Nov", score: newScore }]

    setTimeout(() => {
      setCreditData((prev) => ({
        ...prev,
        currentScore: newScore,
        change: change,
        rating: newRating,
        lastUpdate: `Today, ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        chartData: newChartData,
      }))

      onScoreUpdate?.(newScore)
      setIsAnimating(false)
    }, 1000)
  }

  const getScorePercentage = () => {
    return ((creditData.currentScore - 300) / (creditData.maxScore - 300)) * 100
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Credit Score Simulator</CardTitle>
        <CardDescription>Hello {userName}, see your credit score and simulate changes.</CardDescription>
      </CardHeader>

      <CardContent className="grid md:grid-cols-2 gap-8">
        {/* Left column for score display */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-6xl font-bold">
            {isAnimating ? <div className="animate-pulse">---</div> : creditData.currentScore}
          </div>
          <div className="text-2xl opacity-60">/{creditData.maxScore}</div>
          <div className="flex items-center gap-1 text-green-400 text-sm mt-2">
            <TrendingUp className="w-4 h-4" />
            {creditData.change > 0 ? "+" : ""}
            {creditData.change} pt
          </div>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge className={`${getRatingColor(creditData.rating)} text-white px-3 py-1`}>
              {creditData.rating}
            </Badge>
            <HelpCircle className="w-4 h-4 opacity-60" />
          </div>
          {/* Removed fake phone images and icons */}
        </div>
        {/* Right column for chart visualization */}
        <div className="flex flex-col justify-center">
          <div className="relative h-20 bg-slate-700/30 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-end h-full">
              {creditData.chartData.map((data, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="w-3 h-3 bg-blue-400 rounded-full mb-2 relative"
                    style={{
                      marginBottom: `${(data.score - 600) / 10}px`,
                    }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs">{data.score}</div>
                  </div>
                  <div className="text-xs opacity-60">{data.month}</div>
                </div>
              ))}
            </div>
            {/* Connecting line */}
            <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-yellow-400 to-blue-400 transform -translate-y-1/2"></div>
          </div>
          <div className="flex justify-between items-center text-sm opacity-75">
            <span>Profile</span>
            <span>Last update - {creditData.lastUpdate}</span>
          </div>
        </div>
      </CardContent>




      {/* Greeting Card */}
      <Card className="bg-white text-slate-900 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">👋</span>
            <h3 className="font-semibold text-lg">Good morning, {userName}!</h3>
          </div>
          <p className="text-sm text-slate-600">
            Review 8 credit report items for potential errors or improvement opportunities
          </p>
        </CardContent>
      </Card>

      {/* Simulate Button */}
      <Button
        onClick={simulateScoreChange}
        disabled={isAnimating}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isAnimating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
        {isAnimating ? "Updating Score..." : "Simulate Score Change"}
      </Button>
    </Card>
  )
}

export default CreditScoreSimulator
