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

  // Fact timer effect: update fact counter every 10 seconds
  useEffect(() => {
    if (factTimerRef.current) clearTimeout(factTimerRef.current)
    factTimerRef.current = setTimeout(() => {
      setFactUpdateCounter(prev => prev + 1)
    }, 10000)
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
    if ((movedToNewRegion || factUpdateCounter > 0 || !currentFact) && !isGeneratingFact) {
      setIsGeneratingFact(true)
      try {
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