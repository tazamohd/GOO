import { useEffect, useMemo, useRef, useState } from 'react'
import { companyBrain, departments, type Agent, type Department } from './data/company'
import { greetingFor, leaderReply, orchestratorReply } from './lib/orchestrate'
import type { ChatMessage, Task } from './types'
import ChatPanel from './components/ChatPanel'
import TasksBoard from './components/TasksBoard'
import './App.css'

type Selected =
  | { kind: 'brain' }
  | { kind: 'department'; department: Department }
  | { kind: 'agent'; department: Department; agent: Agent }

const BRAIN_ID = 'brain'

const CENTER = 500
const DEPT_RADIUS = 200
const AGENT_RADIUS = 300
const AGENT_RADIUS_TIERS = 5
const AGENT_RADIUS_STAGGER = 68
const MAX_AGENT_ARC_DEGREES = (360 / 7) * 0.94

function toPoint(angleDeg: number, radius: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) }
}

function wrapLabel(name: string): string[] {
  const words = name.split(' ')
  if (words.length < 2) return [name]
  const mid = Math.ceil(words.length / 2)
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')]
}

const AGENT_LABEL_GAP = 27
const AGENT_LABEL_LINE_HEIGHT = 13
const AGENT_LABEL_MIN_GAP = 12

const VIEW_MIN = -155
const VIEW_SIZE = 1310
const VIEW_CENTER = VIEW_MIN + VIEW_SIZE / 2
const HUB_PAD = 70
const DEPT_PAD = 60
const AGENT_LABEL_PAD_X = 140
const AGENT_LABEL_PAD_Y = 60
const VIEW_MARGIN = 1.12

// Places a label on the side of the node facing away from the hub, so nodes
// packed close together tangentially (e.g. departments on the left/right of
// the circle, where radial spread barely changes x) don't collide: the label
// runs alongside the node instead of needing symmetric clearance below it.
//
// `labelYOffset` comes from a per-department declutter pass (see `layout`)
// that nudges side-anchored labels apart along y until none of their
// (measured) bounding boxes touch, since angular order alone doesn't
// guarantee vertical order once radius tiers are mixed in.
function labelPlacement(angleDeg: number, lineCount: number, labelYOffset: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  const dx = Math.cos(rad)
  const dy = Math.sin(rad)

  if (Math.abs(dx) >= Math.abs(dy)) {
    const anchor: 'start' | 'end' = dx >= 0 ? 'start' : 'end'
    return {
      anchor,
      x: dx >= 0 ? AGENT_LABEL_GAP : -AGENT_LABEL_GAP,
      firstY: (-(lineCount - 1) * AGENT_LABEL_LINE_HEIGHT) / 2 + 4 + labelYOffset,
    }
  }
  if (dy >= 0) {
    return { anchor: 'middle' as const, x: 0, firstY: AGENT_LABEL_GAP + 3 + labelYOffset }
  }
  return {
    anchor: 'middle' as const,
    x: 0,
    firstY: -(AGENT_LABEL_GAP - 8 + (lineCount - 1) * AGENT_LABEL_LINE_HEIGHT) + labelYOffset,
  }
}

// Pool Adjacent Violators: the standard algorithm for finding the
// non-decreasing sequence closest (least squares) to a given sequence of
// values. Used below to fit a monotonic curve to a set of weighted values.
function poolAdjacentViolators(values: number[]): number[] {
  const pools: { value: number; weight: number; count: number }[] = []
  for (const raw of values) {
    let value = raw
    let weight = 1
    let count = 1
    while (pools.length > 0 && pools[pools.length - 1].value > value) {
      const prev = pools.pop()!
      value = (prev.value * prev.weight + value * weight) / (prev.weight + weight)
      weight = prev.weight + weight
      count = prev.count + count
    }
    pools.push({ value, weight, count })
  }
  const result: number[] = []
  for (const pool of pools) {
    for (let k = 0; k < pool.count; k++) result.push(pool.value)
  }
  return result
}

