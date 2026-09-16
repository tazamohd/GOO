import type { Agent, Department } from '../data/company'
import type { Task } from '../types'

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'this', 'that', 'please', 'need',
  'needs', 'needed', 'want', 'wants', 'help', 'into', 'about', 'have',
  'has', 'our', 'your', 'you', 'can', 'could', 'would', 'should', 'just',
  'some', 'more', 'get', 'got', 'make', 'made', 'a', 'an', 'to', 'of',
  'is', 'are', 'be', 'on', 'in', 'it', 'we', 'us', 'i',
])

function tokenize(text: string): string[] {
  const words = text.toLowerCase().match(/[a-z]{3,}/g) ?? []
  return words.filter((w) => !STOPWORDS.has(w))
}

function scoreOverlap(haystack: string, words: string[]): number {
  const hay = haystack.toLowerCase()
  return words.reduce((acc, w) => acc + (new RegExp(`\\b${w}\\b`).test(hay) ? 1 : 0), 0)
}

export function pickDepartment(text: string, departments: Department[]): Department | null {
  const words = tokenize(text)
  if (words.length === 0) return null

  let best: Department | null = null
  let bestScore = 0
  for (const dept of departments) {
    const haystack = [
      dept.name,
      dept.mission,
      ...dept.agents.flatMap((a) => [a.name, a.role, a.skill]),
    ].join(' ')
    const score = scoreOverlap(haystack, words)
    if (score > bestScore) {
      bestScore = score
      best = dept
    }
  }
  return best
}

export function pickAgent(dept: Department, text: string): Agent {
  const words = tokenize(text)
  let best = dept.agents[0]
  let bestScore = -1
  for (const agent of dept.agents) {
    const score = scoreOverlap(`${agent.name} ${agent.role} ${agent.skill}`, words)
    if (score > bestScore) {
      bestScore = score
      best = agent
    }
  }
  return best
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim()
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed
}

export type NewTask = Omit<Task, 'id' | 'progress' | 'status' | 'createdAt'>

export function orchestratorReply(
  text: string,
  departments: Department[],
): { reply: string; task?: NewTask } {
  const dept = pickDepartment(text, departments)
  if (!dept) {
    const names = departments.map((d) => d.name).join(', ')
    return {
      reply: `I don't have a clear owner for that yet. Departments I can route to: ${names}. Mention one, or be more specific about what you need done.`,
    }
  }
  const agent = pickAgent(dept, text)
  return {
    reply: `Got it — that sounds like a ${dept.name} job. Routing it to the ${dept.name} team; ${agent.name} will pick it up.`,
    task: {
      title: truncate(text, 70),
      departmentId: dept.id,
      agentId: agent.id,
      agentName: agent.name,
      origin: 'orchestrator',
    },
  }
}

export function leaderReply(dept: Department, text: string): { reply: string; task: NewTask } {
  const agent = pickAgent(dept, text)
  return {
    reply: `On it. I'll have ${agent.name} run: “${truncate(agent.skill, 90)}”`,
    task: {
      title: truncate(text, 70),
      departmentId: dept.id,
      agentId: agent.id,
      agentName: agent.name,
      origin: 'direct',
    },
  }
}

export function greetingFor(name: string, mission: string): string {
  return `Hi, I'm the ${name}. ${mission} Tell me what you need.`
}
