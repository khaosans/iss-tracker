"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import * as THREE from "three"
import type { ISSPosition } from "@/lib/types"
import { useTextureLoader } from "./TextureLoader"

const Earth = () => {
  const earthRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const { textures, error } = useTextureLoader()  // Using imported hook

  useFrame(() => {
    if (earthRef.current) earthRef.current.rotation.y += 0.0005
    if (cloudsRef.current) cloudsRef.current.rotation.y += 0.0007
  })

  if (error) {
    return (
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial color="#1a73e8" />
      </mesh>
    )
  }

  return (
    <>
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          map={textures.earth}
          bumpMap={textures.bump}
          bumpScale={0.05}
          specular={new THREE.Color("grey")}
          shininess={5}
        />
      </mesh>
      <mesh ref={cloudsRef} scale={1.01}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial 
          map={textures.clouds} 
          transparent 
          opacity={0.4} 
          depthWrite={false} 
        />
      </mesh>
    </>
  )
}

// ISS Model
const ISS = ({ position }: { position: [number, number, number] }) => {
  const issRef = useRef<THREE.Mesh>(null)

  return (
    <mesh ref={issRef} position={position} scale={0.02}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial color="red" emissive="red" emissiveIntensity={0.5} />
    </mesh>
  )
}

// Convert lat/long to 3D coordinates
const latLongToVector3 = (lat: number, lon: number, radius: number): [number, number, number] => {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return [x, y, z]
}

interface ISSGlobeProps {
  issPosition: ISSPosition | null
  onError?: () => void
}

// Remove the duplicate export default and keep this one
export default function ISSGlobeComponent({ issPosition, onError }: ISSGlobeProps) {
  const [issCoordinates, setIssCoordinates] = useState<[number, number, number]>([0, 0, 0])

  useEffect(() => {
    if (issPosition) {
      const { latitude, longitude } = issPosition
      setIssCoordinates(latLongToVector3(latitude, longitude, 1.05))
    }
  }, [issPosition])

  return (
    <Canvas className="w-full h-full">
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <Earth />
      {issPosition && <ISS position={issCoordinates} />}

      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        zoomSpeed={0.6}
        panSpeed={0.5}
        rotateSpeed={0.5}
        minDistance={1.5}
        maxDistance={10}
      />
    </Canvas>
  )
}

// Remove this duplicate export
// export default ISSGlobeComponent;

