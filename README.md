# Orbit

An interactive 3D tech stack constellation — my stack and real project history rendered as a navigable node graph.

Each sphere is a technology, sized by how much I use it and colored by category. Edges connect technologies that shipped together in a real project — the more projects they share, the stronger the line. Hover a node to light up its neighborhood; click it to inspect the projects behind it.

![Orbit demo](docs/demo.gif)
<!-- TODO: replace with an actual gif/screenshot of the constellation -->

## Features

- Precomputed force-directed 3D layout (no live physics) with category clustering
- Idle auto-rotate camera that pauses while you interact and resumes after 5s
- Hover highlighting: connected nodes and edges brighten, everything else dims
- Click-to-inspect side panel with each technology's project history
- Selection state kept out of the scene graph via narrow zustand selectors, so hover never re-renders the full constellation

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | React 19 + TypeScript + Vite |
| 3D | react-three-fiber + @react-three/drei (three.js) |
| State | zustand |
| UI chrome | Tailwind CSS |
| Panel transitions | framer-motion |

## Running locally

```bash
npm install
npm run dev
```

## Data

All nodes, edges, and project mappings live in [`src/data/stack.ts`](src/data/stack.ts). Edges are derived, not hand-drawn: two technologies get an edge if they co-occur in a project, with strength equal to the number of shared projects.
