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

const DOT_COLOR = '#c8d4e8'
const RETICLE_COLOR = '#ffcf87'

/**
 * DOM overlay cursor. Fixed-position, pointer-events: none, driven by rAF
 * to keep hover state out of React's render loop. Morphs between a soft
 * dot (default) and a snap-locked reticle (hovering a node), pulses on
 * click, and hides entirely when the pointer is over UI chrome (elements
 * marked with data-cursor-hide) or outside the window.
 */
export function Cursor() {
  const rootRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const reticleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const dot = dotRef.current
    const reticle = reticleRef.current
    if (!root || !dot || !reticle) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Rendered state — lerps toward cursorTarget each frame.
    let x = -100
    let y = -100
    let morph = 0 // 0 = pure dot, 1 = pure reticle
    let clickAt = -Infinity

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
    document.documentElement.addEventListener('pointerleave', onLeaveWindow)

    // Initialise render position to current mouse so first frame doesn't
    // fly in from off-screen.
    x = cursorTarget.mouseX
    y = cursorTarget.mouseY

    let rafId = 0
    const tick = () => {
      const hoveredId = useSelectionStore.getState().hoveredId
      const visible = cursorTarget.overCanvas && !cursorTarget.overChrome
      const snapping = hoveredId !== null && visible

      const targetX = snapping ? cursorTarget.snapX : cursorTarget.mouseX
      const targetY = snapping ? cursorTarget.snapY : cursorTarget.mouseY

      if (reducedMotion) {
        x = targetX
        y = targetY
        morph = snapping ? 1 : 0
      } else {
        x += (targetX - x) * 0.22
        y += (targetY - y) * 0.22
        morph += ((snapping ? 1 : 0) - morph) * 0.18
      }

      // Click pulse — ~100ms scale dip, quick recovery.
      const dt = performance.now() - clickAt
      const pulse = !reducedMotion && dt < 100 ? 0.82 : 1

      // Snapped hover slightly boosts brightness to match node highlight.
      const glowBoost = 1 + morph * 0.35

      root.style.transform = `translate3d(${x}px, ${y}px, 0)`
      root.style.opacity = visible ? '1' : '0'

      const dotAlpha = (1 - morph) * pulse * glowBoost
      dot.style.opacity = String(Math.min(1, dotAlpha))
      dot.style.transform = `translate(-50%, -50%) scale(${pulse})`

      const reticleAlpha = morph * pulse
      reticle.style.opacity = String(reticleAlpha)
      reticle.style.transform = `translate(-50%, -50%) scale(${(0.75 + morph * 0.25) * pulse})`

      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.documentElement.removeEventListener('pointerleave', onLeaveWindow)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-50"
      style={{ opacity: 0, willChange: 'transform, opacity', transition: 'opacity 120ms ease' }}
    >
      <div ref={dotRef} className="absolute" style={{ transform: 'translate(-50%, -50%)' }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: DOT_COLOR,
            boxShadow: `0 0 12px 2px ${DOT_COLOR}66, 0 0 4px 1px ${DOT_COLOR}cc`,
          }}
        />
      </div>
      <div
        ref={reticleRef}
        className="absolute"
        style={{ transform: 'translate(-50%, -50%)', opacity: 0 }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle
            cx="16"
            cy="16"
            r="10"
            stroke={RETICLE_COLOR}
            strokeWidth="1"
            opacity="0.9"
            style={{ filter: `drop-shadow(0 0 3px ${RETICLE_COLOR})` }}
          />
          <line x1="16" y1="1" x2="16" y2="5" stroke={RETICLE_COLOR} strokeWidth="1" opacity="0.75" />
          <line
            x1="16"
            y1="27"
            x2="16"
            y2="31"
            stroke={RETICLE_COLOR}
            strokeWidth="1"
            opacity="0.75"
          />
          <line x1="1" y1="16" x2="5" y2="16" stroke={RETICLE_COLOR} strokeWidth="1" opacity="0.75" />
          <line
            x1="27"
            y1="16"
            x2="31"
            y2="16"
            stroke={RETICLE_COLOR}
            strokeWidth="1"
            opacity="0.75"
          />
        </svg>
      </div>
    </div>
  )
}