// Finds the y position for each label (given in naturalY order) that keeps
// them in order with at least AGENT_LABEL_MIN_GAP between adjacent boxes,
// while staying as close as possible overall to their natural positions.
// This is isotonic regression: subtracting off the cumulative required gap
// turns "keep at least this far apart" into a plain "keep non-decreasing"
// constraint, which the pool-adjacent-violators algorithm solves exactly —
// no greedy cascade that can run away and overshoot past a nearby node.
function declutterY(items: { naturalY: number; height: number }[]): number[] {
  const n = items.length
  const cumulativeGap = new Array<number>(n).fill(0)
  for (let i = 1; i < n; i++) {
    const gap = items[i - 1].height / 2 + AGENT_LABEL_MIN_GAP + items[i].height / 2
    cumulativeGap[i] = cumulativeGap[i - 1] + gap
  }
  const shifted = items.map((item, i) => item.naturalY - cumulativeGap[i])
  const fitted = poolAdjacentViolators(shifted)
  return fitted.map((y, i) => y + cumulativeGap[i] - items[i].naturalY)
}

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export default function App() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [selected, setSelected] = useState<Selected>({ kind: 'brain' })
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>({})
  const [typing, setTyping] = useState<Record<string, boolean>>({})
  const [tasks, setTasks] = useState<Task[]>([])
  const typingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const layout = useMemo(() => {
    const step = 360 / departments.length
    return departments.map((dept, i) => {
      const angle = i * step
      const deptPoint = toPoint(angle, DEPT_RADIUS)
      const agentCount = dept.agents.length
      const spread = Math.min(MAX_AGENT_ARC_DEGREES, agentCount * 9)
      const agentPoints = dept.agents.map((agent, j) => {
        const start = angle - spread / 2
        const agentAngle = agentCount === 1 ? angle : start + (spread * j) / (agentCount - 1)
        // Interleaved (not sequential) so angularly-adjacent agents land on
        // maximally different tiers — j and j+1 would otherwise always be
        // one stagger step apart, which is close enough for one label to
        // reach into the next node's circle.
        const tier = (j * 2) % AGENT_RADIUS_TIERS
        const radius = AGENT_RADIUS + tier * AGENT_RADIUS_STAGGER
        const point = toPoint(agentAngle, radius)
        const rad = (agentAngle - 90) * (Math.PI / 180)
        const dx = Math.cos(rad)
        const dy = Math.sin(rad)
        const isSide = Math.abs(dx) >= Math.abs(dy)
        // Which quadrant of the node a label sits in — labels only ever
        // compete for space with other labels in the *same* quadrant (a
        // label to the right of one node can't collide with one below
        // another), so decluttering per bucket avoids needlessly nudging
        // labels that were never actually going to touch.
        const bucket = isSide ? (dx >= 0 ? 'side-r' : 'side-l') : dy >= 0 ? 'vert-d' : 'vert-u'
        const lineCount = wrapLabel(agent.name).length
        const labelHeight = lineCount * AGENT_LABEL_LINE_HEIGHT
        return { agent, angle: agentAngle, tier, point, bucket, labelHeight, labelYOffset: 0 }
      })

      // Labels can end up close together even when their nodes' angular
      // order looks fine, because radius tiers stagger nodes outward at
      // different rates. Declutter each spatial bucket by actual rendered y
      // so none of the (measured) label bounding boxes touch.
      const buckets = new Map<string, number[]>()
      agentPoints.forEach((ap, idx) => {
        const list = buckets.get(ap.bucket) ?? []
        list.push(idx)
        buckets.set(ap.bucket, list)
      })
      for (const indices of buckets.values()) {
        indices.sort((a, b) => agentPoints[a].point.y - agentPoints[b].point.y)
        const offsets = declutterY(
          indices.map((idx) => ({
            naturalY: agentPoints[idx].point.y,
            height: agentPoints[idx].labelHeight,
          })),
        )
        indices.forEach((idx, i) => {
          agentPoints[idx].labelYOffset = offsets[i]
        })
      }

      return { dept, angle, point: deptPoint, agentPoints }
    })
  }, [])

  // The node layout is sized for the largest possible view (any department
  // fully expanded), so most of the time — nothing expanded, or only one of
  // seven departments expanded — actual content only fills a small corner of
  // that space. Zoom the view to fit whatever's currently visible instead of
  // always showing the full worst-case canvas.
  const viewTransform = useMemo(() => {
    let minX = CENTER - HUB_PAD
    let maxX = CENTER + HUB_PAD
    let minY = CENTER - HUB_PAD
    let maxY = CENTER + HUB_PAD

    for (const { point } of layout) {
      minX = Math.min(minX, point.x - DEPT_PAD)
      maxX = Math.max(maxX, point.x + DEPT_PAD)
      minY = Math.min(minY, point.y - DEPT_PAD)
      maxY = Math.max(maxY, point.y + DEPT_PAD)
    }

    const activeDept = layout.find(({ dept }) => dept.id === expanded)
    if (activeDept) {
      for (const { point } of activeDept.agentPoints) {
        minX = Math.min(minX, point.x - AGENT_LABEL_PAD_X)
        maxX = Math.max(maxX, point.x + AGENT_LABEL_PAD_X)
        minY = Math.min(minY, point.y - AGENT_LABEL_PAD_Y)
        maxY = Math.max(maxY, point.y + AGENT_LABEL_PAD_Y)
      }
    }

    const size = Math.max(maxX - minX, maxY - minY) * VIEW_MARGIN
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2
    const scale = VIEW_SIZE / size
    const tx = VIEW_CENTER - cx * scale
    const ty = VIEW_CENTER - cy * scale
    return `translate(${tx}px, ${ty}px) scale(${scale})`
  }, [layout, expanded])

  const isExpanded = (id: string) => expanded === id

  // Advance running tasks over time to simulate agents working.
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prev) =>
        prev.map((task) => {
          if (task.status === 'done') return task
          const progress = Math.min(100, task.progress + 8 + Math.random() * 14)
          return { ...task, progress, status: progress >= 100 ? 'done' : 'running' }
        }),
      )
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timers = typingTimers.current
    return () => {
      Object.values(timers).forEach(clearTimeout)
    }
  }, [])

  function ensureGreeting(targetId: string, name: string, mission: string) {
    setChats((prev) => {
      if (prev[targetId]) return prev
      return {
        ...prev,
        [targetId]: [{ id: makeId(), role: 'agent', text: greetingFor(name, mission), ts: Date.now() }],
      }
    })
  }

  useEffect(() => {
    if (selected.kind === 'brain') {
      ensureGreeting(BRAIN_ID, 'Orchestrator', companyBrain.mission)
    } else if (selected.kind === 'department') {
      ensureGreeting(selected.department.id, `${selected.department.name} Lead`, selected.department.mission)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  function handleSend(targetId: string, isBrain: boolean, dept: Department | undefined, text: string) {
    const userMsg: ChatMessage = { id: makeId(), role: 'user', text, ts: Date.now() }
    setChats((prev) => ({ ...prev, [targetId]: [...(prev[targetId] ?? []), userMsg] }))
    setTyping((prev) => ({ ...prev, [targetId]: true }))

    clearTimeout(typingTimers.current[targetId])
    typingTimers.current[targetId] = setTimeout(
      () => {
        const { reply, task } = isBrain ? orchestratorReply(text, departments) : leaderReply(dept!, text)
        const agentMsg: ChatMessage = { id: makeId(), role: 'agent', text: reply, ts: Date.now() }
        setChats((prev) => ({ ...prev, [targetId]: [...(prev[targetId] ?? []), agentMsg] }))
        setTyping((prev) => ({ ...prev, [targetId]: false }))
        if (task) {
          const newTask: Task = { ...task, id: makeId(), progress: 0, status: 'running', createdAt: Date.now() }
          setTasks((prev) => [newTask, ...prev].slice(0, 24))
        }
      },
      500 + Math.random() * 500,
    )
  }

  const runningCount = tasks.filter((t) => t.status === 'running').length
  const doneCount = tasks.length - runningCount
  const totalAgents = departments.reduce((n, d) => n + d.agents.length, 0)

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <div className="header-title">
            <span className={`status-dot ${runningCount > 0 ? 'status-dot-active' : ''}`} />
            <h1>Agent Command Deck</h1>
          </div>
          <div className="hud-stats">
            <span>
              <strong>{departments.length}</strong> departments
            </span>
            <span>
              <strong>{totalAgents}</strong> agents
            </span>
            <span className={runningCount > 0 ? 'hud-stat-active' : ''}>
              <strong>{runningCount}</strong> active
            </span>
            <span>
              <strong>{doneCount}</strong> done
            </span>
          </div>
        </div>
        <p>
          Click a department to expand its agents. Select the brain or a department to chat with
          its lead — tasks appear live below.
        </p>
      </header>

      <div className="deck-body">
          <div className="stage">
            <svg viewBox="-155 -155 1310 1310" className="map" role="img" aria-label="Company agent map">
              <g className="map-viewport" style={{ transform: viewTransform }}>
              {layout.map(({ dept, point }) => (
                <line
                  key={`brain-${dept.id}`}
                  x1={CENTER}
                  y1={CENTER}
                  x2={point.x}
                  y2={point.y}
                  className="edge edge-brain"
                />
              ))}

              {layout.map(
                ({ dept, point, agentPoints }) =>
                  isExpanded(dept.id) &&
                  agentPoints.map(({ agent, point: ap }) => (
                    <line
                      key={`${dept.id}-${agent.id}`}
                      x1={point.x}
                      y1={point.y}
                      x2={ap.x}
                      y2={ap.y}
                      className="edge edge-agent"
                      style={{ stroke: dept.color }}
                    />
                  )),
              )}

              <g
                className={`node node-brain ${selected.kind === 'brain' ? 'is-selected' : ''}`}
                transform={`translate(${CENTER}, ${CENTER})`}
                onClick={() => setSelected({ kind: 'brain' })}
              >
                <circle r={54} />
                <text y={-4}>🧠</text>
                <text y={18} className="node-label">
                  Company Brain
                </text>
              </g>

              {layout.map(({ dept, point, agentPoints }) => (
                <g key={dept.id}>
                  <g
                    className={`node node-dept ${isExpanded(dept.id) ? 'is-expanded' : ''} ${
                      selected.kind === 'department' && selected.department.id === dept.id ? 'is-selected' : ''
                    }`}
                    style={{ ['--dept-color' as string]: dept.color }}
                    transform={`translate(${point.x}, ${point.y})`}
                    onClick={() => {
                      setExpanded((cur) => (cur === dept.id ? null : dept.id))
                      setSelected({ kind: 'department', department: dept })
                    }}
                  >
                    <circle r={40} />
                    <text y={-2}>{dept.icon}</text>
                    <text y={16} className="node-label">
                      {dept.name}
                    </text>
                  </g>

                  {isExpanded(dept.id) &&
                    agentPoints.map(({ agent, angle: agentAngle, labelYOffset, point: ap }) => {
                      const lines = wrapLabel(agent.name)
                      const placement = labelPlacement(agentAngle, lines.length, labelYOffset)
                      return (
                        <g
                          key={agent.id}
                          className={`node node-agent ${
                            selected.kind === 'agent' && selected.agent.id === agent.id ? 'is-selected' : ''
                          }`}
                          style={{ ['--dept-color' as string]: dept.color }}
                          transform={`translate(${ap.x}, ${ap.y})`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelected({ kind: 'agent', department: dept, agent })
                          }}
                        >
                          <title>{agent.name}</title>
                          <circle r={19} />
                          <text
                            y={placement.firstY}
                            style={{ textAnchor: placement.anchor }}
                            className="node-label node-label-agent"
                          >
                            {lines.map((line, li) => (
                              <tspan key={li} x={placement.x} dy={li === 0 ? 0 : AGENT_LABEL_LINE_HEIGHT}>
                                {line}
                              </tspan>
                            ))}
                          </text>
                        </g>
                      )
                    })}
                </g>
              ))}
              </g>
            </svg>
          </div>

          <aside className="panel">
            {selected.kind === 'brain' && (
              <>
                <h2>🧠 Orchestrator</h2>
                <p className="role">{companyBrain.name}</p>
                <p>{companyBrain.mission}</p>
                <ChatPanel
                  color="#ffffff"
                  messages={chats[BRAIN_ID] ?? []}
                  isTyping={!!typing[BRAIN_ID]}
                  onSend={(text) => handleSend(BRAIN_ID, true, undefined, text)}
                />
              </>
            )}
            {selected.kind === 'department' && (
              <>
                <h2>
                  {selected.department.icon} {selected.department.name} Lead
                </h2>
                <p>{selected.department.mission}</p>
                <h3>Agents</h3>
                <ul className="agent-list">
                  {selected.department.agents.map((agent) => (
                    <li key={agent.id}>
                      <button
                        onClick={() =>
                          setSelected({ kind: 'agent', department: selected.department, agent })
                        }
                      >
                        {agent.name}
                      </button>
                    </li>
                  ))}
                </ul>
                <ChatPanel
                  color={selected.department.color}
                  messages={chats[selected.department.id] ?? []}
                  isTyping={!!typing[selected.department.id]}
                  onSend={(text) => handleSend(selected.department.id, false, selected.department, text)}
                />
              </>
            )}
            {selected.kind === 'agent' && (
              <>
                <div className="breadcrumb">
                  {selected.department.icon} {selected.department.name}
                </div>
                <h2>{selected.agent.name}</h2>
                <p className="role">{selected.agent.role}</p>
                <h3>Skill</h3>
                <p className="skill">{selected.agent.skill}</p>
                <button
                  className="copy-btn"
                  onClick={() => navigator.clipboard?.writeText(selected.agent.skill)}
                >
                  Copy skill prompt
                </button>
              </>
            )}
          </aside>
      </div>

      <section className="deck-feed">
        <div className="deck-feed-header">
          <h2>Live Tasks</h2>
          {runningCount > 0 && <span className="tab-badge">{runningCount}</span>}
        </div>
        <div className="deck-feed-body">
          <TasksBoard tasks={tasks} departments={departments} variant="feed" />
        </div>
      </section>
    </div>
  )
}
