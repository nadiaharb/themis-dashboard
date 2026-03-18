import { useEffect, useState } from 'react'
import { useRosBridge } from './hooks/useRosBridge'

export default function App() {
  const { subscribe, onStatusChange } = useRosBridge()
  const [status, setStatus] = useState('connecting...')
  const [speed, setSpeed] = useState(0)

  useEffect(() => {
    return onStatusChange(setStatus)
  }, [onStatusChange])

  useEffect(() => {
    return subscribe('/themis/odometry/filtered', (msg) => {
      setSpeed(msg.twist.linear.x.toFixed(2))
    })
  }, [subscribe])

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <p>Status: {status}</p>
      <p>Speed: {speed} m/s</p>
    </div>
  )
}