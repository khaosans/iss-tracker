"use client"

import { useEffect, useState } from 'react'
import * as THREE from 'three'
import { LineBasicMaterial, BufferGeometry, Vector3, Line } from 'three';

interface TexturePaths {
  globeImageUrl?: string
  bumpImageUrl?: string
  cloudsImageUrl?: string
}

const DEFAULT_TEXTURE_PATHS = {
  earth: '/earth-texture.jpg',
  bump: '/earth-bump.jpg',
  clouds: '/earth-clouds.png'
}

const getTexturePaths = (props: TexturePaths) => ({
  earth: props.globeImageUrl || DEFAULT_TEXTURE_PATHS.earth,
  bump: props.bumpImageUrl || DEFAULT_TEXTURE_PATHS.bump,
  clouds: props.cloudsImageUrl || DEFAULT_TEXTURE_PATHS.clouds
})

export function useTextureLoader(props: TexturePaths = {}) {
  const [state, setState] = useState<{
    textures: Record<string, THREE.Texture>
    error: Error | null
    trajectory?: THREE.Line  // Add trajectory to state
  }>({ textures: {}, error: null })

  // Add this new function to create trajectory line
  function createTrajectory(points: Array<[number, number, number]>) {
    const geometry = new BufferGeometry();
    const material = new LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
    
    const vertices = points.map(p => new Vector3(...p));
    geometry.setFromPoints(vertices);
    
    return new Line(geometry, material);
  }

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    const textures: Record<string, THREE.Texture> = {}
    let cancelled = false

    Promise.all(
      Object.entries(getTexturePaths(props)).map(async ([key, path]) => {
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

  return { 
    ...state,
    createTrajectory  // Expose the trajectory creator
  }
}