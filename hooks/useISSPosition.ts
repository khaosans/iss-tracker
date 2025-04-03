import { useState, useEffect } from 'react'
import type { ISSPosition } from '@/lib/types'

const useISSPosition = () => {
  const [position, setPosition] = useState<ISSPosition | null>(null)
  const [trail, setTrail] = useState<ISSPosition[]>([])
  const [pathPoints, setPathPoints] = useState<Array<[number, number]>>([])
  const [isLoading, setIsLoading] = useState(true)

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
        setPosition(prev => {
          setTrail(prevTrail => {
            const newTrail = [...prevTrail, newPosition]
            return newTrail.length > 100 ? newTrail.slice(-100) : newTrail
          })
          setPathPoints(prevPoints => {
            const newPoints: [number, number][] = [...prevPoints, [newPosition.longitude, newPosition.latitude]]
            return newPoints.length > 100 ? newPoints.slice(-100) : newPoints
          })
          return newPosition
        })
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching ISS position:', error)
        setIsLoading(false)
      }
    }

    fetchISSPosition()
    const interval = setInterval(fetchISSPosition, 1000)
    return () => clearInterval(interval)
  }, [])

  return { position, trail, pathPoints, isLoading }
}

export default useISSPosition