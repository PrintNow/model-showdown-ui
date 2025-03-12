import React from 'react'

const ChatList: React.FC = () => {
  // 模拟对话列表数据
  const chats = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    title: `对话${i + 1}`,
  }))

  return (
    <div className="overflow-y-auto h-full">
      {chats.map((chat) => (
        <button
          key={chat.id}
          className="w-full text-left px-4 py-3 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
        >
          {chat.title}
        </button>
      ))}
    </div>
  )
}

export default ChatList 