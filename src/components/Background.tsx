import { memo } from 'react'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'

// Deep-space backdrop: a huge inward-facing sphere with a navy-to-black
// radial gradient and two very faint nebula tints (purple, blue), plus a
// sparse dim starfield far behind the constellation.

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  varying vec3 vDir;

  void main() {
    // Radial falloff: slightly lighter toward screen centre-ish axis.
    float centre = smoothstep(-0.2, 1.0, vDir.z * 0.5 + 0.5);
    vec3 base = mix(vec3(0.008, 0.008, 0.016), vec3(0.028, 0.034, 0.066), centre);

    // Two soft nebula tints, low opacity, no detail.
    float nebA = smoothstep(0.85, 0.0, distance(vDir, normalize(vec3(-0.55, 0.35, 0.35))));
    float nebB = smoothstep(0.9, 0.0, distance(vDir, normalize(vec3(0.6, -0.3, -0.2))));
    base += vec3(0.055, 0.03, 0.09) * nebA * 0.55; // faint purple
    base += vec3(0.02, 0.045, 0.085) * nebB * 0.45; // faint blue

    gl_FragColor = vec4(base, 1.0);
  }
`

function Background() {
  return (
    <>
      <mesh scale={200} frustumCulled={false}>
        <sphereGeometry args={[1, 32, 32]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <Stars radius={70} depth={40} count={1600} factor={2} saturation={0} fade speed={0.4} />
    </>
  )
}

export default memo(Background)
