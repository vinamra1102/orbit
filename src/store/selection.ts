import { create } from 'zustand'

interface SelectionState {
  hoveredId: string | null
  selectedId: string | null
  setHovered: (id: string | null) => void
  setSelected: (id: string | null) => void
  clear: () => void
}

export const useSelectionStore = create<SelectionState>((set) => ({
  hoveredId: null,
  selectedId: null,
  setHovered: (id) => set({ hoveredId: id }),
  setSelected: (id) => set({ selectedId: id }),
  clear: () => set({ hoveredId: null, selectedId: null }),
}))

/** The node driving highlight state: hover wins over selection. */
export function activeId(state: { hoveredId: string | null; selectedId: string | null }) {
  return state.hoveredId ?? state.selectedId
}
