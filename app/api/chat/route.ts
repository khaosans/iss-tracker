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
    const { latitude, longitude, region } = await req.json();
    
    // Create a cache key based on coordinates (rounded to 1 decimal place for better caching)
    const cacheKey = `${Math.round(latitude * 10) / 10},${Math.round(longitude * 10) / 10}`;
    
    // Check if we have a cached fact that's still valid
    const cachedFact = factCache.get(cacheKey);
    if (cachedFact && (Date.now() - cachedFact.timestamp) < CACHE_EXPIRY) {
      return NextResponse.json({ fact: cachedFact.fact, source: 'AI Generated', cached: true });
    }
    
    // If no API key is configured, return a fallback response
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        fact: `You are currently over ${region || 'this region'}. This is a placeholder fact because no LLM API key is configured.`,
        source: 'System Fallback',
        error: 'No API key configured'
      });
    }
    
    // Prepare the prompt for the LLM
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful assistant that provides interesting, educational facts about geographical locations. Keep your responses concise (under 100 words), factual, and engaging.'
      },
      {
        role: 'user',
        content: `Generate an interesting fact about the region near latitude ${latitude}, longitude ${longitude}${region ? ` (${region})` : ''}. The fact should be educational and suitable for all ages.`
      }
    ];
    
    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );
    
    const generatedFact = response.data.choices[0].message.content.trim();
    
    // Cache the result
    factCache.set(cacheKey, {
      fact: generatedFact,
      timestamp: Date.now()
    });
    
    // Limit cache size to prevent memory issues
    if (factCache.size > 100) {
      // Delete the oldest entry
      const oldestKey = [...factCache.entries()]
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      factCache.delete(oldestKey);
    }
    
    return NextResponse.json({
      fact: generatedFact,
      source: 'AI Generated',
      cached: false
    });
    
  } catch (error) {
    console.error('Error generating fact:', error);
    return NextResponse.json(
      { error: 'Failed to generate fact' },
      { status: 500 }
    );
  }
}