import { useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORIES, PART_CATALOG, PARTS_BY_ID, displayMm } from './catalog'
import { createPart, createProject, loadProject, parseProject, projectBounds, translateConnected, validateProject, withTimestamp, PROJECT_STORAGE_KEY } from './project'
import { RobotScene } from './RobotScene'
import type { PartCategory, PartInstance, Project, Vec3 } from './types'

type History = { past: Project[], future: Project[] }

const emptyHistory: History = { past: [], future: [] }

function weight(project: Project) {
  return project.parts.reduce((total, part) => total + (PARTS_BY_ID.get(part.definitionId)?.massGrams ?? 0), 0)
}

function formatMass(grams: number) {
  return grams >= 1000 ? `${(grams / 1000).toFixed(2)} kg` : `${grams} g`
}

function uniqueFilename(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'robot-project'
}

export default function App() {
  const [project, setProject] = useState<Project>(loadProject)
  const [history, setHistory] = useState<History>(emptyHistory)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [category, setCategory] = useState<PartCategory | 'All'>('All')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('Your project is saved on this device.')
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = project.parts.find((part) => part.id === selectedId) ?? null
  const selectedDef = selected ? PARTS_BY_ID.get(selected.definitionId) : null
  const bounds = useMemo(() => projectBounds(project), [project])
  const issues = useMemo(() => validateProject(project), [project])
  const bom = useMemo(() => {
    const counts = new Map<string, number>()
    project.parts.forEach((part) => counts.set(part.definitionId, (counts.get(part.definitionId) ?? 0) + 1))
    return [...counts.entries()].map(([id, count]) => ({ part: PARTS_BY_ID.get(id), count })).filter((row) => row.part)
  }, [project.parts])
  const visibleParts = useMemo(() => PART_CATALOG.filter((part) => (category === 'All' || part.category === category) && `${part.name} ${part.description}`.toLowerCase().includes(search.toLowerCase())), [category, search])

  useEffect(() => {
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(project))
  }, [project])

  const commit = (next: Project, note?: string) => {
    setHistory((current) => ({ past: [...current.past.slice(-39), project], future: [] }))
    setProject(withTimestamp(next))
    if (note) setMessage(note)
  }

  const addPart = (definitionId: string) => {
    const part = createPart(definitionId, project.parts.length)
    commit({ ...project, parts: [...project.parts, part] }, `${PARTS_BY_ID.get(definitionId)?.name} added to the workbench.`)
    setSelectedId(part.id)
  }

  const updatePosition = (axis: number, rawValue: string) => {
    if (!selected) return
    const value = Number(rawValue)
    if (!Number.isFinite(value)) return
    const next = [...selected.position] as Vec3
    next[axis] = value
    commit(translateConnected(project, selected.id, next), 'Position updated.')
  }

  const updateRotation = (axis: number, rawValue: string) => {
    if (!selected) return
    const value = Number(rawValue)
    if (!Number.isFinite(value)) return
    commit({ ...project, parts: project.parts.map((part) => part.id === selected.id ? { ...part, rotation: part.rotation.map((rotation, index) => index === axis ? value : rotation) as Vec3 } : part) }, 'Rotation updated.')
  }

  const snapSelected = () => {
    if (!selected || !selectedDef) return
    const candidates: { other: PartInstance, source: string, target: string, distance: number, position: Vec3 }[] = []
    selectedDef.mountPoints.forEach((sourceMount) => {
      const sourcePosition: Vec3 = [selected.position[0] + sourceMount.position[0], selected.position[1] + sourceMount.position[1], selected.position[2] + sourceMount.position[2]]
      project.parts.filter((part) => part.id !== selected.id).forEach((other) => {
        const definition = PARTS_BY_ID.get(other.definitionId)
        definition?.mountPoints.forEach((targetMount) => {
          if (Math.abs(sourceMount.diameter - targetMount.diameter) > 0.5) return
          const targetPosition: Vec3 = [other.position[0] + targetMount.position[0], other.position[1] + targetMount.position[1], other.position[2] + targetMount.position[2]]
          const distance = Math.hypot(sourcePosition[0] - targetPosition[0], sourcePosition[1] - targetPosition[1], sourcePosition[2] - targetPosition[2])
          candidates.push({ other, source: sourceMount.id, target: targetMount.id, distance, position: targetPosition })
        })
      })
    })
    const nearest = candidates.sort((a, b) => a.distance - b.distance)[0]
    if (!nearest || nearest.distance > 64) {
      setMessage('No compatible mounting point is within 64 mm. Move this part closer first.')
      return
    }
    const sourceMount = selectedDef.mountPoints.find((mount) => mount.id === nearest.source)
    if (!sourceMount) return
    const position: Vec3 = [nearest.position[0] - sourceMount.position[0], nearest.position[1] - sourceMount.position[1], nearest.position[2] - sourceMount.position[2]]
    const translated = translateConnected(project, selected.id, position)
    const exists = project.connections.some((connection) => (connection.sourcePartId === selected.id && connection.targetPartId === nearest?.other.id) || (connection.targetPartId === selected.id && connection.sourcePartId === nearest?.other.id))
    commit({ ...translated, connections: exists ? translated.connections : [...translated.connections, { id: crypto.randomUUID(), sourcePartId: selected.id, sourceMountId: nearest.source, targetPartId: nearest.other.id, targetMountId: nearest.target }] }, `Snapped to ${PARTS_BY_ID.get(nearest.other.definitionId)?.name}. Connected parts now move together.`)
  }

  const deleteSelected = () => {
    if (!selected) return
    commit({ ...project, parts: project.parts.filter((part) => part.id !== selected.id), connections: project.connections.filter((connection) => connection.sourcePartId !== selected.id && connection.targetPartId !== selected.id) }, 'Part removed.')
    setSelectedId(null)
  }

  const undo = () => {
    const previous = history.past.at(-1)
    if (!previous) return
    setHistory((current) => ({ past: current.past.slice(0, -1), future: [project, ...current.future] }))
    setProject(previous)
    setMessage('Undid last change.')
  }
  const redo = () => {
    const next = history.future[0]
    if (!next) return
    setHistory((current) => ({ past: [...current.past, project], future: current.future.slice(1) }))
    setProject(next)
    setMessage('Redid change.')
  }
  const exportProject = () => {
    const data = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(data)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${uniqueFilename(project.name)}.ftcbuilder.json`
    anchor.click()
    URL.revokeObjectURL(url)
    setMessage('Project file exported.')
  }
  const importProject = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = parseProject(String(reader.result))
        commit(imported, `Opened ${imported.name}.`)
        setSelectedId(null)
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Could not open this project file.')
      }
    }
    reader.readAsText(file)
  }
  const newProject = () => {
    if (project.parts.length && !window.confirm('Start a new empty robot? Your current project is already saved locally.')) return
    const next = createProject()
    commit(next, 'New offline project created.')
    setSelectedId(null)
  }

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark">F</div><div><strong>FTC Builder</strong><span>offline workbench</span></div></div>
      <div className="project-title"><input aria-label="Project name" value={project.name} onChange={(event) => commit({ ...project, name: event.target.value })} /><span className="saved-indicator">● saved locally</span></div>
      <div className="top-actions">
        <button className="ghost" onClick={undo} disabled={!history.past.length}>↶ Undo</button>
        <button className="ghost" onClick={redo} disabled={!history.future.length}>↷ Redo</button>
        <button className="ghost" onClick={newProject}>New</button>
        <button className="ghost" onClick={() => inputRef.current?.click()}>Import</button>
        <button className="primary" onClick={exportProject}>Export project</button>
        <input ref={inputRef} hidden type="file" accept="application/json,.json,.ftcbuilder" onChange={(event) => importProject(event.target.files?.[0])} />
      </div>
    </header>

    <section className="workspace">
      <aside className="catalog-panel">
        <div className="panel-heading"><div><span className="eyebrow">PART LIBRARY</span><h2>goBILDA 1120</h2></div><span className="count-pill">{PART_CATALOG.length}</span></div>
        <label className="search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a part" /></label>
        <div className="category-tabs">
          {(['All', ...CATEGORIES] as const).map((item) => <button key={item} className={category === item ? 'active' : ''} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        <div className="part-list">
          {visibleParts.map((part) => <article className="part-card" key={part.id}>
            <div className={`part-icon ${part.kind}`}><span /></div>
            <div className="part-copy"><strong>{part.name}</strong><span>{part.category} · {formatMass(part.massGrams)}</span></div>
            <button className="add-button" onClick={() => addPart(part.id)} aria-label={`Add ${part.name}`}>+</button>
          </article>)}
          {!visibleParts.length && <p className="empty">No parts match that search.</p>}
        </div>
      </aside>

      <section className="scene-panel">
        <div className="scene-toolbar"><span className="view-label"><i />ASSEMBLY VIEW</span><span>mm · 16 mm grid</span><span>{project.parts.length} parts · {project.connections.length} rigid connections</span></div>
        <RobotScene project={project} selectedId={selectedId} onSelect={(id) => setSelectedId(id || null)} />
        <div className="scene-help">Drag to orbit · right-drag to pan · scroll to zoom · select a part to inspect</div>
        <div className="toast">{message}</div>
      </section>

      <aside className="inspector-panel">
        <div className="panel-heading"><div><span className="eyebrow">INSPECTOR</span><h2>{selectedDef?.name ?? 'Nothing selected'}</h2></div></div>
        {selected && selectedDef ? <>
          <p className="description">{selectedDef.description}</p>
          <div className="detail-grid"><div><span>Manufacturer</span><strong>{selectedDef.manufacturer}</strong></div><div><span>Mass</span><strong>{formatMass(selectedDef.massGrams)}</strong></div><div><span>Size</span><strong>{selectedDef.dimensions.map(displayMm).join(' × ')}</strong></div><div><span>Mount points</span><strong>{selectedDef.mountPoints.length}</strong></div></div>
          <section className="transform-section"><h3>Position <em>mm</em></h3><div className="coordinate-row">{(['X', 'Y', 'Z'] as const).map((axis, index) => <label key={axis}><span>{axis}</span><input type="number" value={Math.round(selected.position[index] * 10) / 10} onChange={(event) => updatePosition(index, event.target.value)} /></label>)}</div></section>
          <section className="transform-section"><h3>Rotation <em>degrees</em></h3><div className="coordinate-row">{(['X', 'Y', 'Z'] as const).map((axis, index) => <label key={axis}><span>{axis}</span><input type="number" value={Math.round(selected.rotation[index] * 10) / 10} onChange={(event) => updateRotation(index, event.target.value)} /></label>)}</div></section>
          <div className="inspector-actions"><button className="snap" onClick={snapSelected}>✦ Snap to nearest mount</button><button className="delete" onClick={deleteSelected}>Remove part</button></div>
        </> : <div className="selection-empty"><div>⌖</div><p>Select a part in the workbench to see its dimensions, position, and mounting points.</p></div>}
      </aside>
    </section>

    <section className="bottom-panel">
      <div className="metrics"><div><span>BOUNDING BOX</span><strong>{bounds.map((value) => Math.round(value)).join(' × ')} mm</strong></div><div><span>ESTIMATED MASS</span><strong>{formatMass(weight(project))}</strong></div><div><span>PART COUNT</span><strong>{project.parts.length}</strong></div></div>
      <div className="validation"><div className="section-label">VALIDATION <span>simplified checks</span></div>{!issues.length && <p className="empty-validation">Add parts to begin checking your assembly.</p>}{issues.slice(0, 3).map((issue) => <div className={`issue ${issue.level}`} key={issue.id}><b>{issue.level === 'warning' ? '!' : 'i'}</b><p><strong>{issue.title}</strong><span>{issue.detail}</span></p></div>)}</div>
      <div className="bom"><div className="section-label">BILL OF MATERIALS</div>{bom.length ? bom.slice(0, 4).map((row) => <div className="bom-row" key={row.part?.id}><span>{row.part?.name}</span><strong>× {row.count}</strong></div>) : <p className="empty-validation">Your selected parts will appear here.</p>}</div>
    </section>
  </main>
}
