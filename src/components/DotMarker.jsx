import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'
import { LocationPin } from './GameAnimations'

function DotMarker({ dot }) {
  const markerRef = useRef()
  const setSelectedDot = useStore((state) => state.setSelectedDot)

  const handleClick = (e) => {
    e.stopPropagation()
    setSelectedDot(dot)
  }

  return (
    <group
      ref={markerRef}
      position={dot.position}
      onClick={handleClick}
    >
      <mesh>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial
          color="#ff6b6b"
          emissive="#ff6b6b"
          emissiveIntensity={0.5}
        />
      </mesh>
      <Billboard>
        <Text
          position={[0, 0.1, 0]}
          fontSize={0.05}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {dot.title || '📍'}
        </Text>
      </Billboard>
    </group>
  )
}

export default DotMarker

