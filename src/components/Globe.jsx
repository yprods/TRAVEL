import React, { useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Sphere, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import DotMarker from './DotMarker'
import { useStore } from '../store'

function Globe() {
  const globeRef = useRef()
  const { camera } = useThree()
  const dots = useStore((state) => state.dots)
  const setClickLocation = useStore((state) => state.setClickLocation)
  const [isDragging, setIsDragging] = useState(false)
  const controlsRef = useRef()

  // Load world map texture - useTexture is a hook and must be called unconditionally
  // If it fails, it will throw and be caught by error boundary, or we use fallback color
  const textures = useTexture([
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg'
  ])
  
  const mapTexture = textures[0] || null
  const normalTexture = textures[1] || null

  useFrame(() => {
    if (globeRef.current && !isDragging) {
      globeRef.current.rotation.y += 0.002
    }
  })

  const handleDoubleClick = (event) => {
    try {
      event.stopPropagation()
      const point = event.point
      if (!point) {
        console.error('Invalid click point')
        return
      }
      const position = new THREE.Vector3().copy(point).normalize().multiplyScalar(1.01)
      
      const lat = Math.asin(position.y) * (180 / Math.PI)
      const lon = Math.atan2(position.x, position.z) * (180 / Math.PI)
      
      if (isNaN(lat) || isNaN(lon)) {
        console.error('Invalid coordinates calculated')
        return
      }
      
      useStore.getState().setSelectedDot({
        position: [position.x, position.y, position.z],
        lat,
        lon,
        isNew: true
      })
    } catch (error) {
      console.error('Error handling double click:', error)
      useStore.getState().setError('Failed to create location. Please try again.')
    }
  }

  const handleClick = (event) => {
    try {
      event.stopPropagation()
      const point = event.point
      if (!point) return
      
      const position = new THREE.Vector3().copy(point).normalize()
      
      const lat = Math.asin(position.y) * (180 / Math.PI)
      const lon = Math.atan2(position.x, position.z) * (180 / Math.PI)
      
      if (isNaN(lat) || isNaN(lon)) {
        console.error('Invalid coordinates calculated')
        return
      }
      
      // Find nearby locations (within 5 degrees)
      const nearbyLocations = dots.filter(dot => {
        if (!dot || typeof dot.lat !== 'number' || typeof dot.lon !== 'number') return false
        const latDiff = Math.abs(dot.lat - lat)
        const lonDiff = Math.abs(dot.lon - lon)
        return latDiff < 5 && lonDiff < 5
      })
      
      if (nearbyLocations.length > 0) {
        setClickLocation({
          lat,
          lon,
          position: [position.x * 1.01, position.y * 1.01, position.z * 1.01],
          locations: nearbyLocations
        })
      }
    } catch (error) {
      console.error('Error handling click:', error)
      useStore.getState().setError('Failed to process click. Please try again.')
    }
  }

  return (
    <group>
      <Stars radius={300} depth={60} count={20000} factor={7} fade speed={1} />
      
      <Sphere
        ref={globeRef}
        args={[1, 64, 64]}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
      >
        <meshStandardMaterial
          map={mapTexture || null}
          normalMap={normalTexture || null}
          color={mapTexture ? undefined : "#4a90e2"}
          roughness={0.8}
          metalness={0.1}
        />
      </Sphere>
      
      {/* Add atmosphere glow */}
      <Sphere args={[1.01, 64, 64]}>
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </Sphere>

      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={10}
        autoRotate={false}
        autoRotateSpeed={0.5}
      />

      {dots.map((dot) => (
        <DotMarker key={dot.id} dot={dot} />
      ))}
    </group>
  )
}

export default Globe

