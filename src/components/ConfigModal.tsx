import React, { useState, useEffect } from 'react';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: string[];
  baseApi: string;
  apiKey: string;
  onSave: (models: string[], baseApi: string, apiKey: string) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  models: initialModels,
  baseApi: initialBaseApi,
  apiKey: initialApiKey,
  onSave,
}) => {
  // 本地状态，用于编辑
  const [localState, setLocalState] = useState({
    baseApi: initialBaseApi,
    apiKey: initialApiKey,
    models: [...initialModels],
    newModel: ''
  });

  // Modal 打开时重置状态
  useEffect(() => {
    if (isOpen) {
      setLocalState({
        baseApi: initialBaseApi,
        apiKey: initialApiKey,
        models: [...initialModels],
        newModel: ''
      });
    }
  }, [isOpen, initialBaseApi, initialApiKey, initialModels]);

  const handleAddModel = () => {
    const modelName = localState.newModel.trim();
    if (modelName && !localState.models.includes(modelName)) {
      setLocalState(prev => ({
        ...prev,
        models: [...prev.models, modelName],
        newModel: ''
      }));
    }
  };

  const handleRemoveModel = (model: string) => {
    setLocalState(prev => ({
      ...prev,
      models: prev.models.filter(m => m !== model)
    }));
  };

  const handleSave = () => {
    const uniqueModels = Array.from(new Set(localState.models));
    onSave(uniqueModels, localState.baseApi, localState.apiKey);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">配置</h2>

        {/* Base API */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base API
          </label>
          <input
            type="text"
            value={localState.baseApi}
            onChange={(e) => setLocalState(prev => ({ ...prev, baseApi: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="输入 Base API 地址"
          />
        </div>

        {/* API Key */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <input
            type="password"
            value={localState.apiKey}
            onChange={(e) => setLocalState(prev => ({ ...prev, apiKey: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="输入 API Key"
          />
        </div>

        {/* Models */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            模型列表
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={localState.newModel}
              onChange={(e) => setLocalState(prev => ({ ...prev, newModel: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && handleAddModel()}
              className="flex-1 p-2 border border-gray-300 rounded-md"
              placeholder="输入模型名称"
            />
            <button
              onClick={handleAddModel}
              disabled={!localState.newModel.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              添加
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {localState.models.map((model) => (
              <div
                key={model}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <span>{model}</span>
                <button
                  onClick={() => handleRemoveModel(model)}
                  className="text-red-500 hover:text-red-600"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}; 