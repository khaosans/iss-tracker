"use client"

import { findLocationFact, getRandomFact } from '@/lib/location-facts'
import { generateLocationFact } from '@/lib/llm-facts'
import { useState, useEffect, useCallback, useRef } from 'react'

function safeTrim(value: any, fallback: string = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

interface ISSPosition {
  latitude: number
  longitude: number
  altitude: number
}

interface Fact {
  fact: string
  region: string
  source: string
}

const useFactProvider = () => {
  const [currentFact, setCurrentFact] = useState<Fact | null>(null)
  const [isGeneratingFact, setIsGeneratingFact] = useState(false)
  const factTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)  // Use ReturnType for better type safety
  const [factUpdateCounter, setFactUpdateCounter] = useState(0)
  const lastApiCallTimeRef = useRef<number>(0) // Track last API call time

  const API_CALL_COOLDOWN = 300000; // 5 minutes in milliseconds

  // Fact timer effect: update fact counter every 5 minutes
  useEffect(() => {
    if (factTimerRef.current) clearTimeout(factTimerRef.current)
    factTimerRef.current = setTimeout(() => {
      setFactUpdateCounter(prev => prev + 1)
    }, 300000) // Changed from 10000/600000 to 300000 (5 minutes)
    return () => {
      if (factTimerRef.current) clearTimeout(factTimerRef.current)
    }
  }, [factUpdateCounter])

  const hasMovedToNewRegion = useCallback((current: ISSPosition | null, previous: ISSPosition | null) => {
    if (!current || !previous) return false
    const latDiff = Math.abs(current.latitude - previous.latitude)
    const lngDiff = Math.abs(current.longitude - previous.longitude)
    return latDiff > 5 || lngDiff > 5
  }, [])

  const updateFact = useCallback(async (newPosition: ISSPosition, prevPosition: ISSPosition | null) => {
    const movedToNewRegion = hasMovedToNewRegion(newPosition, prevPosition)
    const currentTime = Date.now()
    const timeSinceLastCall = currentTime - lastApiCallTimeRef.current
    
    // Check if we should update fact: new region OR timer expired OR no current fact, AND not currently generating
    // PLUS ensure we're not calling the API too frequently
    if ((movedToNewRegion || factUpdateCounter > 0 || !currentFact) && 
        !isGeneratingFact && 
        timeSinceLastCall >= API_CALL_COOLDOWN) {
      
      setIsGeneratingFact(true)
      
      try {
        // Update timestamp before API call
        lastApiCallTimeRef.current = currentTime
        
        const llmFact = await generateLocationFact(newPosition.latitude, newPosition.longitude)
        if (llmFact && typeof llmFact.fact === 'string') {
          const validatedFact = {
            fact: safeTrim(llmFact.fact, String(llmFact.fact)),
            region: safeTrim(llmFact.region, 'Unknown Region'),
            source: safeTrim(llmFact.source, 'Unknown Source')
          }
          setCurrentFact(validatedFact)
        }
      } catch (error) {
        console.error('Error generating LLM fact:', error)
        const fallbackFact = findLocationFact(newPosition.latitude, newPosition.longitude) || getRandomFact()
        if (fallbackFact && typeof fallbackFact.fact === 'string') {
          const validatedFallback = {
            fact: safeTrim(fallbackFact.fact, String(fallbackFact.fact)),
            region: safeTrim(fallbackFact.region, ''),
            source: safeTrim(fallbackFact.source, 'World Ocean Review')
          }
          setCurrentFact(validatedFallback)
        }
      } finally {
        setIsGeneratingFact(false)
      }
    }
  }, [currentFact, factUpdateCounter, hasMovedToNewRegion, isGeneratingFact])

  return { currentFact, updateFact }
}

export default useFactProvider