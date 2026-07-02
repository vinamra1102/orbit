export type Category =
  | 'language'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'api'
  | 'security'
  | 'devtool'

export interface Project {
  name: string
  role: string
  link: string
  dateRange: string
}

// Named StackNode/StackEdge (not Node/Edge) to avoid shadowing the DOM's global Node type.
export interface StackNode {
  id: string
  label: string
  category: Category
  /** 1-10, drives sphere radius */
  weight: number
  projects: Project[]
}

export interface StackEdge {
  source: string
  target: string
  /** 1-3, number of shared projects */
  strength: number
}

const PROJECTS = {
  certWatch: { name: 'CertWatch', role: 'Developer', link: '#', dateRange: '2024' },
  webVulnScanner: {
    name: 'Web Vulnerability Scanner',
    role: 'Developer',
    link: '#',
    dateRange: '2024',
  },
  sqliteForensic: {
    name: 'SQLite Forensic Recovery Tool',
    role: 'Developer',
    link: '#',
    dateRange: '2024',
  },
  promptFirewall: { name: 'Prompt Firewall', role: 'Developer', link: '#', dateRange: '2024' },
  tanstackPR: {
    name: 'TanStack Query PR #10747',
    role: 'Developer',
    link: '#',
    dateRange: '2024',
  },
} satisfies Record<string, Project>

// Which node ids each project touches — the single source of truth used to
// derive both each node's `projects` list and the edges between nodes.
const PROJECT_NODES: Record<keyof typeof PROJECTS, string[]> = {
  certWatch: ['typescript', 'nextjs', 'react', 'firebase'],
  webVulnScanner: ['react', 'python', 'flask', 'rest', 'owasp-top-10'],
  sqliteForensic: ['python', 'sqlite'],
  promptFirewall: ['typescript', 'nodejs', 'python'],
  tanstackPR: ['typescript', 'javascript', 'vitest', 'git'],
}

function projectsFor(nodeId: string): Project[] {
  return (Object.keys(PROJECT_NODES) as (keyof typeof PROJECTS)[])
    .filter((key) => PROJECT_NODES[key].includes(nodeId))
    .map((key) => PROJECTS[key])
}

type SeedNode = Omit<StackNode, 'projects'>

const SEED_NODES: SeedNode[] = [
  // Languages
  { id: 'python', label: 'Python', category: 'language', weight: 9 },
  { id: 'java', label: 'Java', category: 'language', weight: 5 },
  { id: 'javascript', label: 'JavaScript', category: 'language', weight: 7 },
  { id: 'typescript', label: 'TypeScript', category: 'language', weight: 9 },

  // Frontend
  { id: 'react', label: 'React', category: 'frontend', weight: 8 },
  { id: 'nextjs', label: 'Next.js', category: 'frontend', weight: 6 },
  { id: 'html', label: 'HTML', category: 'frontend', weight: 4 },
  { id: 'css', label: 'CSS', category: 'frontend', weight: 4 },

  // Backend
  { id: 'nodejs', label: 'Node.js', category: 'backend', weight: 6 },
  { id: 'flask', label: 'Flask', category: 'backend', weight: 5 },
  { id: 'spring-boot', label: 'Spring Boot', category: 'backend', weight: 5 },

  // Databases
  { id: 'mysql', label: 'MySQL', category: 'database', weight: 4 },
  { id: 'sqlite', label: 'SQLite', category: 'database', weight: 5 },
  { id: 'postgresql', label: 'PostgreSQL', category: 'database', weight: 5 },
  { id: 'mongodb', label: 'MongoDB', category: 'database', weight: 4 },

  // APIs
  { id: 'rest', label: 'REST', category: 'api', weight: 6 },
  { id: 'graphql', label: 'GraphQL', category: 'api', weight: 4 },
  { id: 'oauth2', label: 'OAuth 2.0', category: 'api', weight: 5 },
  { id: 'jwt', label: 'JWT', category: 'api', weight: 5 },
  { id: 'firebase', label: 'Firebase', category: 'api', weight: 6 },

  // DevTools
  { id: 'git', label: 'Git', category: 'devtool', weight: 6 },
  { id: 'docker', label: 'Docker', category: 'devtool', weight: 5 },
  { id: 'pnpm', label: 'pnpm', category: 'devtool', weight: 3 },
  { id: 'vitest', label: 'Vitest', category: 'devtool', weight: 5 },

  // Security
  { id: 'wireshark', label: 'Wireshark', category: 'security', weight: 5 },
  { id: 'nmap', label: 'Nmap', category: 'security', weight: 5 },
  { id: 'metasploit', label: 'Metasploit', category: 'security', weight: 5 },
  { id: 'owasp-top-10', label: 'OWASP Top 10', category: 'security', weight: 7 },
  { id: 'nist-csf', label: 'NIST CSF', category: 'security', weight: 5 },
]

export const nodes: StackNode[] = SEED_NODES.map((node) => ({
  ...node,
  projects: projectsFor(node.id),
}))

function deriveEdges(): StackEdge[] {
  const counts = new Map<string, number>()

  for (const nodeIds of Object.values(PROJECT_NODES)) {
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        const key = [nodeIds[i], nodeIds[j]].sort().join('|')
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
  }

  return Array.from(counts.entries()).map(([key, count]) => {
    const [source, target] = key.split('|')
    return { source, target, strength: Math.min(count, 3) }
  })
}

export const edges: StackEdge[] = deriveEdges()
