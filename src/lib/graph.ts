import { edges } from '../data/stack'

/** node id -> ids of nodes it shares an edge with */
export const adjacency: Map<string, Set<string>> = (() => {
  const map = new Map<string, Set<string>>()
  for (const edge of edges) {
    if (!map.has(edge.source)) map.set(edge.source, new Set())
    if (!map.has(edge.target)) map.set(edge.target, new Set())
    map.get(edge.source)!.add(edge.target)
    map.get(edge.target)!.add(edge.source)
  }
  return map
})()

export type NodeStatus = 'idle' | 'active' | 'connected' | 'dimmed'
export type EdgeStatus = 'idle' | 'highlight' | 'dimmed'

export function nodeStatus(nodeId: string, active: string | null): NodeStatus {
  if (!active) return 'idle'
  if (nodeId === active) return 'active'
  if (adjacency.get(active)?.has(nodeId)) return 'connected'
  return 'dimmed'
}

export function edgeStatus(source: string, target: string, active: string | null): EdgeStatus {
  if (!active) return 'idle'
  if (source === active || target === active) return 'highlight'
  return 'dimmed'
}
