'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { Send, Brain, User, Loader2, Trash2, Sparkles, AlertTriangle } from 'lucide-react'
import { useHealthData } from '@/hooks/useHealthData'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { askDoctor } from '@/lib/ai'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/toast-provider'

export default function DrAIPage() {
  const { chatMessages, addChatMessage, clearChat, sugarReadings, bpReadings, labResults, medications } = useHealthData()
  const { addToast } = useToast()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState('main')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const sessionMessages = chatMessages.filter(m => m.sessionId === sessionId)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [sessionMessages, scrollToBottom])

  const buildContext = () => {
    const latestSugar = sugarReadings[0]
    const latestBP = bpReadings[0]
    const activeMeds = medications.filter(m => m.active).map(m => `${m.name} ${m.dosage}`).join(', ')
    const recentLabs = labResults.slice(0, 3).map(l => `${l.title} (${l.category})`).join(', ')
    return `Latest glucose: ${latestSugar ? `${latestSugar.value} ${latestSugar.unit}` : 'N/A'}
Latest BP: ${latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : 'N/A'}
Active medications: ${activeMeds || 'None'}
Recent labs: ${recentLabs || 'None'}
Total readings: ${sugarReadings.length} glucose, ${bpReadings.length} BP`
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    addChatMessage({ role: 'user', content: userMsg, sessionId })
    setLoading(true)
    try {
      const context = buildContext()
      const response = await askDoctor(userMsg, context)
      addChatMessage({ role: 'assistant', content: response.content, sessionId })
    } catch {
      addChatMessage({ role: 'assistant', content: 'I apologize, I encountered an error. Please try again.', sessionId })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const suggested = [
    'What does my latest glucose reading mean?',
    'Is my blood pressure normal?',
    'How can I improve my longevity?',
    'Explain my lab results',
  ]

  const clear = () => {
    clearChat(sessionId)
    addToast('Chat cleared', 'info')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dr. AI</h1>
          <p className="text-sm text-muted-foreground">Your personal health assistant</p>
        </div>
        <Button variant="outline" size="sm" onClick={clear} className="gap-2">
          <Trash2 className="w-4 h-4" /> Clear
        </Button>
      </div>

      <Card className="mb-4 bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200/60 dark:border-yellow-800/30">
        <CardContent className="p-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            Dr. AI provides general information only. Always consult a healthcare provider for diagnosis and treatment.
          </p>
        </CardContent>
      </Card>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide pr-1">
        {sessionMessages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-semibold mb-1">Welcome to Dr. AI</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Ask me about your health data, symptoms, medications, or general wellness questions. I know your current readings.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
              {suggested.map(q => (
                <button key={q} onClick={() => { setInput(q); textareaRef.current?.focus() }}
                  className="p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-left text-sm transition-all">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {sessionMessages.map(msg => (
          <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
              msg.role === 'user' ? 'bg-primary/10' : 'bg-gradient-to-br from-primary to-sky-400')}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-primary" /> : <Brain className="w-4 h-4 text-white" />}
            </div>
            <div className={cn('max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
              msg.role === 'user' ? 'bg-primary text-white rounded-br-md' : 'bg-muted/80 rounded-bl-md border border-border')}>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {msg.content.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) return <h2 key={i} className="text-base font-bold mt-2 mb-1">{line.replace('## ', '')}</h2>
                  if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold mt-2">{line.replace(/\*\*/g, '')}</p>
                  if (line.startsWith('• ')) return <li key={i} className="ml-4">{line.replace('• ', '')}</li>
                  if (line.startsWith('- ')) return <li key={i} className="ml-4">{line.replace('- ', '')}</li>
                  if (line.trim() === '') return <div key={i} className="h-1" />
                  return <p key={i}>{line}</p>
                })}
              </div>
              <p className={cn('text-[10px] mt-2', msg.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                {format(new Date(msg.timestamp), 'h:mm a')}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="bg-muted/80 rounded-2xl rounded-bl-md px-4 py-3 border border-border">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Dr. AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <Textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Ask Dr. AI about your health..." rows={1} className="min-h-[44px] max-h-[120px] resize-none" />
        <Button onClick={handleSend} disabled={!input.trim() || loading} className="h-auto px-4 bg-gradient-to-r from-primary to-sky-400 hover:opacity-90">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
