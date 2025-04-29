import { NextRequest, NextResponse } from 'next/server';
import { ChatMessage } from '@/lib/types';
import axios from 'axios';

// Cache for storing generated facts to avoid excessive API calls
const factCache = new Map<string, { fact: string; timestamp: number }>();
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour cache expiry

/**
 * API route for generating location facts using OpenAI
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Example: Process the request body
    if (!body.message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // If no API key is configured, return a fallback response
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Example: Make an API call
    const response = await axios.post('https://api.example.com', {
      message: body.message,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
