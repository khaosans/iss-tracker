"use client"

import { useEffect, useState } from 'react'
import * as THREE from 'three'

const TEXTURE_PATHS = {
  earth: '/earth-texture.jpg',  // Public directory path
  bump: '/earth-bump.jpg',
  clouds: '/earth-clouds.png'
}

export function useTextureLoader() {
  const [state, setState] = useState<{
    textures: Record<string, THREE.Texture>
    error: Error | null
  }>({ textures: {}, error: null })

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    const textures: Record<string, THREE.Texture> = {}
    let cancelled = false

    Promise.all(
      Object.entries(TEXTURE_PATHS).map(async ([key, path]) => {
        try {
          textures[key] = await new Promise((resolve, reject) => {
            loader.load(path, resolve, undefined, reject)
          })
        } catch (err) {
          if (!cancelled) setState(prev => ({ ...prev, error: err as Error }))
        }
      })
    ).then(() => {
      if (!cancelled) setState({ textures, error: null })
    })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}