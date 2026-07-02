import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { nodePositions } from '../lib/layout'
import { useSelectionStore } from '../store/selection'
import { cursorTarget } from '../lib/cursorTarget'

const projected = new THREE.Vector3()

/**
 * Mounted inside the R3F Canvas. Each frame, if a node is hovered, project
 * its world position to viewport coordinates so the DOM cursor overlay can
 * snap the reticle onto the node center. Also attaches
 * pointerenter/pointerleave on the canvas element to track whether the
 * pointer is over the 3D surface at all.
 */
export function CursorProjector() {
  const { camera, gl } = useThree()

  useEffect(() => {
    const canvas = gl.domElement
    const onEnter = () => {
      cursorTarget.overCanvas = true
    }
    const onLeave = () => {
      cursorTarget.overCanvas = false
    }
    canvas.addEventListener('pointerenter', onEnter)
    canvas.addEventListener('pointerleave', onLeave)
    return () => {
      canvas.removeEventListener('pointerenter', onEnter)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [gl])

  useFrame(() => {
    const hoveredId = useSelectionStore.getState().hoveredId
    if (!hoveredId) return
    const pos = nodePositions.get(hoveredId)
    if (!pos) return
    projected.set(pos[0], pos[1], pos[2]).project(camera)
    const rect = gl.domElement.getBoundingClientRect()
    cursorTarget.snapX = (projected.x * 0.5 + 0.5) * rect.width + rect.left
    cursorTarget.snapY = (-projected.y * 0.5 + 0.5) * rect.height + rect.top
  })

  return null
}

// Cool default core / warm hero-accent core when hovering a node, plus the
// cooler trail tint. All drawn additively so overlaps read as glow.
type RGB = [number, number, number]
const CORE_COOL: RGB = [200, 212, 232] // #c8d4e8
const CORE_WARM: RGB = [255, 207, 135] // #ffcf87 (hero accent)
const TRAIL_COOL: RGB = [143, 179, 217] // #8fb3d9
const TRAIL_WARM: RGB = [255, 207, 135]

const POOL = 14 // fixed-size, reused trail buffer — no per-frame allocation
const BURST_MS = 150

function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

/**
 * Comet-trail cursor. A full-viewport 2D <canvas> overlay (fixed,
 * pointer-events: none) driven entirely by rAF + direct canvas draws, so no
 * React re-render happens on mousemove. A glowing core dot leads a tapering
 * trail of recent head positions; the trail stretches on fast moves and
 * bunches on slow ones because the head lerps toward its target with lag.
 * Hovering a node snaps the core to the node's projected screen center,
 * warms/brightens the comet, and lengthens the tail; clicking scatters the
 * trail outward and pulses the core. Hides over UI chrome (data-cursor-hide)
 * or off-canvas. Falls back to a plain static dot under prefers-reduced-motion.
 */
export function Cursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      // Draw in CSS pixels; the transform absorbs the dpr scale.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    // Rendered head state and the reused trail ring buffer.
    let headX = cursorTarget.mouseX
    let headY = cursorTarget.mouseY
    let vis = 0 // eased visibility 0..1
    let hover = 0 // eased hover 0..1
    let clickAt = -Infinity
    const trailX = new Float32Array(POOL).fill(headX)
    const trailY = new Float32Array(POOL).fill(headY)
    const burstA = new Float32Array(POOL) // per-slot scatter angle, set once
    for (let i = 0; i < POOL; i++) burstA[i] = Math.random() * Math.PI * 2
    let writeIdx = 0

    const onMove = (e: MouseEvent) => {
      cursorTarget.mouseX = e.clientX
      cursorTarget.mouseY = e.clientY
      // Geometric bounding-rect check for all [data-cursor-hide] regions.
      // (elementsFromPoint would miss pointer-events: none elements, which
      // includes the Header.)
      const chromeEls = document.querySelectorAll<HTMLElement>('[data-cursor-hide]')
      let overChrome = false
      for (const el of chromeEls) {
        const r = el.getBoundingClientRect()
        if (
          e.clientX >= r.left &&
          e.clientX <= r.right &&
          e.clientY >= r.top &&
          e.clientY <= r.bottom
        ) {
          overChrome = true
          break
        }
      }
      cursorTarget.overChrome = overChrome
    }

    const onLeaveWindow = () => {
      cursorTarget.overCanvas = false
    }
    const onDown = () => {
      clickAt = performance.now()
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('resize', resize)
    document.documentElement.addEventListener('pointerleave', onLeaveWindow)

    const drawBlob = (px: number, py: number, r: number, color: RGB, alpha: number, glow: number) => {
      if (alpha <= 0.002 || r <= 0.05) return
      ctx.globalAlpha = Math.min(alpha, 1)
      ctx.fillStyle = `rgb(${color[0] | 0}, ${color[1] | 0}, ${color[2] | 0})`
      ctx.shadowColor = ctx.fillStyle
      ctx.shadowBlur = glow
      ctx.beginPath()
      ctx.arc(px, py, r, 0, Math.PI * 2)
      ctx.fill()
    }

    let rafId = 0
    const tick = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      ctx.clearRect(0, 0, w, h)

      const hoveredId = useSelectionStore.getState().hoveredId
      const rawVisible = cursorTarget.overCanvas && !cursorTarget.overChrome
      const snapping = hoveredId !== null && rawVisible

      const targetX = snapping ? cursorTarget.snapX : cursorTarget.mouseX
      const targetY = snapping ? cursorTarget.snapY : cursorTarget.mouseY

      // Reduced motion: plain static dot, no trail, no easing, no burst.
      if (reducedMotion) {
        if (rawVisible) drawBlob(cursorTarget.mouseX, cursorTarget.mouseY, 3, CORE_COOL, 1, 6)
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
        rafId = requestAnimationFrame(tick)
        return
      }

      vis += ((rawVisible ? 1 : 0) - vis) * 0.2
      hover += ((snapping ? 1 : 0) - hover) * 0.15

      // Snap tracks a touch tighter than free movement so the reticle-like
      // lock onto a node feels deliberate.
      const ease = snapping ? 0.3 : 0.22
      headX += (targetX - headX) * ease
      headY += (targetY - headY) * ease

      // While hidden, collapse the trail onto the head so re-entry doesn't
      // draw a streak from the last on-screen position.
      if (vis < 0.02) {
        for (let i = 0; i < POOL; i++) {
          trailX[i] = headX
          trailY[i] = headY
        }
        ctx.globalAlpha = 1
        ctx.shadowBlur = 0
        rafId = requestAnimationFrame(tick)
        return
      }

      // Record the head into the ring buffer once per frame.
      trailX[writeIdx] = headX
      trailY[writeIdx] = headY
      writeIdx = (writeIdx + 1) % POOL
      const newest = (writeIdx - 1 + POOL) % POOL

      const bt = (performance.now() - clickAt) / BURST_MS // 0..1 during burst
      const bursting = bt >= 0 && bt < 1
      const burstOut = bursting ? 1 - bt : 0

      const coreColor = mix(CORE_COOL, CORE_WARM, hover)
      const trailColor = mix(TRAIL_COOL, TRAIL_WARM, hover)

      // Additive blending: overlapping trail + core accumulate into glow.
      ctx.globalCompositeOperation = 'lighter'

      // Trail: oldest (k=0) tapers to nothing, newest handled by the core.
      for (let k = 0; k < POOL; k++) {
        const idx = (writeIdx + k) % POOL
        if (idx === newest) continue
        const t = k / (POOL - 1) // 0 oldest .. 1 newest
        let px = trailX[idx]
        let py = trailY[idx]
        if (bursting) {
          // Older particles scatter further; whole burst decays outward.
          const mag = burstOut * 16 * (1 - t)
          px += Math.cos(burstA[idx]) * mag
          py += Math.sin(burstA[idx]) * mag
        }
        const lenBoost = 1 + hover * 0.45 // gravity from the node lengthens it
        let a = t * t * (0.5 + hover * 0.35) * lenBoost * vis
        if (bursting) a *= 1 - bt // fade faster mid-burst
        const r = 0.6 + 2.2 * t
        drawBlob(px, py, r, trailColor, a, 6 + hover * 4)
      }

      // Core dot: brighter/larger glow on hover, quick scale pop on click.
      const coreScale = bursting ? 1 + 0.6 * Math.sin(bt * Math.PI) : 1
      const coreR = (2.8 + hover * 1.4) * coreScale
      const coreGlow = 8 + hover * 18
      drawBlob(headX, headY, coreR, coreColor, vis, coreGlow)

      // Reset shared state so nothing else (or the next frame) inherits it.
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      ctx.shadowBlur = 0

      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('resize', resize)
      document.documentElement.removeEventListener('pointerleave', onLeaveWindow)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 h-screen w-screen"
    />
  )
}
