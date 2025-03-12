import React from 'react';
import { Chat } from './ChatLayout';

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats,
  activeChat,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  collapsed,
  onToggleCollapse,
}) => {
  return (
    <div className="h-full flex flex-col">
      {/* 顶部新建按钮 */}
      <div className="p-2 border-b border-gray-200">
        <button
          onClick={onNewChat}
          className={`${
            collapsed 
              ? 'w-10 h-10 p-0 rounded-full' 
              : 'w-full py-2 px-4 rounded-md'
          } bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center`}
          title="新建会话"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          {!collapsed && <span className="ml-2">新建会话</span>}
        </button>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`group relative hover:bg-gray-100 ${
              activeChat === chat.id ? 'bg-gray-100' : ''
            }`}
          >
            <button
              onClick={() => onSelectChat(chat.id)}
              className={`w-full text-left ${
                collapsed ? 'px-2 py-3 flex justify-center' : 'px-4 py-3 flex items-center gap-3'
              }`}
              title={collapsed ? chat.title : undefined}
            >
              {collapsed ? (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
                  {chat.title.charAt(0)}
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{chat.title}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(chat.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )}
              {!collapsed && (
                <div className="text-xs text-gray-400">
                  {chat.messages.length} 条消息
                </div>
              )}
            </button>
            {/* 删除按钮 */}
            {!collapsed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-opacity"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V8z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
      
      {/* 底部收缩/展开按钮 */}
      <div className="border-t border-gray-200 p-2 flex justify-center">
        <button
          onClick={onToggleCollapse}
          className="block w-full text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 flex items-center justify-center"
          title={collapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            {collapsed ? (
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}; 