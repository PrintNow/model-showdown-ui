import React, { useState } from 'react';
import { Modal } from './Modal';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: string[];
  baseApi: string;
  apiKey: string;
  layout: number;
  onSave: (models: string[], baseApi: string, apiKey: string, layout: number) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  models: initialModels,
  baseApi: initialBaseApi,
  apiKey: initialApiKey,
  layout: initialLayout,
  onSave,
}) => {
  const [models, setModels] = useState<string[]>(initialModels);
  const [modelInput, setModelInput] = useState('');
  const [baseApi, setBaseApi] = useState(initialBaseApi);
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [layout, setLayout] = useState(initialLayout);

  const handleAddModel = () => {
    if (modelInput.trim() && !models.includes(modelInput.trim())) {
      setModels([...models, modelInput.trim()]);
      setModelInput('');
    }
  };

  const handleRemoveModel = (model: string) => {
    setModels(models.filter((m) => m !== model));
  };

  const handleSave = () => {
    onSave(models, baseApi, apiKey, layout);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="配置">
      <div className="space-y-6">
        {/* Base API 配置 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Base API URL
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={baseApi}
            onChange={(e) => setBaseApi(e.target.value)}
            placeholder="例如: https://api.example.com"
          />
        </div>

        {/* API Key 配置 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="您的 API Key"
          />
        </div>

        {/* 布局配置 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            栏目布局
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setLayout(2)}
              className={`px-4 py-2 border rounded-md ${
                layout === 2
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              2 栏
            </button>
            <button
              type="button"
              onClick={() => setLayout(3)}
              className={`px-4 py-2 border rounded-md ${
                layout === 3
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              3 栏
            </button>
            <button
              type="button"
              onClick={() => setLayout(4)}
              className={`px-4 py-2 border rounded-md ${
                layout === 4
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              4 栏
            </button>
          </div>
        </div>

        {/* 模型配置 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            模型列表
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={modelInput}
              onChange={(e) => setModelInput(e.target.value)}
              placeholder="输入模型名称"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddModel();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddModel}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              添加
            </button>
          </div>

          {/* 模型列表 */}
          <div className="mt-2 space-y-2">
            {models.map((model) => (
              <div
                key={model}
                className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md"
              >
                <span>{model}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveModel(model)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
            {models.length === 0 && (
              <div className="text-center py-2 text-gray-500">
                请添加至少一个模型
              </div>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            保存
          </button>
        </div>
      </div>
    </Modal>
  );
}; 