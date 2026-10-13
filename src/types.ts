export type Vec3 = [number, number, number]

export type PartCategory =
  | 'Structure'
  | 'Motion'
  | 'Drive'
  | 'Actuation'
  | 'Hardware'

export type PartKind = 'channel' | 'plate' | 'bracket' | 'motor' | 'wheel' | 'hub' | 'shaft' | 'bearing' | 'hardware'

export interface MountPoint {
  id: string
  position: Vec3
  diameter: number
  label: string
}

export interface PartDefinition {
  id: string
  name: string
  manufacturer: 'goBILDA'
  category: PartCategory
  kind: PartKind
  description: string
  dimensions: Vec3
  massGrams: number
  color: string
  mountPoints: MountPoint[]
}

export interface PartInstance {
  id: string
  definitionId: string
  position: Vec3
  rotation: Vec3
  label?: string
}

export interface RigidConnection {
  id: string
  sourcePartId: string
  sourceMountId: string
  targetPartId: string
  targetMountId: string
}

export interface Project {
  schemaVersion: 1
  id: string
  name: string
  parts: PartInstance[]
  connections: RigidConnection[]
  createdAt: string
  updatedAt: string
}

export interface ValidationIssue {
  id: string
  level: 'warning' | 'notice'
  title: string
  detail: string
}
