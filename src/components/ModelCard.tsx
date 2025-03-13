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

  // 复制回答内容
  const handleCopyResponse = (content: string, event: React.MouseEvent) => {
    event.stopPropagation();
    navigator.clipboard.writeText(content);
    // 可以添加复制成功的提示
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
      <div className="flex-1 overflow-y-auto p-2 py-0 pt-4 space-y-0">
        {messages.map((message, index) => {
          const response = message.responses[model];
          const isLast = index === messages.length - 1;
          return (
            <div key={message.id} className="relative">
              {/* 消息卡片 */}
              <div 
                className="conversation-turn bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 mb-5"
                ref={el => messageRefs.current[message.id] = el}
              >
                {/* 用户问题 */}
                <div className="border-b border-blue-100 p-2 relative" style={{backgroundColor: `#f9fbff`}}>
                  <div className="text-gray-800 text-sm whitespace-pre-wrap"
                      onDoubleClick={(e) => handleMessageClick(message.id, e)}>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>

                {/* LLM 回答 */}
                <div className="relative bg-white p-2 border-l-2">
                  {response?.status === 'loading' ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  ) : response?.status === 'error' ? (
                    <div className="text-red-500 p-4 bg-red-50 rounded-lg border border-red-100 text-sm">
                      {response.content || '请求失败，请重试'}
                    </div>
                  ) : (
                    <>
                      <div className="text-gray-800 text-sm">
                        <ReactMarkdown>{response?.content || ''}</ReactMarkdown>
                      </div>
                      
                      {response?.responseTime != null && response?.totalTokens != null && (
                        <div className="mt-2 pt-1 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span title="响应时间" className="flex items-center">
                              <span className="mr-1">⏱️</span> {(response.responseTime / 1000).toFixed(2)}s
                            </span>
                            <span title="Token 使用量" className="flex items-center">
                              <span className="mr-1">🔤</span> {response.totalTokens}
                            </span>
                          </div>
                          <button 
                            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-full transition-colors"
                            // onClick={(e) => handleCopyResponse(response.content, e)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {/* 分割线 */}
              {!isLast && (
                <div className="flex justify-center items-center mb-5">
                  <div className="w-8 h-px bg-gray-300"></div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}; 