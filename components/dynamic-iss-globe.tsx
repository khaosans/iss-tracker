"use client"

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

const ISSGlobe = dynamic(
  () => import('./iss-globe').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <p>Loading globe...</p>
      </div>
    )
  }
)

export default function ISSGlobeWrapper(props: any) {
  const [assetsError, setAssetsError] = useState(false)

  if (assetsError) {
    return (
      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <p className="text-red-500">Error loading globe assets</p>
      </div>
    )
  }

  return <ISSGlobe {...props} onError={() => setAssetsError(true)} />
}