"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Globe from 'react-globe.gl'
import LocationFactDisplay from './LocationFact'
import { motion, AnimatePresence } from 'framer-motion'

import useFactProvider from './FactProvider'
import useTextureLoader from '@/hooks/useTextureLoader' // Changed to default import
import type { ISSPosition } from '@/lib/types'
import useISSPosition from '@/hooks/useISSPosition'

interface GlobeProps {
  globeImageUrl?: string
  bumpImageUrl?: string
}

const ISSGlobeComponent = ({ 
  globeImageUrl = '/earth-texture.jpg',
  bumpImageUrl = '/earth-bump.png',
}: GlobeProps) => {
  const globeRef = useRef<any>(null)
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight })
  const { position: issPosition, trail: issTrail, pathPoints, isLoading } = useISSPosition()
  const [prevPosition, setPrevPosition] = useState<ISSPosition | null>(null)
  const [showFact, setShowFact] = useState(false)
  const [formattedFact, setFormattedFact] = useState<string | null>(null)
  const [factUpdateCounter, setFactUpdateCounter] = useState(0)
  const [isGeneratingFact, setIsGeneratingFact] = useState(false)
  const [factTypingComplete, setFactTypingComplete] = useState(true);
  const factTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { currentFact, updateFact } = useFactProvider()
  const { texture, error: textureError } = useTextureLoader(globeImageUrl); // Call the hook unconditionally
  const [textureLoadFailed, setTextureLoadFailed] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Function to check if ISS has moved to a new region
  const hasMovedToNewRegion = useCallback((current: ISSPosition | null, previous: ISSPosition | null) => {
    if (!current || !previous) return false
    const latDiff = Math.abs(current.latitude - previous.latitude)
    const lngDiff = Math.abs(current.longitude - previous.longitude)
    return latDiff > 5 || lngDiff > 5
  }, [])

  // Fact timer effect: update fact counter every 10 minutes
  useEffect(() => {
    if (factTimerRef.current) clearTimeout(factTimerRef.current)
    factTimerRef.current = setTimeout(() => {
      setFactUpdateCounter(prev => prev + 1)
    }, 600000) // Changed from 10000 to 600000 (10 minutes)
    return () => {
      if (factTimerRef.current) clearTimeout(factTimerRef.current)
    }
  }, [factUpdateCounter])

  // Fetch ISS position every second
  useEffect(() => {
    const fetchISSPosition = async () => {
      try {
        const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544')
        const data = await response.json()
        if (!data || typeof data.latitude !== 'number' || typeof data.longitude !== 'number' || typeof data.altitude !== 'number') {
          throw new Error('Invalid data structure')
        }
        const newPosition: ISSPosition = {
          latitude: data.latitude,
          longitude: data.longitude,
          altitude: data.altitude
        }
        setPrevPosition(issPosition)
        
        // Only update fact if typing animation is complete
        if (factTypingComplete) {
          await updateFact(newPosition, prevPosition)
          setFactTypingComplete(false); // Reset for the new fact
          setShowFact(true)
        }
      } catch (error) {
        console.error('Error fetching ISS position:', error)
      }
    }

    fetchISSPosition()
    const interval = setInterval(fetchISSPosition, 1000)
    return () => clearInterval(interval)
  }, [updateFact, prevPosition, issPosition, factTypingComplete])

  // Floating coordinates panel
  const CoordinatesPanel = () => (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      padding: '16px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: '12px',
      color: 'white',
      fontFamily: 'monospace',
      fontSize: '14px',
      backdropFilter: 'blur(4px)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>ISS Position</div>
      <div>Latitude: {issPosition?.latitude?.toFixed(4) ?? 'N/A'}</div>
      <div>Longitude: {issPosition?.longitude?.toFixed(4) ?? 'N/A'}</div>
      <div>Altitude: {(issPosition?.altitude ?? 0).toFixed(2)} km</div>
    </div>
  )

  // Auto-rotate globe
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls()
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.rotateSpeed = 0.8
      controls.zoomSpeed = 1.0
      controls.minDistance = 200
      controls.maxDistance = 800
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.3
    }
  }, [])

  useEffect(() => {
    if (textureError) {
      setTextureLoadFailed(true)
    } else {
      setTextureLoadFailed(false)
    }
  }, [textureError])

  if (isLoading) return <div className="text-center py-10">Loading ISS tracker...</div>

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <Globe
        ref={globeRef}
        globeImageUrl={globeImageUrl}
        bumpImageUrl={bumpImageUrl}

        backgroundColor="rgba(0, 0, 0, 0)"
        showAtmosphere={true}
        atmosphereColor="rgba(100, 150, 255, 0.5)"
        atmosphereAltitude={0.15}
        width={dimensions.width}
        height={dimensions.height}
        centerHoverAltitude={0.1}
        animateIn={true}
        pointsData={issPosition ? [issPosition] : []}
        pointLat="latitude"
        pointLng="longitude"
        pointAltitude="altitude"
        pointRadius={1.2}
        pointColor={() => '#ff4444'}
        pointsMerge={false}
        pointsTransitionDuration={1000}
        showGraticules={true}
        graticulesColor="rgba(255,255,255,0.1)"
        pathsData={[{
          coords: pathPoints,
          color: [255, 255, 0],
          opacity: 0.7,
          width: 2
        }]}
        pathPoints="coords"
        pathPointLat={1}
        pathPointLng={0}
        pathColor={(d) => Array.isArray(d.color) ? `rgb(${d.color.join(',')})` : d.color}
        pathStroke="width"
        pathDashLength={0.1}
        pathDashGap={0}
        pathDashAnimateTime={10000}
      />
      <CoordinatesPanel />
      <LocationFactDisplay 
        fact={currentFact}
        isVisible={showFact}
        style={{ display: showFact ? 'block' : 'none' }}
        onTypingComplete={() => setFactTypingComplete(true)}
        minDisplayTime={10000} // Ensure fact stays visible for at least 10 seconds
      />
      {textureLoadFailed && (
        <div className="absolute top-4 left-4 bg-red-500/90 text-white p-4 rounded-lg shadow-lg">
          <h3 className="font-bold mb-2">⚠️ Texture Load Error</h3>
          <p>Failed to load globe textures. Please check your network connection.</p>
        </div>
      )}
    </div>
  )
}

export default ISSGlobeComponent