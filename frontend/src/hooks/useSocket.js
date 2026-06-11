import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../stores/authStore'

export function useSocket(callback) {
  const socketRef = useRef(null)
  const { token } = useAuthStore()

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      auth: { token }
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id)
      socket.emit('subscribe', 'factory-updates')
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    socket.on('connect_error', (err) => {
      console.log('Socket connection error:', err.message)
    })

    if (callback) {
      callback(socket)
    }

    return () => {
      socket.disconnect()
    }
  }, [token, callback])

  return socketRef.current
}
