import { useState, useEffect } from 'react'
import { FiX } from 'react-icons/fi'
import { ModelConfig } from '../types'

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [configs, setConfigs] = useState<ModelConfig[]>([])
  const [newConfig, setNewConfig] = useState<Partial<ModelConfig>>({
    name: '',
    baseUrl: '',
    apiKey: '',
    enabled: true,
  })

  useEffect(() => {
    const savedConfigs = localStorage.getItem('modelConfigs')
    if (savedConfigs) {
      setConfigs(JSON.parse(savedConfigs))
    }
  }, [])

  const handleSave = () => {
    if (!newConfig.name || !newConfig.baseUrl || !newConfig.apiKey) {
      return
    }

    const config: ModelConfig = {
      id: Date.now().toString(),
      name: newConfig.name,
      baseUrl: newConfig.baseUrl,
      apiKey: newConfig.apiKey,
      enabled: newConfig.enabled ?? true,
    }

    const updatedConfigs = [...configs, config]
    setConfigs(updatedConfigs)
    localStorage.setItem('modelConfigs', JSON.stringify(updatedConfigs))
    setNewConfig({
      name: '',
      baseUrl: '',
      apiKey: '',
      enabled: true,
    })
  }

  const handleDelete = (id: string) => {
    const updatedConfigs = configs.filter((config) => config.id !== id)
    setConfigs(updatedConfigs)
    localStorage.setItem('modelConfigs', JSON.stringify(updatedConfigs))
  }

  const handleToggle = (id: string) => {
    const updatedConfigs = configs.map((config) =>
      config.id === id ? { ...config, enabled: !config.enabled } : config
    )
    setConfigs(updatedConfigs)
    localStorage.setItem('modelConfigs', JSON.stringify(updatedConfigs))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">模型配置</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* 现有配置列表 */}
          {configs.map((config) => (
            <div
              key={config.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <h3 className="font-medium">{config.name}</h3>
                <p className="text-sm text-gray-500">{config.baseUrl}</p>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enabled}
                    onChange={() => handleToggle(config.id)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm">启用</span>
                </label>
                <button
                  onClick={() => handleDelete(config.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  删除
                </button>
              </div>
            </div>
          ))}

          {/* 添加新配置表单 */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium mb-4">添加新模型</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  模型名称
                </label>
                <input
                  type="text"
                  value={newConfig.name}
                  onChange={(e) =>
                    setNewConfig({ ...newConfig, name: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：GPT-4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base URL
                </label>
                <input
                  type="text"
                  value={newConfig.baseUrl}
                  onChange={(e) =>
                    setNewConfig({ ...newConfig, baseUrl: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：https://api.openai.com/v1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={newConfig.apiKey}
                  onChange={(e) =>
                    setNewConfig({ ...newConfig, apiKey: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入 API Key"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={!newConfig.name || !newConfig.baseUrl || !newConfig.apiKey}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings 