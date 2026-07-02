import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import Scene from './components/Scene'
import CameraRig from './components/CameraRig'
import SidePanel from './components/SidePanel'
import Header from './components/Header'
import { Cursor, CursorProjector } from './components/Cursor'
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
      <Canvas
        camera={{ position: [0, 0, 18], fov: 50 }}
        onPointerMissed={clear}
        style={{ cursor: 'none' }}
      >
        <Scene />
        <CameraRig />
        <CursorProjector />
        <EffectComposer>
          <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.35} radius={0.75} />
        </EffectComposer>
      </Canvas>
      <Header />
      <SidePanel />
      <Cursor />
    </div>
  )
}

export default App
