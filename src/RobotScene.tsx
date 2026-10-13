import { Grid, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import { PARTS_BY_ID } from './catalog'
import type { PartDefinition, PartInstance, Project } from './types'

interface RobotSceneProps {
  project: Project
  selectedId: string | null
  onSelect: (id: string) => void
}

function PartShape({ definition }: { definition: PartDefinition }) {
  const [x, y, z] = definition.dimensions
  const material = <meshStandardMaterial color={definition.color} metalness={0.65} roughness={0.34} />
  if (definition.kind === 'channel') {
    return <group>
      <mesh position={[0, -y / 2 + 2, 0]}>{<boxGeometry args={[x, 4, z]} />}{material}</mesh>
      <mesh position={[0, 0, -z / 2 + 2]}>{<boxGeometry args={[x, y, 4]} />}{material}</mesh>
      <mesh position={[0, 0, z / 2 - 2]}>{<boxGeometry args={[x, y, 4]} />}{material}</mesh>
    </group>
  }
  if (definition.kind === 'wheel' || definition.kind === 'hub' || definition.kind === 'bearing') {
    return <mesh rotation={[0, 0, Math.PI / 2]}>{<cylinderGeometry args={[Math.max(y, z) / 2, Math.max(y, z) / 2, x, 28]} />}{material}</mesh>
  }
  if (definition.kind === 'shaft') {
    return <mesh rotation={[0, 0, Math.PI / 2]}>{<cylinderGeometry args={[y / 2, y / 2, x, 16]} />}{material}</mesh>
  }
  if (definition.kind === 'hardware') {
    return <group>
      <mesh>{<cylinderGeometry args={[x / 2, x / 2, y * 0.35, 20]} />}{material}</mesh>
      <mesh position={[0, -y * 0.42, 0]}>{<cylinderGeometry args={[2, 2, y * 0.65, 16]} />}{material}</mesh>
    </group>
  }
  if (definition.kind === 'motor') {
    return <group>
      <mesh position={[x * 0.08, 0, 0]}>{<boxGeometry args={[x * 0.78, y, z]} />}{material}</mesh>
      <mesh position={[-x * 0.44, 0, 0]} rotation={[0, 0, Math.PI / 2]}>{<cylinderGeometry args={[z * 0.42, z * 0.42, 12, 20]} />}{material}</mesh>
    </group>
  }
  if (definition.kind === 'bracket') {
    return <group>
      <mesh position={[0, -y / 2 + 2, -z / 2 + 2]}>{<boxGeometry args={[x, 4, z]} />}{material}</mesh>
      <mesh position={[0, 0, z / 2 - 2]}>{<boxGeometry args={[x, y, 4]} />}{material}</mesh>
    </group>
  }
  return <mesh>{<boxGeometry args={[x, y, z]} />}{material}</mesh>
}

function Part({ part, selected, onSelect }: { part: PartInstance, selected: boolean, onSelect: () => void }) {
  const definition = PARTS_BY_ID.get(part.definitionId)
  const radians = useMemo(() => part.rotation.map((value) => THREE.MathUtils.degToRad(value)) as [number, number, number], [part.rotation])
  if (!definition) return null
  return <group position={part.position} rotation={radians} onClick={(event) => { event.stopPropagation(); onSelect() }}>
    <PartShape definition={definition} />
    {definition.mountPoints.map((mount) => (
      <mesh key={mount.id} position={mount.position} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.15, 0.65, 8, 16]} />
        <meshBasicMaterial color={selected ? '#ffca58' : '#6e7f89'} transparent opacity={selected ? 1 : 0.45} />
      </mesh>
    ))}
    {selected && <mesh><boxGeometry args={definition.dimensions.map((dimension) => dimension + 5) as [number, number, number]} /><meshBasicMaterial color="#ffcb58" wireframe transparent opacity={0.58} /></mesh>}
  </group>
}

function SceneContents({ project, selectedId, onSelect }: RobotSceneProps) {
  return <>
    <color attach="background" args={['#10171c']} />
    <fog attach="fog" args={['#10171c', 650, 1600]} />
    <PerspectiveCamera makeDefault position={[420, 360, 500]} fov={43} />
    <ambientLight intensity={1.35} />
    <directionalLight position={[320, 500, 260]} intensity={2.7} castShadow />
    <directionalLight position={[-400, 180, -260]} intensity={1.1} color="#b5d6ff" />
    <Grid args={[1600, 1600]} position={[0, -10, 0]} cellSize={16} cellThickness={0.5} cellColor="#36505a" sectionSize={160} sectionThickness={0.9} sectionColor="#587482" fadeDistance={1250} fadeStrength={1} />
    <axesHelper args={[80]} />
    {project.parts.map((part) => <Part key={part.id} part={part} selected={part.id === selectedId} onSelect={() => onSelect(part.id)} />)}
    <OrbitControls makeDefault enableDamping dampingFactor={0.09} minDistance={90} maxDistance={1500} />
  </>
}

export function RobotScene(props: RobotSceneProps) {
  return <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }} onPointerMissed={() => props.onSelect('')}>
    <SceneContents {...props} />
  </Canvas>
}
