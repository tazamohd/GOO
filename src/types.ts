export interface ChatMessage {
  id: string
  role: 'user' | 'agent'
  text: string
  ts: number
}

export type TaskOrigin = 'orchestrator' | 'direct'
export type TaskStatus = 'running' | 'done'

export interface Task {
  id: string
  title: string
  departmentId: string
  agentId: string
  agentName: string
  origin: TaskOrigin
  progress: number
  status: TaskStatus
  createdAt: number
}
