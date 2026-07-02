import { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Line, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { Group, Mesh, MeshBasicMaterial } from 'three'
import type { Line2 } from 'three-stdlib'
import { nodes, edges, type StackNode, type StackEdge } from '../data/stack'
import { nodePositions, radiusFor, colorFor, HERO_ID, type Vec3 } from '../lib/layout'
import { nodeStatus, edgeStatus, type NodeStatus, type EdgeStatus } from '../lib/graph'
import { useSelectionStore, activeId } from '../store/selection'
import Background from './Background'

const NODE_SCALE: Record<NodeStatus, number> = {
  idle: 1,
  active: 1.25,
  connected: 1.12,
  dimmed: 1,
}

const NODE_OPACITY: Record<NodeStatus, number> = {
  idle: 1,
  active: 1,
  connected: 1,
  dimmed: 0.25,
}

// Colour multiplier: >1 pushes the node past bloom threshold so it glows.
const NODE_GLOW: Record<NodeStatus, number> = {
  idle: 1.25,
  active: 3.2,
  connected: 2.1,
  dimmed: 0.4,
}

// The hero star glows noticeably above everything else at rest.
const HERO_GLOW_BOOST = 1.9

// Only the brightest stars carry a label at rest; the rest reveal on hover.
const LABEL_WEIGHT_THRESHOLD = 6

const NodeMesh = memo(function NodeMesh({ node }: { node: StackNode }) {
  const position = nodePositions.get(node.id)!
  const radius = radiusFor(node.weight)
  const isHero = node.id === HERO_ID
  const baseColor = useMemo(
    () => new THREE.Color(colorFor(node.id, node.category)),
    [node.id, node.category],
  )

  const status = useSelectionStore((s) => nodeStatus(node.id, activeId(s)))
  const setHovered = useSelectionStore((s) => s.setHovered)
  const setSelected = useSelectionStore((s) => s.setSelected)

  const groupRef = useRef<Group>(null)
  const meshRef = useRef<Mesh>(null)
  const glowRef = useRef(NODE_GLOW.idle)
  const targets = useRef({ scale: 1, opacity: 1, glow: NODE_GLOW.idle })
  targets.current = {
    scale: NODE_SCALE[status],
    opacity: NODE_OPACITY[status],
    glow: NODE_GLOW[status] * (isHero ? HERO_GLOW_BOOST : 1),
  }

  // Ease scale/opacity/glow toward their targets so hover transitions feel
  // smooth without re-rendering anything.
  useFrame((_, delta) => {
    const group = groupRef.current
    const mesh = meshRef.current
    if (!group || !mesh) return
    const t = Math.min(delta * 10, 1)
    const { scale, opacity, glow } = targets.current
    group.scale.setScalar(group.scale.x + (scale - group.scale.x) * t)
    const material = mesh.material as MeshBasicMaterial
    material.opacity += (opacity - material.opacity) * t
    glowRef.current += (glow - glowRef.current) * t
    material.color.copy(baseColor).multiplyScalar(glowRef.current)
  })

  const labelVisible =
    node.weight >= LABEL_WEIGHT_THRESHOLD || status === 'active' || status === 'connected'
  const labelOpacity = status === 'dimmed' ? 0.12 : 0.85

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(node.id)
        }}
        onPointerOut={() => {
          setHovered(null)
        }}
        onClick={(e) => {
          e.stopPropagation()
          setSelected(node.id)
        }}
      >
        <sphereGeometry args={[radius, 24, 24]} />
        <meshBasicMaterial
          color={baseColor.clone().multiplyScalar(NODE_GLOW.idle)}
          transparent
          toneMapped={false}
        />
      </mesh>
      {labelVisible && (
        <Billboard position={[0, radius + 0.14, 0]}>
          <Text
            fontSize={0.16}
            color="#c8d4e8"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.008}
            outlineColor="#04040a"
            fillOpacity={labelOpacity}
            outlineOpacity={labelOpacity * 0.8}
          >
            {node.label}
          </Text>
        </Billboard>
      )}
    </group>
  )
})

const EDGE_COLOR: Record<EdgeStatus, string> = {
  idle: '#8fb3d9',
  highlight: '#d6e6ff',
  dimmed: '#8fb3d9',
}

// Faint constellation lines: present but never competing with the stars.
function edgeOpacity(edge: StackEdge, status: EdgeStatus): number {
  const base = 0.1 + edge.strength * 0.06
  if (status === 'highlight') return Math.min(base * 3, 0.65)
  if (status === 'dimmed') return base * 0.15
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
      lineWidth={0.4 + edge.strength * 0.2}
    />
  )
})

function Scene() {
  return (
    <>
      <Background />
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
