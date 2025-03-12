import { useState } from 'react'
import { FiCopy } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface ModelResponseProps {
  modelName: string
  content: string
  timestamp: string
}

const ModelResponse: React.FC<ModelResponseProps> = ({
  modelName,
  content,
  timestamp,
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success('已复制到剪贴板')
    } catch (error) {
      toast.error('复制失败')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* 模型名称 */}
      <div className="p-3 bg-gray-50 border-b rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Model: {modelName}</h3>
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-500 hover:text-gray-700 rounded"
          >
            <FiCopy size={16} />
          </button>
        </div>
      </div>

      {/* 提问内容 */}
      <div className="p-3 border-b">
        <p className="text-sm text-gray-600">提问的问题</p>
        <div className="mt-1">
          <p className="text-gray-900">{content}</p>
        </div>
      </div>

      {/* LLM 输出结果 */}
      <div className="p-3">
        <p className="text-sm text-gray-600">LLM 输出结果区域</p>
        <div className="mt-1">
          <p className="text-gray-900 whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </div>
  )
}

export default ModelResponse 