import React, { useState, useEffect } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ModelCard } from './ModelCard';
import { ChatInput } from './ChatInput';
import { ConfigModal } from './ConfigModal';
import { SystemPromptModal } from './SystemPromptModal';
import { OpenAIClient } from '../utils/openai';

export interface Message {
  id: string;
  content: string;
  timestamp: number;
  responses: {
    [modelId: string]: {
      content: string;
      status: 'loading' | 'success' | 'error';
      score?: number;
      responseTime?: number;
      totalTokens?: number;
    };
  };
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  systemPrompt: string;
}

export const ChatLayout: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  
  // 全局配置状态
  const [models, setModels] = useState<string[]>(() => {
    const savedModels = localStorage.getItem('models');
    return savedModels ? JSON.parse(savedModels) : ['gpt-3.5', 'qwen-max', 'qwen-turbo'];
  });
  const [baseApi, setBaseApi] = useState(() => localStorage.getItem('baseApi') || '');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('apiKey') || '');
  const [messageIdCounter, setMessageIdCounter] = useState(0);
  const [layout, setLayout] = useState<number>(() => {
    const savedLayout = localStorage.getItem('layout');
    return savedLayout ? parseInt(savedLayout) : 3;
  });

  // 生成唯一消息 ID
  const generateMessageId = () => {
    setMessageIdCounter(prev => prev + 1);
    return `${Date.now()}-${messageIdCounter}`;
  };

  // 只在组件挂载时加载会话
  useEffect(() => {
    const savedChats = localStorage.getItem('chats');
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }
  }, []);

  // 自动选中第一个会话
  useEffect(() => {
    if (chats.length > 0 && !activeChat) {
      setActiveChat(chats[0].id);
    }
  }, [chats, activeChat]);

  // 保存会话到 localStorage
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('chats', JSON.stringify(chats));
    }
  }, [chats]);

  // 处理配置保存
  const handleConfigSave = (newModels: string[], newBaseApi: string, newApiKey: string, newLayout: number) => {
    // 保存到 localStorage
    localStorage.setItem('models', JSON.stringify(newModels));
    localStorage.setItem('baseApi', newBaseApi);
    localStorage.setItem('apiKey', newApiKey);
    localStorage.setItem('layout', newLayout.toString());
    
    // 更新状态
    setModels(newModels);
    setBaseApi(newBaseApi);
    setApiKey(newApiKey);
    setLayout(newLayout);
    setIsConfigOpen(false);
  };

  const handleClearChat = () => {
    if (!activeChat) return;
    
    setChats(prev => prev.map(chat => 
      chat.id === activeChat 
        ? { ...chat, messages: [] }
        : chat
    ));
  };

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `新会话 ${chats.length + 1}`,
      messages: [],
      createdAt: Date.now(),
      systemPrompt: '你是一个有帮助的 AI 助手。',
    };
    setChats([...chats, newChat]);
    setActiveChat(newChat.id);
  };

  const handleUpdateSystemPrompt = (chatId: string, prompt: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, systemPrompt: prompt }
        : chat
    ));
  };

  const handleDeleteChat = (chatId: string) => {
    // 如果删除的是当前活动会话，清除活动会话
    if (chatId === activeChat) {
      setActiveChat(null);
    }
    // 从列表中删除会话
    setChats((prev) => {
      const newChats = prev.filter((chat) => chat.id !== chatId);
      // 如果删除后没有会话了，清空 localStorage
      if (newChats.length === 0) {
        localStorage.removeItem('chats');
      }
      return newChats;
    });
  };

  const handleSend = async (content: string) => {
    if (!activeChat) return;

    // 如果没有设置 Base API，提示用户
    if (!baseApi || !apiKey) {
      const newMessage: Message = {
        id: generateMessageId(),
        content,
        timestamp: Date.now(),
        responses: {
          system: {
            content: '请先在配置中设置 Base API 和 API Key',
            status: 'error',
          },
        },
      };

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === activeChat) {
            return {
              ...chat,
              messages: [...chat.messages, newMessage],
            };
          }
          return chat;
        })
      );
      setIsConfigOpen(true);
      return;
    }
    
    const messageId = generateMessageId();
    const message: Message = {
      id: messageId,
      content,
      timestamp: Date.now(),
      responses: {},
    };

    // 更新消息列表
    const updatedChats = chats.map((chat) => {
      if (chat.id === activeChat) {
        return {
          ...chat,
          messages: [...chat.messages, message],
        };
      }
      return chat;
    });
    setChats(updatedChats);

    const currentChat = chats.find(chat => chat.id === activeChat);
    if (!currentChat) return;

    // 创建 OpenAI 客户端实例
    const openai = new OpenAIClient({
      apiKey,
      baseApi,
      dangerouslyAllowBrowser: true,
    });

    // 设置所有模型的初始加载状态
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === activeChat) {
          const lastMessage = chat.messages[chat.messages.length - 1];
          return {
            ...chat,
            messages: chat.messages.map((msg) =>
              msg.id === lastMessage.id
                ? {
                    ...msg,
                    responses: Object.fromEntries(
                      models.map((model) => [
                        model,
                        { content: '', status: 'loading' },
                      ])
                    ),
                  }
                : msg
            ),
          };
        }
        return chat;
      })
    );

    // 为每个模型独立发送请求
    models.forEach(async (model) => {
      try {
        const data = await openai.chat(content, currentChat.systemPrompt, model);
        
        // 通过消息 ID 更新对应消息的响应
        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id === activeChat) {
              return {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg.id === messageId
                    ? {
                        ...msg,
                        responses: {
                          ...msg.responses,
                          [model]: {
                            content: data.content,
                            status: 'success',
                            score: data.score,
                            responseTime: data.responseTime,
                            totalTokens: data.totalTokens,
                          },
                        },
                      }
                    : msg
                ),
              };
            }
            return chat;
          })
        );
      } catch (error) {
        console.error(`Error with model ${model}:`, error);
        
        // 通过消息 ID 更新错误状态
        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id === activeChat) {
              return {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg.id === messageId
                    ? {
                        ...msg,
                        responses: {
                          ...msg.responses,
                          [model]: {
                            content: error instanceof Error ? error.message : '请求失败，请重试',
                            status: 'error',
                          },
                        },
                      }
                    : msg
                ),
              };
            }
            return chat;
          })
        );
      }
    });
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* 左侧会话列表 */}
      <div className="w-64 border-r border-gray-200 bg-white">
        <ChatSidebar 
          chats={chats}
          activeChat={activeChat}
          onSelectChat={setActiveChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
        />
      </div>

      {/* 右侧内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部操作栏 */}
        <div className="h-14 border-b border-gray-200 flex items-center px-4 justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">LLM 对比测试</h1>
            {activeChat && (
              <>
                <button
                  onClick={() => setIsPromptOpen(true)}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  编辑系统提示词
                </button>
                <button
                  onClick={handleClearChat}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  title="清空当前会话的所有对话"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  清空对话
                </button>
              </>
            )}
          </div>
          <button
            onClick={() => setIsConfigOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            配置
          </button>
        </div>

        {activeChat ? (
          <>
            {/* 模型对比区域 */}
            <div className="flex-1 overflow-hidden">
              <div className={`h-full grid gap-4 p-4 ${
                layout === 2 ? 'grid-cols-2' : 
                layout === 3 ? 'grid-cols-3' : 
                layout === 4 ? 'grid-cols-4' : 'grid-cols-3'
              }`}>
                {models.map((model) => (
                  <ModelCard
                    key={model}
                    model={model}
                    messages={chats.find(c => c.id === activeChat)?.messages || []}
                  />
                ))}
              </div>
            </div>

            {/* 底部输入框 */}
            <div className="border-t border-gray-200 p-4">
              <ChatInput onSend={handleSend} />
            </div>
          </>
        ) : (
          // 默认页面
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-96 space-y-6">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4m36 0h-8m4 4v12m-4-4h8m-24-4v16m8-8H16"
                />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-900">开始一个新的对话</h2>
              <p className="text-gray-500">
                创建一个新的会话来开始与多个 LLM 模型进行对话。您可以比较它们的回答，评估它们的性能。
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleNewChat}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  新建会话
                </button>
                <button
                  onClick={() => setIsConfigOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  配置模型
                </button>
              </div>
              {!baseApi && (
                <div className="text-amber-600 bg-amber-50 px-4 py-3 rounded-md">
                  提示：请先在配置中设置 Base API 和 API Key
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 配置弹窗 */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        models={models}
        baseApi={baseApi}
        apiKey={apiKey}
        layout={layout}
        onSave={handleConfigSave}
      />

      {/* 系统提示词弹窗 */}
      {activeChat && (
        <SystemPromptModal
          isOpen={isPromptOpen}
          onClose={() => setIsPromptOpen(false)}
          initialPrompt={chats.find(chat => chat.id === activeChat)?.systemPrompt || ''}
          onSave={(prompt) => {
            handleUpdateSystemPrompt(activeChat, prompt);
            setIsPromptOpen(false);
          }}
        />
      )}
    </div>
  );
}; 