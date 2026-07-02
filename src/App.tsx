import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import CameraRig from './components/CameraRig'
import SidePanel from './components/SidePanel'
import { useSelectionStore } from './store/selection'

function App() {
  const clear = useSelectionStore((s) => s.clear)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clear()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [clear])

  return (
    <div className="h-screen w-screen bg-[#05050a]">
      <Canvas camera={{ position: [0, 0, 16], fov: 50 }} onPointerMissed={clear}>
        <color attach="background" args={['#05050a']} />
        <Scene />
        <CameraRig />
      </Canvas>
      <SidePanel />
    </div>
  )
}

export default App
