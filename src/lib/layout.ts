import { nodes, edges, type Category } from '../data/stack'

export type Vec3 = [number, number, number]

// Deterministic PRNG so the layout is identical on every load.
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Rough angular home for each category so clusters read as regions
// of the constellation rather than a uniform ball.
const CATEGORY_CENTERS: Record<Category, Vec3> = {
  language: [0, 0.5, 0],
  frontend: [-3.5, 1.5, 1],
  backend: [3.5, 1.5, -1],
  database: [3, -2.5, 1.5],
  api: [-0.5, -3, -1.5],
  security: [-3.5, -1, -2.5],
  devtool: [0.5, 3.5, -2],
}

/**
 * Simple force-directed layout, run once at module load — no live physics.
 * Nodes repel each other, edges act as springs, and each node is gently
 * pulled toward its category's home region.
 */
function computeLayout(): Map<string, Vec3> {
  const rand = mulberry32(42)
  const index = new Map(nodes.map((n, i) => [n.id, i]))
  const pos: Vec3[] = nodes.map((n) => {
    const c = CATEGORY_CENTERS[n.category]
    return [c[0] + (rand() - 0.5) * 2, c[1] + (rand() - 0.5) * 2, c[2] + (rand() - 0.5) * 2]
  })

  // Tuned for a dense graph: with edges derived from ~30 projects the hub
  // nodes would otherwise collapse into a knot, so repulsion is strong and
  // springs are soft.
  const REPULSION = 14.0
  const SPRING = 0.015
  const SPRING_LENGTH = 4.0
  const CATEGORY_PULL = 0.015
  const ITERATIONS = 300

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const force: Vec3[] = nodes.map(() => [0, 0, 0])

    // Pairwise repulsion.
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = pos[i][0] - pos[j][0]
        const dy = pos[i][1] - pos[j][1]
        const dz = pos[i][2] - pos[j][2]
        const distSq = Math.max(dx * dx + dy * dy + dz * dz, 0.01)
        const dist = Math.sqrt(distSq)
        const f = REPULSION / distSq
        force[i][0] += (dx / dist) * f
        force[i][1] += (dy / dist) * f
        force[i][2] += (dz / dist) * f
        force[j][0] -= (dx / dist) * f
        force[j][1] -= (dy / dist) * f
        force[j][2] -= (dz / dist) * f
      }
    }

    // Edge springs.
    for (const edge of edges) {
      const i = index.get(edge.source)!
      const j = index.get(edge.target)!
      const dx = pos[j][0] - pos[i][0]
      const dy = pos[j][1] - pos[i][1]
      const dz = pos[j][2] - pos[i][2]
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy + dz * dz), 0.01)
      const f = SPRING * (dist - SPRING_LENGTH) * edge.strength
      force[i][0] += (dx / dist) * f
      force[i][1] += (dy / dist) * f
      force[i][2] += (dz / dist) * f
      force[j][0] -= (dx / dist) * f
      force[j][1] -= (dy / dist) * f
      force[j][2] -= (dz / dist) * f
    }

    // Pull toward category home.
    for (let i = 0; i < nodes.length; i++) {
      const c = CATEGORY_CENTERS[nodes[i].category]
      force[i][0] += (c[0] - pos[i][0]) * CATEGORY_PULL
      force[i][1] += (c[1] - pos[i][1]) * CATEGORY_PULL
      force[i][2] += (c[2] - pos[i][2]) * CATEGORY_PULL
    }

    // Cooling step size.
    const step = 0.05 * (1 - iter / ITERATIONS) + 0.005
    for (let i = 0; i < nodes.length; i++) {
      pos[i][0] += force[i][0] * step
      pos[i][1] += force[i][1] * step
      pos[i][2] += force[i][2] * step
    }
  }

  // Recenter on the centroid and scale so the whole constellation fits
  // comfortably in the default camera frame.
  const centroid: Vec3 = [0, 0, 0]
  for (const p of pos) {
    centroid[0] += p[0] / pos.length
    centroid[1] += p[1] / pos.length
    centroid[2] += p[2] / pos.length
  }
  let maxDist = 0
  for (const p of pos) {
    const dx = p[0] - centroid[0]
    const dy = p[1] - centroid[1]
    const dz = p[2] - centroid[2]
    maxDist = Math.max(maxDist, Math.sqrt(dx * dx + dy * dy + dz * dz))
  }
  const scale = 6 / maxDist
  for (const p of pos) {
    p[0] = (p[0] - centroid[0]) * scale
    p[1] = (p[1] - centroid[1]) * scale
    p[2] = (p[2] - centroid[2]) * scale
  }

  return new Map(nodes.map((n) => [n.id, pos[index.get(n.id)!]]))
}

export const nodePositions: Map<string, Vec3> = computeLayout()

export function radiusFor(weight: number): number {
  return 0.22 + weight * 0.055
}

export const CATEGORY_COLORS: Record<Category, string> = {
  language: '#f5b942', // amber
  frontend: '#38bdf8', // sky blue
  backend: '#34d399', // emerald
  database: '#a78bfa', // violet
  api: '#f472b6', // pink
  security: '#f43f5e', // red — must read distinctly from frontend/backend
  devtool: '#94a3b8', // slate
}

export const CATEGORY_LABELS: Record<Category, string> = {
  language: 'Language',
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Database',
  api: 'APIs & Auth',
  security: 'Security',
  devtool: 'Dev Tools',
}
