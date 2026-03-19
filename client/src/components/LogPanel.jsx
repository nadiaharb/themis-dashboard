import { useEffect, useState } from 'react'

const MAX_LOGS = 50

export default function LogPanel({ subscribe }) {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    return subscribe('/rosout', (msg) => {
      const entry = {
        id: Date.now() + Math.random(),
        time: new Date().toISOString().substr(11, 8),
        node: msg.name,
        text: msg.msg,
        level: msg.level
      }
      setLogs(prev => [entry, ...prev].slice(0, MAX_LOGS))
    })
  }, [subscribe])

  function levelColor(level) {
    if (level >= 40) return 'text-red-400'
    if (level >= 30) return 'text-yellow-400'
    return 'text-zinc-400'
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-950">
        <span className="font-mono text-xs text-zinc-500 tracking-widest uppercase">Log · /rosout</span>
        <span className="font-mono text-xs text-zinc-600">{logs.length} msgs</span>
      </div>
      <div className="h-36 overflow-y-auto p-2">
        {logs.length === 0 && (
          <p className="font-mono text-xs text-zinc-600 p-1">Waiting for messages...</p>
        )}
        {logs.map(log => (
          <div key={log.id} className="flex gap-2 font-mono text-xs mb-1">
            <span className="text-zinc-600 shrink-0">{log.time}</span>
            <span className="text-blue-400 shrink-0">[{log.node}]</span>
            <span className={levelColor(log.level)}>{log.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}