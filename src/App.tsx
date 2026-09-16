import { useMemo, useState } from 'react'
import { companyBrain, departments, type Agent, type Department } from './data/company'
import './App.css'

type Selected =
  | { kind: 'brain' }
  | { kind: 'department'; department: Department }
  | { kind: 'agent'; department: Department; agent: Agent }

const CENTER = 500
const DEPT_RADIUS = 200
const AGENT_RADIUS = 355
const AGENT_RADIUS_TIERS = 3
const AGENT_RADIUS_STAGGER = 40
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

export default function App() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [selected, setSelected] = useState<Selected>({ kind: 'brain' })

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
        return { agent, point: toPoint(agentAngle, radius) }
      })
      return { dept, angle, point: deptPoint, agentPoints }
    })
  }, [])

  const isExpanded = (id: string) => expanded === id

  return (
    <div className="app">
      <header className="header">
        <h1>Agent Company Map</h1>
        <p>Click a department to expand its agents. Click an agent to open its skill.</p>
      </header>

      <div className="stage">
        <svg viewBox="0 0 1000 1000" className="map" role="img" aria-label="Company agent map">
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
                agentPoints.map(({ agent, point: ap }) => (
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
                    <circle r={20} />
                    <text
                      y={20 + 11}
                      className="node-label node-label-agent"
                    >
                      {wrapLabel(agent.name).map((line, li) => (
                        <tspan key={li} x={0} dy={li === 0 ? 0 : 11}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </g>
                ))}
            </g>
          ))}
        </svg>
      </div>

      <aside className="panel">
        {selected.kind === 'brain' && (
          <>
            <h2>🧠 {companyBrain.name}</h2>
            <p>{companyBrain.mission}</p>
          </>
        )}
        {selected.kind === 'department' && (
          <>
            <h2>
              {selected.department.icon} {selected.department.name}
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
  )
}
