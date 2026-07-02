import { Canvas } from '@react-three/fiber'

function App() {
  return (
    <div className="h-screen w-screen bg-[#05050a]">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <color attach="background" args={['#05050a']} />
        <ambientLight intensity={0.5} />
      </Canvas>
    </div>
  )
}

export default App
