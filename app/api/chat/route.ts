import { type NextRequest, NextResponse } from "next/server"
import type { ISSPosition } from "@/lib/types"

export async function POST(req: NextRequest) {
  try {
    const { message, issPosition } = await req.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Format the system prompt with ISS position data
    const systemPrompt = formatSystemPrompt(issPosition)

    // Call Ollama API
    const response = await callOllamaAPI(systemPrompt, message)

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

function formatSystemPrompt(issPosition: ISSPosition | null): string {
  let prompt = `You are an AI assistant specializing in information about the International Space Station (ISS).`

  if (issPosition) {
    const { latitude, longitude, timestamp } = issPosition
    const formattedTime = timestamp.toISOString()

    prompt += `\n\nCurrent ISS Position Data:
- Latitude: ${latitude.toFixed(4)}
- Longitude: ${longitude.toFixed(4)}
- Timestamp: ${formattedTime}

When answering questions about the ISS's current location, use this data.`
  }

  prompt += `\n\nProvide informative, accurate, and engaging responses about the ISS, space exploration, and orbital mechanics. If asked about the current position, explain what part of Earth the ISS is currently flying over based on the coordinates.`

  return prompt
}

async function callOllamaAPI(systemPrompt: string, userMessage: string): Promise<string> {
  try {
    // Call to local Ollama instance
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3", // or whichever model you have installed
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.message.content
  } catch (error) {
    console.error("Error calling Ollama API:", error)
    return "I'm having trouble connecting to my knowledge base. Please check if Ollama is running locally with the correct model loaded."
  }
}

