import type { MountPoint, PartCategory, PartDefinition, Vec3 } from './types'

const holesAlong = (length: number, axis: 'x' | 'z', y = 0): MountPoint[] => {
  const points: MountPoint[] = []
  const start = -((Math.floor(length / 16) - 1) * 16) / 2
  for (let i = 0; i < Math.floor(length / 16); i += 1) {
    const value = start + i * 16
    points.push({
      id: `hole-${i + 1}`,
      position: axis === 'x' ? [value, y, 0] : [0, y, value],
      diameter: 4,
      label: `M4 mounting hole ${i + 1}`,
    })
  }
  return points
}

const gridPlateHoles = (xCount: number, zCount: number): MountPoint[] => {
  const points: MountPoint[] = []
  for (let x = 0; x < xCount; x += 1) {
    for (let z = 0; z < zCount; z += 1) {
      points.push({
        id: `hole-${x + 1}-${z + 1}`,
        position: [x * 16 - ((xCount - 1) * 16) / 2, 0, z * 16 - ((zCount - 1) * 16) / 2],
        diameter: 4,
        label: `M4 mounting hole ${x + 1}, ${z + 1}`,
      })
    }
  }
  return points
}

const catalog: PartDefinition[] = [
  {
    id: '1120-u-channel-240',
    name: '1120 Series U-Channel, 240 mm',
    manufacturer: 'goBILDA', category: 'Structure', kind: 'channel',
    description: 'Lightweight 240 mm structural channel on the 16 mm goBILDA pattern.',
    dimensions: [240, 48, 12], massGrams: 102, color: '#d8e0e5', mountPoints: holesAlong(240, 'x', 0),
  },
  {
    id: '1120-u-channel-336',
    name: '1120 Series U-Channel, 336 mm',
    manufacturer: 'goBILDA', category: 'Structure', kind: 'channel',
    description: 'Long structural channel for rails and drivetrain sides.',
    dimensions: [336, 48, 12], massGrams: 143, color: '#d8e0e5', mountPoints: holesAlong(336, 'x', 0),
  },
  {
    id: '1120-plate-96x96',
    name: '1120 Series Square Plate, 96 mm',
    manufacturer: 'goBILDA', category: 'Structure', kind: 'plate',
    description: 'Six-by-six 16 mm pattern plate for compact mounting.',
    dimensions: [96, 3, 96], massGrams: 58, color: '#9daab2', mountPoints: gridPlateHoles(6, 6),
  },
  {
    id: '1120-angle-bracket',
    name: '1120 Series 90° Angle Bracket',
    manufacturer: 'goBILDA', category: 'Structure', kind: 'bracket',
    description: 'A right-angle bracket for tying structural rails together.',
    dimensions: [48, 48, 48], massGrams: 31, color: '#f0b849',
    mountPoints: [...holesAlong(48, 'x', -20), ...holesAlong(48, 'z', 20).map((point, index) => ({ ...point, id: `vertical-${index + 1}` }))],
  },
  {
    id: '5202-yellow-jacket',
    name: '5202 Series Yellow Jacket Motor',
    manufacturer: 'goBILDA', category: 'Actuation', kind: 'motor',
    description: 'Simplified motor model with its mounting face and clearance envelope.',
    dimensions: [94, 37, 37], massGrams: 176, color: '#ffd31a',
    mountPoints: [
      { id: 'mount-a', position: [-38, 0, -8], diameter: 4, label: 'Motor mount A' },
      { id: 'mount-b', position: [-38, 0, 8], diameter: 4, label: 'Motor mount B' },
    ],
  },
  {
    id: 'mecanum-wheel-96',
    name: 'Mecanum Wheel, 96 mm',
    manufacturer: 'goBILDA', category: 'Drive', kind: 'wheel',
    description: 'Simplified 96 mm mecanum wheel with mounting hub.',
    dimensions: [34, 96, 96], massGrams: 146, color: '#3b4854',
    mountPoints: [{ id: 'axle', position: [0, 0, 0], diameter: 8, label: '8 mm axle bore' }],
  },
  {
    id: 'clamping-hub-8mm',
    name: '8 mm REX Clamping Hub',
    manufacturer: 'goBILDA', category: 'Motion', kind: 'hub',
    description: 'Hub for attaching wheels and mechanisms to an 8 mm REX shaft.',
    dimensions: [20, 48, 48], massGrams: 40, color: '#647483',
    mountPoints: [{ id: 'axle', position: [0, 0, 0], diameter: 8, label: '8 mm REX bore' }],
  },
  {
    id: 'rex-shaft-160',
    name: '8 mm REX Shaft, 160 mm',
    manufacturer: 'goBILDA', category: 'Motion', kind: 'shaft',
    description: '8 mm REX shaft for transmitting rotation through a mechanism.',
    dimensions: [160, 8, 8], massGrams: 22, color: '#b5c2cc',
    mountPoints: [
      { id: 'end-a', position: [-80, 0, 0], diameter: 8, label: 'Shaft end A' },
      { id: 'end-b', position: [80, 0, 0], diameter: 8, label: 'Shaft end B' },
    ],
  },
  {
    id: 'flanged-bearing-8mm',
    name: '8 mm REX Flanged Bearing',
    manufacturer: 'goBILDA', category: 'Motion', kind: 'bearing',
    description: 'Bearing mount point for an 8 mm REX rotating shaft.',
    dimensions: [16, 32, 32], massGrams: 10, color: '#a9b3bb',
    mountPoints: [{ id: 'axle', position: [0, 0, 0], diameter: 8, label: '8 mm bearing bore' }],
  },
  {
    id: 'm4-screw-12',
    name: 'M4 Button Head Screw, 12 mm',
    manufacturer: 'goBILDA', category: 'Hardware', kind: 'hardware',
    description: 'Common fastening hardware for the 16 mm pattern.',
    dimensions: [8, 12, 8], massGrams: 2, color: '#d6dde2',
    mountPoints: [{ id: 'thread', position: [0, 0, 0], diameter: 4, label: 'M4 thread axis' }],
  },
]

export const PART_CATALOG = catalog
export const PARTS_BY_ID = new Map(catalog.map((part) => [part.id, part]))
export const CATEGORIES: PartCategory[] = ['Structure', 'Motion', 'Drive', 'Actuation', 'Hardware']

export function displayMm(value: number) {
  return `${Math.round(value)} mm`
}

export function addVec(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}
