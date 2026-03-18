import { WebSocketServer } from 'ws'
import { startSimulation } from './simulator.js'

const PORT = 9090
const wss = new WebSocketServer({ port: PORT })

const clients = new Set()
const subscriptions = new Map()

function broadcast(message) {
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(message)
    }
  }
}

wss.on('connection', (ws) => {
  clients.add(ws)
  console.log(`Client connected — ${clients.size} total`)

  ws.send(JSON.stringify({
    op: 'status',
    level: 'info',
    msg: 'Connected to THeMIS rosbridge simulator'
  }))

  ws.on('message', (raw) => {
    let msg
    try {
      msg = JSON.parse(raw)
    } catch {
      return
    }

    if (msg.op === 'subscribe') {
      if (!subscriptions.has(msg.topic)) {
        subscriptions.set(msg.topic, new Set())
      }
      subscriptions.get(msg.topic).add(ws)
      console.log(`Subscribed: ${msg.topic}`)
    }

    if (msg.op === 'unsubscribe') {
      subscriptions.get(msg.topic)?.delete(ws)
    }
  })

  ws.on('close', () => {
    clients.delete(ws)
    for (const subs of subscriptions.values()) {
      subs.delete(ws)
    }
    console.log(`Client disconnected — ${clients.size} remaining`)
  })
})

startSimulation(broadcast)
console.log(`THeMIS bridge running on ws://localhost:${PORT}`)