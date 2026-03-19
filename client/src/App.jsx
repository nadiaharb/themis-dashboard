import { useEffect, useState } from 'react'
import { useRosBridge } from './hooks/useRosBridge'
import ImuPanel from './components/ImuPanel'
import DrivePanel from './components/DrivePanel'
import LogPanel from './components/LogPanel'
import TopicList from './components/TopicList'

export default function App() {
  const { subscribe, onStatusChange } = useRosBridge()
  const [status, setStatus] = useState('connecting')
  const [speed, setSpeed] = useState(0)
  const [battery, setBattery] = useState(23)

  useEffect(() => {
    return onStatusChange(setStatus)
  }, [onStatusChange])

  useEffect(() => {
    return subscribe('/themis/odometry/filtered', (msg) => {
      setSpeed(msg.twist.linear.x.toFixed(2))
    })
  }, [subscribe])

  useEffect(() => {
    return subscribe('/themis/battery/state', (msg) => {
      setBattery(msg.percentage.toFixed(1))
    })
  }, [subscribe])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <div className="border-b border-zinc-800 bg-zinc-900 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-mono text-xs text-zinc-500 tracking-widest uppercase">UGV-THeMIS · Unit 07</div>
            <div className="font-mono text-base font-medium tracking-wide">THeMIS 140</div>
          </div>
          <div className={`flex items-center gap-1.5 font-mono text-xs px-2 py-1 rounded border ${
            status === 'connected'
              ? 'text-green-400 border-green-800 bg-green-950'
              : 'text-red-400 border-red-800 bg-red-950'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {status === 'connected' ? 'ROS2 CONNECTED' : 'DISCONNECTED'}
          </div>
        </div>
        <div className="flex gap-6 font-mono text-xs text-zinc-500">
          <span>SPEED <span className="text-green-400 ml-1">{speed} m/s</span></span>
          <span>BATTERY <span className="text-yellow-400 ml-1">{battery}%</span></span>
          <span>RMW <span className="text-zinc-300 ml-1">FASTDDS</span></span>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 gap-4">
        <ImuPanel subscribe={subscribe} />
        <DrivePanel subscribe={subscribe} />
        <TopicList subscribe={subscribe} />
        <LogPanel subscribe={subscribe} />
      </div>
    </div>
  )
}