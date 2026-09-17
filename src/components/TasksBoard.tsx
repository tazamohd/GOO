import type { Department } from '../data/company'
import type { Task } from '../types'
import './TasksBoard.css'

interface TasksBoardProps {
  tasks: Task[]
  departments: Department[]
  variant?: 'grid' | 'feed'
}

export default function TasksBoard({ tasks, departments, variant = 'grid' }: TasksBoardProps) {
  const deptById = new Map(departments.map((d) => [d.id, d]))
  const isFeed = variant === 'feed'

  if (tasks.length === 0) {
    return isFeed ? (
      <div className="tasks-empty tasks-empty-feed">
        No active tasks — chat with the Orchestrator or a department to start one.
      </div>
    ) : (
      <div className="tasks-empty">
        <p>No tasks yet.</p>
        <p>
          Open the map, select the Company Brain or a department, and send a message to kick one
          off.
        </p>
      </div>
    )
  }

  return (
    <div className={isFeed ? 'tasks-feed' : 'tasks-board'}>
      {tasks.map((task) => {
        const dept = deptById.get(task.departmentId)
        return (
          <div
            key={task.id}
            className={`task-card ${isFeed ? 'task-card-feed' : ''}`}
            style={{ ['--dept-color' as string]: dept?.color }}
          >
            <div className="task-card-header">
              <span className="task-dept">
                {dept?.icon} {dept?.name}
              </span>
              <span className={`task-status task-status-${task.status}`}>
                {task.status === 'done' ? 'Done' : 'Running'}
              </span>
            </div>
            <p className="task-title">{task.title}</p>
            <div className="task-meta">
              <span>{task.agentName}</span>
              <span className="task-origin">
                {task.origin === 'orchestrator' ? 'via Orchestrator' : 'direct request'}
              </span>
            </div>
            <div className="task-progress-track">
              <div className="task-progress-fill" style={{ width: `${task.progress}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
