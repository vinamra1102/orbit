import { useEffect, useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

const IDLE_DELAY_MS = 5000

/**
 * OrbitControls that auto-rotate while idle. Any interaction (drag, click,
 * wheel) pauses the rotation; it resumes after 5s without input.
 */
function CameraRig() {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current)
    }
  }, [])

  const pauseAutoRotate = () => {
    const controls = controlsRef.current
    if (!controls) return
    controls.autoRotate = false
    if (idleTimer.current) clearTimeout(idleTimer.current)
    idleTimer.current = setTimeout(() => {
      if (controlsRef.current) controlsRef.current.autoRotate = true
    }, IDLE_DELAY_MS)
  }

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate
      autoRotateSpeed={0.6}
      enablePan={false}
      minDistance={6}
      maxDistance={30}
      onStart={pauseAutoRotate}
    />
  )
}

export default CameraRig
