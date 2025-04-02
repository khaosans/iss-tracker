import type { ISSPosition } from "./types"

export async function fetchISSPosition(): Promise<ISSPosition> {
  try {
    // Use our own API route instead of directly calling the external API
    const response = await fetch("/api/iss-position")

    if (!response.ok) {
      throw new Error(`Failed to fetch ISS position: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      latitude: Number.parseFloat(data.iss_position.latitude),
      longitude: Number.parseFloat(data.iss_position.longitude),
      timestamp: new Date(data.timestamp * 1000),
    }
  } catch (error) {
    console.error("Error fetching ISS position:", error)
    throw error
  }
}

