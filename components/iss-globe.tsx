"use client"

import dynamic from 'next/dynamic'

const ISSGlobeComponent = dynamic(
  () => import('./ISSGlobeComponent').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="loading-overlay">
        Loading ISS Tracker...
      </div>
    )
  }
)

export default ISSGlobeComponent

