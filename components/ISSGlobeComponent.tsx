"use client"

import React from 'react'
import Globe from 'react-globe.gl'
import { useEffect, useRef, useState } from 'react'

interface ISSPosition {
  latitude: number
  longitude: number
  altitude: number
}

const ISSGlobeComponent = () => {
  const globeRef = useRef()
  const [issPosition, setIssPosition] = useState<ISSPosition | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch ISS position
  useEffect(() => {
    const fetchISSPosition = async () => {
      try {
        const response = await fetch('https://api.wheretheiss.at/v1/satellites/25544')
        const data = await response.json()
        setIssPosition({
          latitude: data.latitude,
          longitude: data.longitude,
          altitude: data.altitude
        })
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching ISS position:', error)
        setIsLoading(false)
      }
    }

    fetchISSPosition()
    const interval = setInterval(fetchISSPosition, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Auto-rotate globe
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true
      globeRef.current.controls().autoRotateSpeed = 0.5
    }
  }, [])

  if (isLoading) return <div className="text-center py-10">Loading ISS tracker...</div>

  return (
    <div className="w-full h-full">
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundColor="rgba(0, 0, 0, 0)"
        showAtmosphere={true}
        atmosphereColor="rgba(0, 100, 200, 0.2)"
        width={800}
        height={800}
        animateIn={false}
        pointsData={issPosition ? [issPosition] : []}
        pointLat="latitude"
        pointLng="longitude"
        pointAltitude="altitude"
        pointRadius={0.5}
        pointColor={() => 'red'}
      />
    </div>
  )
}

export default ISSGlobeComponent
