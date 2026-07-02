import { memo } from 'react'
import { Billboard, Line, Text } from '@react-three/drei'
import { nodes, edges, type StackNode, type StackEdge } from '../data/stack'
import { nodePositions, radiusFor, CATEGORY_COLORS, type Vec3 } from '../lib/layout'

const NodeMesh = memo(function NodeMesh({ node }: { node: StackNode }) {
  const position = nodePositions.get(node.id)!
  const radius = radiusFor(node.weight)
  const color = CATEGORY_COLORS[node.category]

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
      <Billboard position={[0, radius + 0.28, 0]}>
        <Text
          fontSize={0.28}
          color="#e2e8f0"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.012}
          outlineColor="#05050a"
        >
          {node.label}
        </Text>
      </Billboard>
    </group>
  )
})

const EdgeLine = memo(function EdgeLine({ edge }: { edge: StackEdge }) {
  const start = nodePositions.get(edge.source)!
  const end = nodePositions.get(edge.target)!

  return (
    <Line
      points={[start, end] as Vec3[]}
      color="#7dd3fc"
      transparent
      opacity={0.1 + edge.strength * 0.12}
      lineWidth={0.5 + edge.strength * 0.6}
    />
  )
})

function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} />
      <directionalLight position={[-5, -3, -5]} intensity={0.3} />
      {edges.map((edge) => (
        <EdgeLine key={`${edge.source}-${edge.target}`} edge={edge} />
      ))}
      {nodes.map((node) => (
        <NodeMesh key={node.id} node={node} />
      ))}
    </>
  )
}

export default memo(Scene)
