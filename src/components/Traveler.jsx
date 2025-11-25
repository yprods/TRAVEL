import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'

function Traveler({ targetLocation, onArrive }) {
  const travelerRef = useRef()
  const [isMoving, setIsMoving] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(new THREE.Vector3(0, 1.1, 0))
  const dots = useStore((state) => state.dots)

  // Simple traveler model (using a sphere as placeholder)
  // In production, you'd load a 3D model here

  useEffect(() => {
    if (targetLocation && targetLocation.position) {
      setIsMoving(true)
      const target = new THREE.Vector3(...targetLocation.position)
      setCurrentPosition(target)
    }
  }, [targetLocation])

  useFrame((state, delta) => {
    if (travelerRef.current && isMoving && targetLocation) {
      const target = new THREE.Vector3(...targetLocation.position)
      const current = travelerRef.current.position
      
      // Move towards target
      current.lerp(target, delta * 0.5)
      
      // Rotate to face direction of movement
      if (target.distanceTo(current) > 0.01) {
        const direction = new THREE.Vector3()
        direction.subVectors(target, current).normalize()
        travelerRef.current.lookAt(current.clone().add(direction))
      } else {
        setIsMoving(false)
        if (onArrive) onArrive()
      }
      
      // Bounce animation
      const bounce = Math.sin(state.clock.elapsedTime * 5) * 0.05
      travelerRef.current.position.y = current.y + bounce
    }
  })

  return (
    <group ref={travelerRef} position={currentPosition}>
      {/* Traveler figure - using a simple model */}
      <mesh>
        <boxGeometry args={[0.1, 0.2, 0.1]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.15, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      {/* Walking animation indicator */}
      {isMoving && (
        <mesh position={[0, -0.1, 0]}>
          <ringGeometry args={[0.15, 0.2, 8]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  )
}

export default Traveler

