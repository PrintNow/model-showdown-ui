import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from './ChatLayout';

// 创建一个全局事件总线用于跨组件通信
export const scrollEventBus = {
  listeners: new Map<string, Set<() => void>>(),
  subscribe(messageId: string, callback: () => void) {
    if (!this.listeners.has(messageId)) {
      this.listeners.set(messageId, new Set());
    }
    this.listeners.get(messageId)?.add(callback);
    return () => {
      const callbacks = this.listeners.get(messageId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(messageId);
        }
      }
    };
  },
  publish(messageId: string) {
    const callbacks = this.listeners.get(messageId);
    if (callbacks) {
      callbacks.forEach(callback => callback());
    }
  }
};

interface ModelCardProps {
  model: string;
  messages: Message[];
}

export const ModelCard: React.FC<ModelCardProps> = ({ model, messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // 为每个消息创建引用
  const messageRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 滚动到特定消息
  const scrollToMessage = (messageId: string) => {
    if (messageRefs.current[messageId]) {
      messageRefs.current[messageId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 为每个消息注册滚动事件监听
  useEffect(() => {
    const unsubscribes = messages.map(message => 
      scrollEventBus.subscribe(message.id, () => scrollToMessage(message.id))
    );
    
    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [messages]);

  // 处理消息点击事件
  const handleMessageClick = (messageId: string, event: React.MouseEvent) => {
    // 阻止事件冒泡，避免多次触发
    event.stopPropagation();
    // 通知所有订阅了该消息ID的组件
    scrollEventBus.publish(messageId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
      {/* 模型标题 */}
      <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between shrink-0 bg-gray-50">
        <h3 className="font-medium text-sm">{model}</h3>
        <div className="flex items-center">
          <button
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
            title="复制所有回答"
            onClick={() => {
              const text = messages
                .map((msg) => {
                  const response = msg.responses[model];
                  return `Q: ${msg.content}\nA: ${response?.content || ''}`;
                })
                .join('\n\n');
              navigator.clipboard.writeText(text);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {messages.map((message, index) => {
          const response = message.responses[model];
          const isLast = index === messages.length - 1;
          return (
            <div 
              key={message.id} 
              className="relative pl-4" 
              ref={el => messageRefs.current[message.id] = el}
            >
              {/* 左侧时间线 */}
              <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200">
                <div className="absolute top-4 left-1/2 w-2 h-2 rounded-full bg-gray-300 -translate-x-1/2" />
                {!isLast && <div className="absolute top-4 left-1/2 w-px h-full bg-gray-200 -translate-x-1/2" />}
              </div>

              <div className="space-y-2">
                {/* 用户问题 */}
                <div 
                  className="group relative bg-blue-50 p-3 rounded-lg border border-blue-100 text-gray-800 text-sm cursor-pointer hover:bg-blue-100 transition-colors"
                  onDoubleClick={(e) => handleMessageClick(message.id, e)}
                >
                  <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    用户
                    <span className="text-gray-400">#{messages.length - index}</span>
                  </div>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {/* LLM 回答 */}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                    {model}
                  </div>
                  {response?.status === 'loading' ? (
                    <div className="flex items-center justify-center py-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    </div>
                  ) : response?.status === 'error' ? (
                    <div 
                      className="text-red-500 p-3 bg-red-50 rounded-lg border border-red-100 text-sm cursor-pointer hover:bg-red-100 transition-colors"
                      onClick={(e) => handleMessageClick(message.id, e)}
                    >
                      {response.content || '请求失败，请重试'}
                    </div>
                  ) : (
                    <div 
                      className="group relative rounded-lg bg-white border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                      // onDoubleClick={(e) => handleMessageClick(message.id, e)}
                    >
                      <div className="p-3 text-sm">
                        <div className="prose prose-sm max-w-none prose-p:my-1 prose-pre:my-1">
                          <ReactMarkdown>{response?.content || ''}</ReactMarkdown>
                        </div>
                      </div>
                      {response?.responseTime != null && response?.totalTokens != null && (
                        <div className="px-3 py-2 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-2 bg-gray-50 rounded-b-lg">
                          <span title="响应时间">⏱️ {(response.responseTime / 1000).toFixed(2)}s</span>
                          <span title="Token 使用量">🔤 {response.totalTokens} tokens</span>
                        </div>
                      )}
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400">
                        {new Date(message.timestamp + (response?.responseTime || 0)).toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}; 