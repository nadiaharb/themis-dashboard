import { useEffect, useRef, useCallback } from 'react'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:9090'
const RECONNECT_DELAY = 2000

export function useRosBridge() {
  const ws = useRef(null)
  const subscribers = useRef({})
  const reconnectTimer = useRef(null)
  const statusCallbacks = useRef([])

  const notifyStatus = useCallback((status) => {
    for (const cb of statusCallbacks.current) cb(status)
  }, [])

  const connect = useCallback(() => {
    ws.current = new WebSocket(WS_URL)

    ws.current.onopen = () => {
      notifyStatus('connected')
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current)
        reconnectTimer.current = null
      }
    }

    ws.current.onmessage = (event) => {
      let msg
      try {
        msg = JSON.parse(event.data)
      } catch {
        return
      }

      if (msg.op === 'publish' && msg.topic) {
        const cbs = subscribers.current[msg.topic]
        if (cbs) {
          for (const cb of cbs) cb(msg.msg)
        }
      }
    }

    ws.current.onclose = () => {
      notifyStatus('disconnected')
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY)
    }

    ws.current.onerror = () => {
      ws.current.close()
    }
  }, [notifyStatus])

  useEffect(() => {
    connect()
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      ws.current?.close()
    }
  }, [connect])

  const subscribe = useCallback((topic, callback) => {
  if (!subscribers.current[topic]) {
    subscribers.current[topic] = new Set()
  }
  subscribers.current[topic].add(callback)

  const sendSubscribe = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ op: 'subscribe', topic }))
    }
  }

  if (ws.current?.readyState === WebSocket.OPEN) {
    sendSubscribe()
  } else {
    ws.current?.addEventListener('open', sendSubscribe, { once: true })
  }

  return () => {
    subscribers.current[topic]?.delete(callback)
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ op: 'unsubscribe', topic }))
    }
  }
}, [])

  const onStatusChange = useCallback((callback) => {
    statusCallbacks.current.push(callback)
    return () => {
      statusCallbacks.current = statusCallbacks.current.filter(cb => cb !== callback)
    }
  }, [])

  return { subscribe, onStatusChange }
}