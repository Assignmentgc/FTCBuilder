import { PARTS_BY_ID } from './catalog'
import type { PartInstance, Project, ValidationIssue, Vec3 } from './types'

export const PROJECT_STORAGE_KEY = 'ftc-builder-project-v1'

export function createProject(): Project {
  const now = new Date().toISOString()
  return {
    schemaVersion: 1,
    id: crypto.randomUUID(),
    name: 'Untitled robot',
    parts: [],
    connections: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function loadProject(): Project {
  try {
    const saved = localStorage.getItem(PROJECT_STORAGE_KEY)
    if (saved) return parseProject(saved)
  } catch {
    // A fresh project is a safe fallback for an unavailable/corrupt local store.
  }
  return createProject()
}

export function parseProject(serialized: string): Project {
  const value = JSON.parse(serialized) as Project
  if (value.schemaVersion !== 1 || !Array.isArray(value.parts) || !Array.isArray(value.connections) || typeof value.name !== 'string') {
    throw new Error('This is not a compatible FTC Builder project file.')
  }
  const parts = value.parts.filter((part) => PARTS_BY_ID.has(part.definitionId))
  return { ...value, parts }
}

export function withTimestamp(project: Project): Project {
  return { ...project, updatedAt: new Date().toISOString() }
}

export function createPart(definitionId: string, index: number): PartInstance {
  const column = index % 4
  const row = Math.floor(index / 4)
  return {
    id: crypto.randomUUID(),
    definitionId,
    position: [(column - 1.5) * 96, 18, (row - 1) * 96],
    rotation: [0, 0, 0],
  }
}

export function connectedPartIds(project: Project, seedId: string): Set<string> {
  const found = new Set([seedId])
  let grew = true
  while (grew) {
    grew = false
    project.connections.forEach((connection) => {
      if (found.has(connection.sourcePartId) && !found.has(connection.targetPartId)) {
        found.add(connection.targetPartId)
        grew = true
      }
      if (found.has(connection.targetPartId) && !found.has(connection.sourcePartId)) {
        found.add(connection.sourcePartId)
        grew = true
      }
    })
  }
  return found
}

export function translateConnected(project: Project, partId: string, nextPosition: Vec3): Project {
  const active = project.parts.find((part) => part.id === partId)
  if (!active) return project
  const delta: Vec3 = [nextPosition[0] - active.position[0], nextPosition[1] - active.position[1], nextPosition[2] - active.position[2]]
  const connected = connectedPartIds(project, partId)
  return {
    ...project,
    parts: project.parts.map((part) => connected.has(part.id)
      ? { ...part, position: [part.position[0] + delta[0], part.position[1] + delta[1], part.position[2] + delta[2]] }
      : part),
  }
}

function overlaps(a: PartInstance, b: PartInstance) {
  const ad = PARTS_BY_ID.get(a.definitionId)?.dimensions
  const bd = PARTS_BY_ID.get(b.definitionId)?.dimensions
  if (!ad || !bd) return false
  return ([0, 1, 2] as const).every((axis) => Math.abs(a.position[axis] - b.position[axis]) < (ad[axis] + bd[axis]) / 2 - 2)
}

export function projectBounds(project: Project): Vec3 {
  if (!project.parts.length) return [0, 0, 0]
  const extrema = ([0, 1, 2] as const).map((axis) => {
    const intervals = project.parts.map((part) => {
      const size = PARTS_BY_ID.get(part.definitionId)?.dimensions[axis] ?? 0
      return [part.position[axis] - size / 2, part.position[axis] + size / 2]
    })
    return Math.max(...intervals.map((entry) => entry[1])) - Math.min(...intervals.map((entry) => entry[0]))
  })
  return extrema as Vec3
}

export function validateProject(project: Project): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const bounds = projectBounds(project)
  if (bounds.some((value) => value > 457.2)) {
    issues.push({ id: 'bounds', level: 'warning', title: 'Large starting envelope', detail: `Current bounding box is ${bounds.map((value) => Math.round(value)).join(' × ')} mm. Verify the season's robot-size rules manually.` })
  }
  for (let i = 0; i < project.parts.length; i += 1) {
    for (let j = i + 1; j < project.parts.length; j += 1) {
      if (overlaps(project.parts[i], project.parts[j])) {
        const a = PARTS_BY_ID.get(project.parts[i].definitionId)?.name ?? 'Part'
        const b = PARTS_BY_ID.get(project.parts[j].definitionId)?.name ?? 'part'
        issues.push({ id: `collision-${project.parts[i].id}-${project.parts[j].id}`, level: 'warning', title: 'Possible collision', detail: `${a} overlaps ${b} in its simplified clearance envelope.` })
      }
    }
  }
  const joined = new Set(project.connections.flatMap((connection) => [connection.sourcePartId, connection.targetPartId]))
  const looseCount = project.parts.filter((part) => !joined.has(part.id)).length
  if (looseCount) {
    issues.push({ id: 'loose', level: 'notice', title: `${looseCount} unconnected ${looseCount === 1 ? 'part' : 'parts'}`, detail: 'Use Snap to create a rigid mounting connection. This is an assembly aid, not a full physics simulation.' })
  }
  if (!issues.length && project.parts.length) {
    issues.push({ id: 'clear', level: 'notice', title: 'No basic issues found', detail: 'The current simplified checks did not find collisions or loose parts.' })
  }
  return issues
}
