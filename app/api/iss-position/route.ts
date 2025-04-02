import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("http://api.open-notify.org/iss-now.json", {
      // Adding cache: 'no-store' to ensure we get fresh data each time
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ISS position: ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching ISS position:", error)
    return NextResponse.json({ error: "Failed to fetch ISS position" }, { status: 500 })
  }
}

