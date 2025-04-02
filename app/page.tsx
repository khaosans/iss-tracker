"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import ISSGlobe from "@/components/iss-globe"
import ChatInterface from "@/components/chat-interface"
import { fetchISSPosition } from "@/lib/iss-api"
import type { ISSPosition } from "@/lib/types"

export default function Home() {
  const [issPosition, setIssPosition] = useState<ISSPosition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const updateISSPosition = async () => {
      try {
        const position = await fetchISSPosition()
        setIssPosition(position)
        setLoading(false)
        // Clear any previous errors when successful
        if (error) setError(null)
      } catch (err) {
        console.error("Error updating ISS position:", err)
        setError("Failed to fetch ISS position. Please try refreshing the page.")
        setLoading(false)
      }
    }

    // Initial fetch
    updateISSPosition()

    // Set up polling every 5 seconds
    const intervalId = setInterval(updateISSPosition, 5000)

    return () => clearInterval(intervalId)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      <div className="w-full md:w-2/3 h-[50vh] md:h-screen relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-lg">Loading ISS position...</p>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : (
          <ISSGlobe issPosition={issPosition} />
        )}
      </div>
      <div className="w-full md:w-1/3 h-[50vh] md:h-screen p-4 bg-slate-50">
        <Card className="h-full overflow-hidden">
          <ChatInterface issPosition={issPosition} />
        </Card>
      </div>
    </main>
  )
}

