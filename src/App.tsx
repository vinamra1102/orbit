import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'

function App() {
  return (
    <div className="h-screen w-screen bg-[#05050a]">
      <Canvas camera={{ position: [0, 0, 16], fov: 50 }}>
        <color attach="background" args={['#05050a']} />
        <Scene />
      </Canvas>
    </div>
  )
}

export default App
