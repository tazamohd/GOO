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
const AGENT_RADIUS = 280
const AGENT_RADIUS_TIERS = 4
const AGENT_RADIUS_STAGGER = 55
const MAX_AGENT_ARC_DEGREES = (360 / 7) * 0.88

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

const AGENT_LABEL_GAP = 23
const AGENT_LABEL_LINE_HEIGHT = 10

// Places a label on the side of the node facing away from the hub, so nodes
// packed close together tangentially (e.g. departments on the left/right of
// the circle, where radial spread barely changes x) don't collide: the label
// runs alongside the node instead of needing symmetric clearance below it.
function labelPlacement(angleDeg: number, lineCount: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180)
  const dx = Math.cos(rad)
  const dy = Math.sin(rad)

  if (Math.abs(dx) >= Math.abs(dy)) {
    const anchor: 'start' | 'end' = dx >= 0 ? 'start' : 'end'
    return {
      anchor,
      x: dx >= 0 ? AGENT_LABEL_GAP : -AGENT_LABEL_GAP,
      firstY: (-(lineCount - 1) * AGENT_LABEL_LINE_HEIGHT) / 2 + 4,
    }
  }
  if (dy >= 0) {
    return { anchor: 'middle' as const, x: 0, firstY: AGENT_LABEL_GAP + 3 }
  }
  return {
    anchor: 'middle' as const,
    x: 0,
    firstY: -(AGENT_LABEL_GAP - 8 + (lineCount - 1) * AGENT_LABEL_LINE_HEIGHT),
  }
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
        const radius = AGENT_RADIUS + (j % AGENT_RADIUS_TIERS) * AGENT_RADIUS_STAGGER
        return { agent, angle: agentAngle, point: toPoint(agentAngle, radius) }
      })
      return { dept, angle, point: deptPoint, agentPoints }
    })
  }, [])

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
            <svg viewBox="-120 -120 1240 1240" className="map" role="img" aria-label="Company agent map">
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
                    agentPoints.map(({ agent, angle: agentAngle, point: ap }) => {
                      const lines = wrapLabel(agent.name)
                      const placement = labelPlacement(agentAngle, lines.length)
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
                          <circle r={16} />
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
