import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { recordApi, chatApi } from '../api'
import { 
  ArrowLeft, 
  Calendar, 
  Building2, 
  User, 
  FileText, 
  Edit, 
  Trash2, 
  Sparkles, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  Download,
  MessageCircle,
  History,
  AlertCircle,
  CheckCircle,
  Clock,
  Brain,
  Stethoscope,
  Pill,
  RefreshCw
} from 'lucide-react'

function RecordDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [relatedRecords, setRelatedRecords] = useState([])
  
  useEffect(() => {
    fetchRecord()
  }, [id])
  
  const fetchRecord = async () => {
    try {
      const response = await recordApi.get(id)
      if (response.success) {
        setRecord(response.data)
        // 获取相关病历（同一类型或医院）
        fetchRelatedRecords(response.data)
      } else {
        navigate('/records')
      }
    } catch (err) {
      console.error('获取病历详情失败:', err)
      navigate('/records')
    } finally {
      setLoading(false)
    }
  }
  
  const fetchRelatedRecords = async (currentRecord) => {
    try {
      const response = await recordApi.list()
      if (response.success) {
        const related = response.data.filter(r => 
          r.id !== currentRecord.id && 
          (r.recordType === currentRecord.recordType || 
           r.hospital === currentRecord.hospital)
        ).slice(0, 5)
        setRelatedRecords(related)
      }
    } catch (err) {
      console.error('获取相关病历失败:', err)
    }
  }
  
  // AI 分析病历
  const analyzeRecord = async () => {
    if (!record) return
    setAnalyzing(true)
    setAnalysis(null)
    
    try {
      // 构建分析请求
      const prompt = `请帮我分析这份病历：
标题：${record.title}
类型：${record.recordType || '未知'}
医院：${record.hospital || '未知'}
医生：${record.doctor || '未知'}
日期：${record.recordDate || '未知'}
描述：${record.description || '无'}

请从以下几个方面进行分析：
1. 病历摘要：简要总结病历的主要内容
2. 关键指标：提取病历中的关键检查指标或诊断信息
3. 健康建议：根据病历内容给出健康建议
4. 复查提醒：如果需要复查，建议复查时间和项目
5. 注意事项：需要特别注意的健康问题`

      const messages = [{ role: 'user', content: prompt }]
      
      // 如果有图片，添加图片分析
      const imageUrl = record.images?.[0]?.filePath || record.filePath
      if (imageUrl && record.fileType?.includes('image')) {
        messages[0].content += `\n\n请同时分析附带的病历图片。`
        messages[0].image_url = imageUrl
      }
      
      const response = await chatApi.send({
        messages,
        sessionId: `record-analysis-${record.id}`
      })
      
      if (response.success) {
        setAnalysis({
          content: response.data.content,
          timestamp: new Date().toISOString(),
          hasToolCalls: response.data.toolCalls?.length > 0,
          toolCalls: response.data.toolCalls
        })
      }
    } catch (err) {
      console.error('AI 分析失败:', err)
      setAnalysis({
        error: true,
        content: '分析失败，请稍后重试'
      })
    } finally {
      setAnalyzing(false)
    }
  }
  
  const handleDelete = async () => {
    if (!confirm('确定要删除这条病历吗？删除后无法恢复。')) return
    
    try {
      const response = await recordApi.delete(id)
      if (response.success) {
        navigate('/records')
      }
    } catch (err) {
      console.error('删除失败:', err)
      alert('删除失败，请稍后重试')
    }
  }
  
  // 获取所有图片
  const getAllImages = () => {
    const images = []
    if (record.images && record.images.length > 0) {
      images.push(...record.images.map(img => img.filePath))
    } else if (record.filePath && record.fileType?.includes('image')) {
      images.push(record.filePath)
    }
    return images
  }
  
  const openImageModal = (index) => {
    setCurrentImageIndex(index)
    setShowImageModal(true)
  }
  
  const prevImage = () => {
    const images = getAllImages()
    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length)
  }
  
  const nextImage = () => {
    const images = getAllImages()
    setCurrentImageIndex(prev => (prev + 1) % images.length)
  }
  
  // 跳转到 AI 对话页面进行深度分析
  const goToChat = () => {
    navigate('/chat', { state: { analyzeRecord: record } })
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }
  
  if (!record) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">病历不存在或已被删除</p>
        <button 
          onClick={() => navigate('/records')}
          className="mt-4 text-primary-600 hover:underline"
        >
          返回病历列表
        </button>
      </div>
    )
  }
  
  const images = getAllImages()
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/records')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>返回病历列表</span>
        </button>
        
        <div className="flex items-center gap-2">
          <button
            onClick={goToChat}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all flex items-center gap-2"
          >
            <MessageCircle size={18} />
            深度问诊
          </button>
          <button
            onClick={() => navigate(`/records/edit/${id}`)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 左侧：病历详情 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息卡片 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* 图片区域 */}
            {images.length > 0 && (
              <div className="relative bg-gray-100">
                <img 
                  src={images[0]} 
                  alt={record.title}
                  className="w-full h-64 object-contain cursor-pointer"
                  onClick={() => openImageModal(0)}
                />
                {images.length > 1 && (
                  <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                    1 / {images.length}
                  </div>
                )}
                <button
                  onClick={() => openImageModal(0)}
                  className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                >
                  <ZoomIn size={18} />
                </button>
              </div>
            )}
            
            {/* 多图预览 */}
            {images.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {images.map((img, index) => (
                  <img 
                    key={index}
                    src={img} 
                    alt=""
                    className={`w-20 h-20 object-cover rounded-lg cursor-pointer flex-shrink-0 ${
                      index === 0 ? 'ring-2 ring-primary-500' : ''
                    }`}
                    onClick={() => openImageModal(index)}
                  />
                ))}
              </div>
            )}
            
            {/* 详情内容 */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">{record.title}</h1>
                  {record.recordType && (
                    <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm">
                      {record.recordType}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {record.hospital && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Building2 className="text-gray-400" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">就诊医院</p>
                      <p className="font-medium text-gray-800">{record.hospital}</p>
                    </div>
                  </div>
                )}
                {record.doctor && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <User className="text-gray-400" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">主治医生</p>
                      <p className="font-medium text-gray-800">{record.doctor}</p>
                    </div>
                  </div>
                )}
                {record.recordDate && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Calendar className="text-gray-400" size={20} />
                    <div>
                      <p className="text-xs text-gray-500">就诊日期</p>
                      <p className="font-medium text-gray-800">{record.recordDate}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {record.description && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">病历描述</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{record.description}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* AI 分析卡片 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Brain className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-800">AI 智能分析</h2>
                    <p className="text-sm text-gray-500">基于病历内容的智能分析报告</p>
                  </div>
                </div>
                <button
                  onClick={analyzeRecord}
                  disabled={analyzing}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-70 flex items-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      分析中...
                    </>
                  ) : analysis ? (
                    <>
                      <RefreshCw size={18} />
                      重新分析
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      开始分析
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {analyzing ? (
                <div className="text-center py-12">
                  <Loader2 className="animate-spin mx-auto text-purple-500 mb-4" size={32} />
                  <p className="text-gray-600">AI 正在分析病历内容...</p>
                  <p className="text-sm text-gray-400 mt-1">预计需要 10-30 秒</p>
                </div>
              ) : analysis ? (
                <div className="space-y-4">
                  {analysis.error ? (
                    <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl text-red-600">
                      <AlertCircle size={20} />
                      <span>{analysis.content}</span>
                    </div>
                  ) : (
                    <>
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                          {analysis.content}
                        </div>
                      </div>
                      
                      {analysis.timestamp && (
                        <div className="flex items-center gap-2 text-xs text-gray-400 pt-4 border-t border-gray-100">
                          <Clock size={14} />
                          分析时间：{new Date(analysis.timestamp).toLocaleString()}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-50 flex items-center justify-center">
                    <Sparkles className="text-purple-400" size={28} />
                  </div>
                  <p className="text-gray-600 mb-2">点击上方按钮开始 AI 智能分析</p>
                  <p className="text-sm text-gray-400">AI 将分析病历内容，提取关键信息并给出健康建议</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 右侧：相关信息 */}
        <div className="space-y-6">
          {/* 快捷操作 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">快捷操作</h3>
            <div className="space-y-3">
              <button
                onClick={goToChat}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
              >
                <MessageCircle size={20} />
                <div className="text-left">
                  <p className="font-medium">深度问诊</p>
                  <p className="text-xs text-purple-500">针对此病历向 AI 提问</p>
                </div>
              </button>
              
              <button
                onClick={analyzeRecord}
                disabled={analyzing}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors disabled:opacity-70"
              >
                <Brain size={20} />
                <div className="text-left">
                  <p className="font-medium">智能分析</p>
                  <p className="text-xs text-pink-500">获取 AI 分析报告</p>
                </div>
              </button>
              
              {record.filePath && (
                <a
                  href={record.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  <Download size={20} />
                  <div className="text-left">
                    <p className="font-medium">下载原件</p>
                    <p className="text-xs text-blue-500">下载病历原始文件</p>
                  </div>
                </a>
              )}
            </div>
          </div>
          
          {/* 相关病历 */}
          {relatedRecords.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <History size={18} />
                相关病历
              </h3>
              <div className="space-y-3">
                {relatedRecords.map(r => (
                  <div 
                    key={r.id}
                    onClick={() => navigate(`/records/${r.id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {r.filePath && r.fileType?.includes('image') ? (
                        <img src={r.filePath} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="text-gray-400" size={16} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate text-sm">{r.title}</p>
                      <p className="text-xs text-gray-500">{r.recordDate || '日期未知'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 病历时间线 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">病历信息</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-gray-500">创建时间</span>
                <span className="text-gray-800 ml-auto">
                  {new Date(record.createdAt).toLocaleDateString()}
                </span>
              </div>
              {record.updatedAt && record.updatedAt !== record.createdAt && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-gray-500">最后修改</span>
                  <span className="text-gray-800 ml-auto">
                    {new Date(record.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
              {record.fileSize && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                  <span className="text-gray-500">文件大小</span>
                  <span className="text-gray-800 ml-auto">
                    {(record.fileSize / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 图片预览模态框 */}
      {showImageModal && images.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage() }}
                className="absolute left-4 p-3 text-white/70 hover:text-white bg-black/30 rounded-full transition-colors"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage() }}
                className="absolute right-4 p-3 text-white/70 hover:text-white bg-black/30 rounded-full transition-colors"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
          
          <img 
            src={images[currentImageIndex]}
            alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white rounded-full text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RecordDetail









