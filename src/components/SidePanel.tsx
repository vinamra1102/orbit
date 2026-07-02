import { AnimatePresence, motion } from 'framer-motion'
import { nodes } from '../data/stack'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../lib/layout'
import { useSelectionStore } from '../store/selection'

function SidePanel() {
  const selectedId = useSelectionStore((s) => s.selectedId)
  const setSelected = useSelectionStore((s) => s.setSelected)
  const node = nodes.find((n) => n.id === selectedId)

  return (
    <AnimatePresence>
      {node && (
        <motion.aside
          key={node.id}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
          className="fixed right-0 top-0 z-10 flex h-full w-80 flex-col gap-5 overflow-y-auto border-l border-white/10 bg-slate-950/85 p-6 backdrop-blur-md"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">{node.label}</h2>
              <span
                className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  color: CATEGORY_COLORS[node.category],
                  backgroundColor: `${CATEGORY_COLORS[node.category]}1f`,
                }}
              >
                {CATEGORY_LABELS[node.category]}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close panel"
              className="rounded-md p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-100"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
              Projects
            </h3>
            {node.projects.length === 0 ? (
              <p className="text-sm text-slate-400">
                Part of my working toolkit — not tied to a showcased project yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {node.projects.map((project) => (
                  <li
                    key={project.name}
                    className="rounded-lg border border-white/10 bg-white/5 p-3"
                  >
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-sky-300 hover:underline"
                    >
                      {project.name}
                    </a>
                    <p className="mt-1 text-xs text-slate-400">
                      {project.role} · {project.dateRange}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

export default SidePanel
