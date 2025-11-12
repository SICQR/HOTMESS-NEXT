'use client';
import React from 'react'

interface ToastProps {
  message: string
  onClose: () => void
}

export default function Toast({ message, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-2xl shadow-2xl z-50 max-w-sm" role="alert" aria-live="assertive">
      {message}
    </div>
  )
}

// HOTMESS ADD Toast context/provider for global usage
interface ToastMessage { id: string; text: string }
interface ToastContextValue { push: (text: string) => void }
const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = React.useState<ToastMessage[]>([])
  const push = React.useCallback((text: string) => {
    setMessages(msgs => [...msgs, { id: Math.random().toString(36).slice(2), text }])
  }, [])
  // HOTMESS ADD: listen for global hm:toast events for server redirects, etc.
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { text?: string } | undefined
      if (detail?.text) push(detail.text)
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('hm:toast', handler as EventListener)
      return () => window.removeEventListener('hm:toast', handler as EventListener)
    }
  }, [push])
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div aria-live="polite" aria-atomic="true">
        {messages.map(m => (
          <Toast key={m.id} message={m.text} onClose={() => setMessages(msgs => msgs.filter(x => x.id !== m.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}
