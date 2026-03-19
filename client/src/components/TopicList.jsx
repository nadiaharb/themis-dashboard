import { useEffect, useState } from 'react'

const TOPICS = [
  { name: '/themis/imu/data_raw', type: 'sensor_msgs/Imu', hz: '100' },
  { name: '/themis/odometry/filtered', type: 'nav_msgs/Odometry', hz: '20' },
  { name: '/themis/drive/track_effort', type: 'themis_msgs/TrackEffort', hz: '10' },
  { name: '/themis/sensor/engine_temp', type: 'std_msgs/Float32', hz: '10' },
  { name: '/themis/battery/state', type: 'sensor_msgs/BatteryState', hz: '1' },
  { name: '/rosout', type: 'rcl_interfaces/Log', hz: '—' },
]

export default function TopicList({ subscribe }) {
  const [active, setActive] = useState(new Set())

  useEffect(() => {
    const unsubs = TOPICS.map(t =>
      subscribe(t.name, () => {
        setActive(prev => new Set([...prev, t.name]))
      })
    )
    return () => unsubs.forEach(fn => fn())
  }, [subscribe])

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-950">
        <span className="font-mono text-xs text-zinc-500 tracking-widest uppercase">ROS2 Topics</span>
        <span className="font-mono text-xs text-green-500">● {active.size} active</span>
      </div>
      <div className="p-2">
        {TOPICS.map(t => (
          <div key={t.name} className="flex items-center gap-2 py-1.5 border-b border-zinc-800 last:border-0 font-mono text-xs">
            <span className={`w-2 h-2 rounded-full shrink-0 ${active.has(t.name) ? 'bg-green-500' : 'bg-zinc-700'}`} />
            <span className="text-blue-400 flex-1 truncate">{t.name}</span>
            <span className="text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded text-xs shrink-0">{t.type}</span>
            <span className="text-green-500 w-10 text-right shrink-0">{t.hz !== '—' ? t.hz + ' Hz' : '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}