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
  certWatch: {
    name: 'CertWatch',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/CertWatch-certificate_checker-Frontend-',
    dateRange: '2026 – present',
  },
  webVulnScanner: {
    name: 'Web Vulnerability Scanner',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/webVulnerabilityScanner',
    dateRange: '2025 – 2026',
  },
  sqliteForensic: {
    name: 'SQLite Forensic Recovery Tool',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/sqlite-forensic-recovery-tool',
    dateRange: '2025',
  },
  promptFirewall: {
    name: 'Prompt Firewall',
    role: 'Developer',
    link: 'https://github.com/vinamra1102',
    dateRange: '2024',
  },
  tanstackPR: {
    name: 'TanStack Query PR #10747',
    role: 'Contributor',
    link: 'https://github.com/TanStack/query/pull/10747',
    dateRange: '2026',
  },
  certWatchBackend: {
    name: 'CertWatch Backend',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/CertWatch-certificate_checker-Backend-',
    dateRange: '2026',
  },
  orbitSite: {
    name: 'Orbit (this site)',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/orbit',
    dateRange: '2026',
  },
  pdfMark: {
    name: 'PDF Mark',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/pdf-mark-pdf-to-markdown',
    dateRange: '2026',
  },
  hydroLock: {
    name: 'HydroLock',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/HydroLock',
    dateRange: '2026',
  },
  herEcom: {
    name: 'Her-Ecom',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/Her-Ecom',
    dateRange: '2026',
  },
  meApiPlayground: {
    name: 'ME API Playground',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/ME-API-Playground',
    dateRange: '2025',
  },
  stryderFrontend: {
    name: 'Stryder Frontend',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/stryder-frontend',
    dateRange: '2026',
  },
  stryderBackend: {
    name: 'Stryder Backend',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/stryder-backend',
    dateRange: '2026',
  },
  taskflow: {
    name: 'TaskFlow',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/taskflow',
    dateRange: '2026',
  },
  mintSlot: {
    name: 'MintSlot',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/mintSlot',
    dateRange: '2026',
  },
  nudgeLanding: {
    name: 'Nudge Landing Page',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/Nudge-Landing-Page',
    dateRange: '2026',
  },
  portfolio: {
    name: 'Portfolio',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/portfolio',
    dateRange: '2026',
  },
  resumeProfile: {
    name: 'Resume Website',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/resume_profile',
    dateRange: '2026',
  },
  birthdaySurprise: {
    name: 'Birthday Surprise',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/birthday-surprise',
    dateRange: '2026',
  },
  afnoPasal: {
    name: 'Afno Pasal MVP',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/afno-pasal-mvp',
    dateRange: '2026',
  },
  qreadscan: {
    name: 'QReadScan',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/qreadscan',
    dateRange: '2025',
  },
  jobScrape: {
    name: 'Job Scrape',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/Job-Scrape',
    dateRange: '2025',
  },
  urlShortener: {
    name: 'URL Shortener',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/URL-Shortner',
    dateRange: '2025',
  },
  gigFinder: {
    name: 'GigFinder',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/GigFinder',
    dateRange: '2026',
  },
  foodCalorie: {
    name: 'Food Calorie Estimator',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/Food_Calorie_Estimator',
    dateRange: '2026',
  },
  pong3d: {
    name: '3D Pong',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/Pong',
    dateRange: '2026',
  },
  portScanner: {
    name: 'Port Scanner',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/PortScanner',
    dateRange: '2025',
  },
  hasherTool: {
    name: 'Hasher Tool',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/Hasher-tool',
    dateRange: '2025',
  },
  hashiraAssignment: {
    name: 'Hashira Assignment',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/Hashira-Assignment',
    dateRange: '2025',
  },
  leetcodeQuestions: {
    name: 'LeetCode Questions',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/LeetCode-Questions',
    dateRange: '2025',
  },
  shiftCipher: {
    name: 'Shift Cipher (Lex/C)',
    role: 'Developer',
    link: 'https://github.com/vinamra1102/ShiftCipher-UsingLex',
    dateRange: '2025 – 2026',
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
  // Tech per repo detected from GitHub language stats and manifests
  // (package.json, requirements.txt, Dockerfile, lockfiles).
  certWatchBackend: ['typescript', 'nodejs', 'rest', 'jwt', 'docker'],
  orbitSite: ['typescript', 'react', 'html', 'css'],
  pdfMark: ['typescript', 'nextjs', 'react', 'python', 'docker', 'pnpm'],
  hydroLock: ['typescript', 'react', 'postgresql', 'css', 'html'],
  herEcom: ['typescript', 'nextjs', 'react', 'css'],
  meApiPlayground: ['javascript', 'nodejs', 'rest', 'mongodb', 'html', 'css'],
  stryderFrontend: ['typescript', 'react', 'css'],
  stryderBackend: ['python', 'rest'],
  taskflow: ['typescript', 'python', 'css', 'html'],
  mintSlot: ['javascript', 'react', 'html', 'css'],
  nudgeLanding: ['typescript', 'react', 'css', 'html'],
  portfolio: ['typescript', 'nextjs', 'react', 'css'],
  resumeProfile: ['typescript', 'nextjs', 'react', 'css'],
  birthdaySurprise: ['typescript', 'nextjs', 'react', 'css'],
  afnoPasal: ['javascript', 'typescript', 'python'],
  qreadscan: ['python', 'html', 'javascript', 'css'],
  jobScrape: ['python', 'html'],
  urlShortener: ['python'],
  gigFinder: ['python'],
  foodCalorie: ['python'],
  pong3d: ['python'],
  portScanner: ['python'],
  hasherTool: ['python'],
  hashiraAssignment: ['java'],
  leetcodeQuestions: ['java'],
  shiftCipher: ['c', 'lex'],
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
  { id: 'c', label: 'C', category: 'language', weight: 3 },

  // Frontend
  { id: 'react', label: 'React', category: 'frontend', weight: 8 },
  { id: 'nextjs', label: 'Next.js', category: 'frontend', weight: 6 },
  { id: 'html', label: 'HTML', category: 'frontend', weight: 4 },
  { id: 'css', label: 'CSS', category: 'frontend', weight: 4 },

  // Backend
  { id: 'nodejs', label: 'Node.js', category: 'backend', weight: 6 },
  { id: 'flask', label: 'Flask', category: 'backend', weight: 5 },

  // Databases
  { id: 'sqlite', label: 'SQLite', category: 'database', weight: 5 },
  { id: 'postgresql', label: 'PostgreSQL', category: 'database', weight: 5 },
  { id: 'mongodb', label: 'MongoDB', category: 'database', weight: 4 },

  // APIs
  { id: 'rest', label: 'REST', category: 'api', weight: 6 },
  { id: 'jwt', label: 'JWT', category: 'api', weight: 5 },
  { id: 'firebase', label: 'Firebase', category: 'api', weight: 6 },

  // DevTools
  { id: 'git', label: 'Git', category: 'devtool', weight: 6 },
  { id: 'docker', label: 'Docker', category: 'devtool', weight: 5 },
  { id: 'pnpm', label: 'pnpm', category: 'devtool', weight: 3 },
  { id: 'vitest', label: 'Vitest', category: 'devtool', weight: 5 },
  { id: 'lex', label: 'Lex', category: 'devtool', weight: 2 },

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
