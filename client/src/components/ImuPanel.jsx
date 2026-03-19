import { useEffect, useRef, useState } from 'react'

export default function ImuPanel({ subscribe }) {
  const canvasRef = useRef(null)
  const [imu, setImu] = useState({ roll: 0, pitch: 0, yaw: 0 })

  useEffect(() => {
    return subscribe('/themis/imu/data_raw', (msg) => {
      setImu({
        roll: msg.orientation.x.toFixed(2),
        pitch: msg.orientation.y.toFixed(2),
        yaw: msg.orientation.z.toFixed(1)
      })
    })
  }, [subscribe])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const r = 58

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fillStyle = '#1a1a1a'
    ctx.fill()
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 0.5
    ctx.stroke()

    const dirs = ['N', 'E', 'S', 'W']
    dirs.forEach((d, i) => {
      const angle = (i * 90 - 90) * Math.PI / 180
      const tx = cx + (r - 14) * Math.cos(angle)
      const ty = cy + (r - 14) * Math.sin(angle)
      ctx.fillStyle = d === 'N' ? '#ef4444' : '#555'
      ctx.font = '500 9px IBM Plex Mono, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(d, tx, ty)
    })

    for (let i = 0; i < 36; i++) {
      const angle = (i * 10 - 90) * Math.PI / 180
      const len = i % 3 === 0 ? 6 : 3
      ctx.beginPath()
      ctx.moveTo(cx + (r - 2) * Math.cos(angle), cy + (r - 2) * Math.sin(angle))
      ctx.lineTo(cx + (r - 2 - len) * Math.cos(angle), cy + (r - 2 - len) * Math.sin(angle))
      ctx.strokeStyle = '#444'
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    const na = (imu.yaw - 90) * Math.PI / 180
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(na)
    ctx.beginPath()
    ctx.moveTo(0, -r + 16)
    ctx.lineTo(5, 8)
    ctx.lineTo(-5, 8)
    ctx.closePath()
    ctx.fillStyle = '#ef4444'
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(0, r - 16)
    ctx.lineTo(5, -8)
    ctx.lineTo(-5, -8)
    ctx.closePath()
    ctx.fillStyle = '#444'
    ctx.fill()
    ctx.restore()

    ctx.beginPath()
    ctx.arc(cx, cy, 4, 0, Math.PI * 2)
    ctx.fillStyle = '#888'
    ctx.fill()

    ctx.fillStyle = '#666'
    ctx.font = '500 10px IBM Plex Mono, monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(Math.round(imu.yaw) + '°', cx, cy + r - 9)
  }, [imu])

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-950">
        <span className="font-mono text-xs text-zinc-500 tracking-widest uppercase">IMU · /themis/imu/data_raw</span>
        <span className="font-mono text-xs text-green-500">100 Hz</span>
      </div>
      <div className="p-3">
        <div className="flex justify-center mb-3">
          <canvas ref={canvasRef} width={130} height={130} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[['Roll', imu.roll + '°'], ['Pitch', imu.pitch + '°'], ['Yaw', imu.yaw + '°']].map(([label, val]) => (
            <div key={label}>
              <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest">{label}</div>
              <div className="font-mono text-sm font-medium text-zinc-200">{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}