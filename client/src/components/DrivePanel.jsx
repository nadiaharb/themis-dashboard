import { useEffect, useState } from 'react'

function GaugeBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="font-mono text-xs text-zinc-500 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="font-mono text-xs text-zinc-400 w-8 text-right">{value}%</span>
    </div>
  )
}

export default function DrivePanel({ subscribe }) {
  const [drive, setDrive] = useState({
    left_forward: 0, left_reverse: 0,
    right_forward: 0, right_reverse: 0
  })

  useEffect(() => {
    return subscribe('/themis/drive/track_effort', (msg) => {
      setDrive(msg)
    })
  }, [subscribe])

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-950">
        <span className="font-mono text-xs text-zinc-500 tracking-widest uppercase">Drive · /themis/drive/track_effort</span>
        <span className="font-mono text-xs text-green-500">10 Hz</span>
      </div>
      <div className="p-3">
        <div className="font-mono text-xs text-zinc-600 uppercase tracking-widest mb-2">Track effort %</div>
        <GaugeBar label="Left fwd" value={drive.left_forward} color="#22c55e" />
        <GaugeBar label="Left rev" value={drive.left_reverse} color="#ef4444" />
        <GaugeBar label="Right fwd" value={drive.right_forward} color="#22c55e" />
        <GaugeBar label="Right rev" value={drive.right_reverse} color="#ef4444" />
      </div>
    </div>
  )
}