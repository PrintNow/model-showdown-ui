import { useState, useRef, useEffect } from 'react'
import ChatInput from './ChatInput'
import ModelResponse from './ModelResponse'
import type { Message, ModelConfig, Chat as ChatType } from '../../types'
import ChatList from './ChatList'

interface ChatProps {
  onOpenSettings: () => void
}

const Chat: React.FC<ChatProps> = ({ onOpenSettings }) => {
  const [chats, setChats] = useState<ChatType[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // 从 localStorage 获取模型配置
  const modelConfigs = JSON.parse(localStorage.getItem('modelConfigs') || '[]') as ModelConfig[]

  // 初始化加载对话列表
  useEffect(() => {
    const savedChats = localStorage.getItem('chats')
    let loadedChats: ChatType[] = []
    
    if (savedChats) {
      loadedChats = JSON.parse(savedChats)
    } else {
      // 创建默认对话
      const defaultChat: ChatType = {
        id: Date.now().toString(),
        title: '对话1',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      loadedChats = [defaultChat]
      localStorage.setItem('chats', JSON.stringify(loadedChats))
    }
    
    setChats(loadedChats)
    setCurrentChatId(loadedChats[0]?.id || null)
  }, [])

  // 保存对话到 localStorage
  const saveChats = (updatedChats: ChatType[]) => {
    localStorage.setItem('chats', JSON.stringify(updatedChats))
    setChats(updatedChats)
  }

  // 创建新对话
  const handleCreateChat = () => {
    const newChat: ChatType = {
      id: Date.now().toString(),
      title: `对话${chats.length + 1}`,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    const updatedChats = [...chats, newChat]
    saveChats(updatedChats)
    setCurrentChatId(newChat.id)
  }

  // 处理消息提交
  const handleSubmit = async (content: string) => {
    if (!content.trim() || isLoading || !currentChatId) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    // 更新当前对话的消息
    const updatedChats = chats.map(chat => {
      if (chat.id === currentChatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          updatedAt: new Date().toISOString(),
        }
      }
      return chat
    })

    saveChats(updatedChats)
    setIsLoading(true)

    // TODO: 实现对各个模型的请求
    // 这里应该并行请求所有已配置的模型

    setIsLoading(false)
  }

  // 获取当前对话
  const currentChat = chats.find(chat => chat.id === currentChatId)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [currentChat?.messages])

  return (
    <div className="flex h-screen">
      {/* 左侧对话列表 */}
      <div className="w-64 bg-white border-r">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">Chat</h1>
        </div>
        <ChatList
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={setCurrentChatId}
          onCreateChat={handleCreateChat}
        />
      </div>

      {/* 右侧内容区域 */}
      <div className="flex-1 flex flex-col">
        {/* 输入区域 */}
        <div className="p-4 border-b bg-white">
          <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* 聊天内容区域 */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {currentChat?.messages.map((message) => (
            <div key={message.id} className="space-y-4">
              {/* 用户消息 */}
              {message.role === 'user' && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-gray-700">{message.content}</p>
                </div>
              )}
              
              {/* 模型响应 */}
              {message.role === 'assistant' && (
                <div className="grid grid-cols-3 gap-4">
                  {modelConfigs.map((config) => (
                    <ModelResponse
                      key={config.id}
                      modelName={config.name}
                      content={message.content}
                      timestamp={message.timestamp}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Chat 