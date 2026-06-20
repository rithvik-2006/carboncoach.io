'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Leaf, Send, User, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'

const SUGGESTED_PROMPTS = [
  'What are my biggest carbon sources this month?',
  'How can I reduce my transport emissions?',
  'Am I on track to hit my monthly goal?',
  'Give me 3 quick wins to lower my footprint',
]

function getUIMessageText(msg: { parts?: { type: string; text?: string }[] }): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return ''
  return msg.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('')
}


export function ChatInterface() {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/coach' }),
  })

  const isStreaming = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    if (error) {
      toast.error('AI Coach encountered an error. Please try again later or check your connection.')
    }
  }, [error])

  useEffect(() => {
    const viewport = document.querySelector('[data-radix-scroll-area-viewport]')
    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: 'smooth',
      })
    } else {
      // Fallback if viewport isn't found
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, isStreaming])

  function handleSend() {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    try {
      sendMessage({ text })
    } catch {
      toast.error('Failed to send message.')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col gap-4 h-[700px] w-full">
      {/* Dynamic Main Workspace Container Card */}
      <Card className="flex-1 min-h-0 shadow-md border-muted/70 bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-muted/60 flex items-center justify-between bg-card/60 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Sparkles className="size-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Interactive Consulting Session</div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> 
                System synced with active database logs
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0 w-full">
          <div className="flex flex-col gap-6 p-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center gap-6 py-12 max-w-xl mx-auto text-center animate-in fade-in duration-300">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shadow-sm shadow-emerald-500/10">
                  <Leaf className="size-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    Meet your Smart Carbon Assistant
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    I run dynamic lookups against your dashboard activities. Ask me details on metric shifts, targeted savings plans, or compliance.
                  </p>
                </div>
                
                {/* Suggestions Pills layout Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full pt-2">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => {
                        setInput(prompt)
                        sendMessage({ text: prompt })
                      }}
                      className="text-left text-xs text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted border border-muted/80 hover:border-muted-foreground/30 px-4 py-3 rounded-xl transition-all active:scale-[0.99]"
                    >
                      {prompt}
                    </button>
                    ))}
                </div>
              </div>
            )}

            {/* Loop through historical messaging stack */}
            {messages.map((message) => {
              const isUser = message.role === 'user'
              const text = getUIMessageText(message)

              return (
                <div
                  key={message.id}
                  className={cn('flex gap-3.5 animate-in fade-in duration-200', isUser ? 'flex-row-reverse' : 'flex-row')}
                >
                  <Avatar className="size-9 border shrink-0 shadow-sm">
                    <AvatarFallback
                      className={cn(
                        'text-xs font-semibold',
                        isUser
                          ? 'bg-primary text-primary-foreground border-transparent'
                          : 'bg-card text-emerald-500 border-muted-foreground/10',
                      )}
                    >
                      {isUser ? <User className="size-4" /> : <Leaf className="size-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      'max-w-[82%] rounded-2xl px-4 py-3.5 text-sm shadow-sm transition-all',
                      isUser
                        ? 'rounded-tr-none bg-primary text-primary-foreground font-medium'
                        : 'rounded-tl-none bg-muted/60 text-muted-foreground border border-muted/50 dark:bg-muted/30 dark:text-zinc-200',
                    )}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
                    ) : (
                      <div className="prose dark:prose-invert prose-sm max-w-none break-words leading-relaxed tracking-normal marker:text-primary prose-headings:text-foreground prose-p:text-muted-foreground dark:prose-p:text-zinc-200 prose-th:text-foreground prose-td:text-muted-foreground dark:prose-td:text-zinc-200 prose-strong:text-foreground">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {text}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Streaming Ellipsis loading banner */}
            {isStreaming && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3.5 items-center">
                <Avatar className="size-9 border shrink-0 bg-card">
                  <AvatarFallback className="text-emerald-500 border-muted-foreground/10">
                    <Leaf className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-none bg-muted/60 border border-muted/50 px-4 py-3.5">
                  <span className="size-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]" />
                  <span className="size-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]" />
                  <span className="size-2 animate-bounce rounded-full bg-emerald-500" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Dynamic Action Interaction Footer Bar */}
        <div className="p-4 bg-card/40 border-t border-muted/60 backdrop-blur-sm space-y-3">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your coach anything about your carbon footprint..."
              disabled={isStreaming}
              className="flex-1 h-11 bg-background/50 border-muted/80 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 rounded-xl transition-all"
            />
            <Button 
              onClick={handleSend} 
              disabled={isStreaming || !input.trim()} 
              size="icon"
              className="h-11 w-11 shrink-0 rounded-xl bg-primary hover:bg-primary/90 transition-all active:scale-95"
            >
              <Send className="size-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>

          {messages.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 animate-in fade-in duration-200">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70 whitespace-nowrap mr-1">Quick Followups:</span>
              {SUGGESTED_PROMPTS.slice(0, 3).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    setInput(prompt)
                    sendMessage({ text: prompt })
                  }}
                  disabled={isStreaming}
                  className="rounded-full border border-muted-foreground/10 bg-muted/30 hover:bg-muted/70 px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 whitespace-nowrap active:scale-[0.98]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
