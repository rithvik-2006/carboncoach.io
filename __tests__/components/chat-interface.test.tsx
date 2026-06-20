import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock ESM-only modules that Jest/jsdom cannot parse
jest.mock('ai', () => ({
  DefaultChatTransport: jest.fn().mockImplementation(() => ({})),
}))
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => children,
}))
jest.mock('remark-gfm', () => ({
  __esModule: true,
  default: () => {},
}))
jest.mock('sonner', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}))

jest.mock('@ai-sdk/react', () => ({
  useChat: jest.fn(),
}))

jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }: any) => (
    <div className={className} data-slot="scroll-area">
      <div data-radix-scroll-area-viewport="true" style={{ overflow: 'auto' }}>
        {children}
      </div>
    </div>
  ),
  ScrollBar: () => null,
}))

// Must import after jest.mock declarations
import { ChatInterface } from '@/components/coach/chat-interface'
import { useChat } from '@ai-sdk/react'

const mockUseChat = useChat as jest.Mock

describe('ChatInterface Component Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders initial welcome screen with suggestion prompts', () => {
    mockUseChat.mockReturnValue({
      messages: [],
      sendMessage: jest.fn(),
      status: 'ready',
      error: null,
    })

    render(<ChatInterface />)

    expect(screen.getByText('Meet your Smart Carbon Assistant')).toBeInTheDocument()
    expect(screen.getByText('What are my biggest carbon sources this month?')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ask your coach anything about your carbon footprint...')).toBeInTheDocument()
  })

  it('renders chat message log correctly', () => {
    mockUseChat.mockReturnValue({
      messages: [
        { id: 'm1', role: 'user', parts: [{ type: 'text', text: 'Hello Carbon Coach' }] },
        { id: 'm2', role: 'assistant', parts: [{ type: 'text', text: 'Hello! How can I assist you with your carbon reduction goals today?' }] },
      ],
      sendMessage: jest.fn(),
      status: 'ready',
      error: null,
    })

    render(<ChatInterface />)

    expect(screen.getByText('Hello Carbon Coach')).toBeInTheDocument()
    expect(screen.getByText('Hello! How can I assist you with your carbon reduction goals today?')).toBeInTheDocument()
  })

  it('calls sendMessage when a message is entered and the send button is clicked', () => {
    const mockSendMessage = jest.fn()
    mockUseChat.mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      status: 'ready',
      error: null,
    })

    render(<ChatInterface />)

    const inputEl = screen.getByPlaceholderText('Ask your coach anything about your carbon footprint...')
    fireEvent.change(inputEl, { target: { value: 'How can I save carbon?' } })

    const sendBtn = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(sendBtn)

    expect(mockSendMessage).toHaveBeenCalledWith({ text: 'How can I save carbon?' })
  })

  it('calls sendMessage when a suggestion pill is clicked', () => {
    const mockSendMessage = jest.fn()
    mockUseChat.mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      status: 'ready',
      error: null,
    })

    render(<ChatInterface />)

    const pill = screen.getByText('Am I on track to hit my monthly goal?')
    fireEvent.click(pill)

    expect(mockSendMessage).toHaveBeenCalledWith({ text: 'Am I on track to hit my monthly goal?' })
  })

  it('renders error toast when error state is present', () => {
    mockUseChat.mockReturnValue({
      messages: [],
      sendMessage: jest.fn(),
      status: 'ready',
      error: new Error('API failure'),
    })
    render(<ChatInterface />)
    const { toast } = require('sonner')
    expect(toast.error).toHaveBeenCalledWith(
      'AI Coach encountered an error. Please try again later or check your connection.'
    )
  })

  it('calls sendMessage when Enter key is pressed on input field', () => {
    const mockSendMessage = jest.fn()
    mockUseChat.mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      status: 'ready',
      error: null,
    })
    render(<ChatInterface />)
    const inputEl = screen.getByPlaceholderText('Ask your coach anything about your carbon footprint...')
    fireEvent.change(inputEl, { target: { value: 'Test message' } })
    
    // Press Shift+Enter (should not send)
    fireEvent.keyDown(inputEl, { key: 'Enter', shiftKey: true })
    expect(mockSendMessage).not.toHaveBeenCalled()

    // Press Enter (should send)
    fireEvent.keyDown(inputEl, { key: 'Enter', shiftKey: false })
    expect(mockSendMessage).toHaveBeenCalledWith({ text: 'Test message' })
  })

  it('renders error toast when sendMessage throws an error', () => {
    const mockSendMessage = jest.fn().mockImplementation(() => {
      throw new Error('Send failed')
    })
    mockUseChat.mockReturnValue({
      messages: [],
      sendMessage: mockSendMessage,
      status: 'ready',
      error: null,
    })
    render(<ChatInterface />)
    const inputEl = screen.getByPlaceholderText('Ask your coach anything about your carbon footprint...')
    fireEvent.change(inputEl, { target: { value: 'Fail test' } })
    const sendBtn = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(sendBtn)
    
    const { toast } = require('sonner')
    expect(toast.error).toHaveBeenCalledWith('Failed to send message.')
  })

  it('scrolls Radix ScrollArea viewport when messages update', () => {
    const mockScrollTo = jest.fn()
    const originalQuerySelector = document.querySelector
    document.querySelector = jest.fn().mockImplementation((selector) => {
      if (selector === '[data-radix-scroll-area-viewport]') {
        return { scrollTo: mockScrollTo, scrollHeight: 500 }
      }
      return null
    })

    mockUseChat.mockReturnValue({
      messages: [
        { id: 'm1', role: 'user', parts: [{ type: 'text', text: 'Hello' }] }
      ],
      sendMessage: jest.fn(),
      status: 'ready',
      error: null,
    })

    render(<ChatInterface />)
    expect(mockScrollTo).toHaveBeenCalledWith({ top: 500, behavior: 'smooth' })

    // Restore
    document.querySelector = originalQuerySelector
  })

  it('renders quick followups and handles click when message list is not empty', () => {
    const mockSendMessage = jest.fn()
    mockUseChat.mockReturnValue({
      messages: [
        { id: 'm1', role: 'user', parts: [{ type: 'text', text: 'Hi' }] }
      ],
      sendMessage: mockSendMessage,
      status: 'ready',
      error: null,
    })

    render(<ChatInterface />)
    
    // Quick followups section should be visible
    expect(screen.getByText('Quick Followups:')).toBeInTheDocument()
    
    // Click a followup prompt
    const pill = screen.getByText('Am I on track to hit my monthly goal?')
    fireEvent.click(pill)
    
    expect(mockSendMessage).toHaveBeenCalledWith({ text: 'Am I on track to hit my monthly goal?' })
  })
})

