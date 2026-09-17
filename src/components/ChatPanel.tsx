import { useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '../types'
import './ChatPanel.css'

interface ChatPanelProps {
  color: string
  messages: ChatMessage[]
  isTyping: boolean
  onSend: (text: string) => void
}

export default function ChatPanel({ color, messages, isTyping, onSend }: ChatPanelProps) {
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages, isTyping])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
  }

  return (
    <div className="chat" style={{ ['--chat-color' as string]: color }}>
      <div className="chat-messages" ref={listRef}>
        {messages.map((m) => (
          <div key={m.id} className={`chat-msg chat-msg-${m.role}`}>
            {m.text}
          </div>
        ))}
        {isTyping && (
          <div className="chat-msg chat-msg-agent chat-typing">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>
      <form className="chat-input" onSubmit={submit}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a request…"
          aria-label="Message"
        />
        <button type="submit" disabled={!draft.trim()}>
          Send
        </button>
      </form>
    </div>
  )
}
