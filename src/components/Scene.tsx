import { memo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Line, Text } from '@react-three/drei'
import type { Group, Mesh, MeshStandardMaterial } from 'three'
import type { Line2 } from 'three-stdlib'
import { nodes, edges, type StackNode, type StackEdge } from '../data/stack'
import { nodePositions, radiusFor, CATEGORY_COLORS, type Vec3 } from '../lib/layout'
import { nodeStatus, edgeStatus, type NodeStatus, type EdgeStatus } from '../lib/graph'
import { useSelectionStore, activeId } from '../store/selection'

const NODE_SCALE: Record<NodeStatus, number> = {
  idle: 1,
  active: 1.18,
  connected: 1.1,
  dimmed: 1,
}

const NODE_OPACITY: Record<NodeStatus, number> = {
  idle: 1,
  active: 1,
  connected: 1,
  dimmed: 0.2,
}

const NODE_EMISSIVE: Record<NodeStatus, number> = {
  idle: 0.35,
  active: 0.9,
  connected: 0.6,
  dimmed: 0.1,
}

function setCursor(pointer: boolean) {
  document.body.style.cursor = pointer ? 'pointer' : 'auto'
}

const NodeMesh = memo(function NodeMesh({ node }: { node: StackNode }) {
  const position = nodePositions.get(node.id)!
  const radius = radiusFor(node.weight)
  const color = CATEGORY_COLORS[node.category]

  const status = useSelectionStore((s) => nodeStatus(node.id, activeId(s)))
  const setHovered = useSelectionStore((s) => s.setHovered)
  const setSelected = useSelectionStore((s) => s.setSelected)

  const groupRef = useRef<Group>(null)
  const meshRef = useRef<Mesh>(null)
  const targets = useRef({ scale: 1, opacity: 1, emissive: 0.35 })
  targets.current = {
    scale: NODE_SCALE[status],
    opacity: NODE_OPACITY[status],
    emissive: NODE_EMISSIVE[status],
  }

  // Ease scale/opacity toward their targets so hover transitions feel smooth
  // without re-rendering anything.
  useFrame((_, delta) => {
    const group = groupRef.current
    const mesh = meshRef.current
    if (!group || !mesh) return
    const t = Math.min(delta * 10, 1)
    const { scale, opacity, emissive } = targets.current
    const s = group.scale.x + (scale - group.scale.x) * t
    group.scale.setScalar(s)
    const material = mesh.material as MeshStandardMaterial
    material.opacity += (opacity - material.opacity) * t
    material.emissiveIntensity += (emissive - material.emissiveIntensity) * t
  })

  const labelOpacity = status === 'dimmed' ? 0.15 : 1

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(node.id)
          setCursor(true)
        }}
        onPointerOut={() => {
          setHovered(null)
          setCursor(false)
        }}
        onClick={(e) => {
          e.stopPropagation()
          setSelected(node.id)
        }}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          roughness={0.4}
          metalness={0.1}
          transparent
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
          fillOpacity={labelOpacity}
          outlineOpacity={labelOpacity}
        >
          {node.label}
        </Text>
      </Billboard>
    </group>
  )
})

const EDGE_COLOR: Record<EdgeStatus, string> = {
  idle: '#7dd3fc',
  highlight: '#bae6fd',
  dimmed: '#7dd3fc',
}

function edgeOpacity(edge: StackEdge, status: EdgeStatus): number {
  const base = 0.1 + edge.strength * 0.12
  if (status === 'highlight') return Math.min(base * 2.5, 0.95)
  if (status === 'dimmed') return base * 0.2
  return base
}

const EdgeLine = memo(function EdgeLine({ edge }: { edge: StackEdge }) {
  const start = nodePositions.get(edge.source)!
  const end = nodePositions.get(edge.target)!

  const status = useSelectionStore((s) => edgeStatus(edge.source, edge.target, activeId(s)))
  const lineRef = useRef<Line2>(null)
  const targetOpacity = useRef(edgeOpacity(edge, status))
  targetOpacity.current = edgeOpacity(edge, status)

  useFrame((_, delta) => {
    const line = lineRef.current
    if (!line) return
    const t = Math.min(delta * 10, 1)
    line.material.opacity += (targetOpacity.current - line.material.opacity) * t
  })

  return (
    <Line
      ref={lineRef}
      points={[start, end] as Vec3[]}
      color={EDGE_COLOR[status]}
      transparent
      opacity={edgeOpacity(edge, status)}
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
