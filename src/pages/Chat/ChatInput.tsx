import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { FiSend } from 'react-icons/fi'

interface ChatInputProps {
  onSubmit: (content: string) => void
  isLoading: boolean
}

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, isLoading }) => {
  const [content, setContent] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    if (content.trim() && !isLoading) {
      onSubmit(content)
      setContent('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  useEffect(() => {
    const handleSlashKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleSlashKey as any)
    return () => document.removeEventListener('keydown', handleSlashKey as any)
  }, [])

  return (
    <div className="flex items-center space-x-2">
      <input
        ref={inputRef}
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='Input text ... (Press "/")'
        className="flex-1 p-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isLoading}
      />
      <button
        onClick={handleSubmit}
        disabled={!content.trim() || isLoading}
        className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FiSend size={20} />
      </button>
    </div>
  )
}

export default ChatInput 