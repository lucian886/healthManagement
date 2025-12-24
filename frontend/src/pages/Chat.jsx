import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { chatApi, recordApi } from '../api'
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  Trash2,
  Plus,
  FileImage,
  X,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react'

function Chat() {
  const location = useLocation()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [sessions, setSessions] = useState([])
  const [showSidebar, setShowSidebar] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [records, setRecords] = useState([])
  const [showRecordPicker, setShowRecordPicker] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const messagesEndRef = useRef(null)
  
  // 初始化：获取会话列表和病历列表
  useEffect(() => {
    const init = async () => {
      await fetchSessions()
      fetchRecords()
    }
    init()
  }, [])
  
  // 处理从病历详情页跳转过来的分析请求
  useEffect(() => {
    const analyzeRecord = location.state?.analyzeRecord
    if (analyzeRecord) {
      // 选择该病历并自动发送分析请求
      setSelectedRecord(analyzeRecord)
      setInput(`请帮我详细分析这份病历：${analyzeRecord.title}`)
      // 清除 state，避免刷新页面重复触发
      window.history.replaceState({}, document.title)
    }
  }, [location.state])
  
  // 获取会话列表，并默认加载最近一次对话
  const fetchSessions = async () => {
    try {
      const response = await chatApi.getSessions()
      if (response.success) {
        const sessionList = response.data || []
        setSessions(sessionList)
        
        // 如果有会话且不是从病历详情页跳转过来的，自动加载最近一次对话
        if (sessionList.length > 0 && !location.state?.analyzeRecord) {
          const latestSession = sessionList[0]
          const latestSessionId = latestSession.sessionId || latestSession
          loadSessionHistory(latestSessionId)
        }
      }
    } catch (err) {
      console.error('获取会话列表失败:', err)
    }
  }
  
  // 获取病历列表
  const fetchRecords = async () => {
    try {
      const response = await recordApi.list()
      if (response.success) {
        const imageRecords = (response.data || []).filter(r => 
          r.filePath && r.fileType?.includes('image')
        )
        setRecords(imageRecords)
      }
    } catch (err) {
      console.error('获取病历失败:', err)
    }
  }
  
  // 加载指定会话的历史消息
  const loadSessionHistory = async (sid) => {
    if (!sid) return
    
    setLoadingHistory(true)
    try {
      const response = await chatApi.getHistory(sid)
      if (response.success && response.data) {
        setMessages(response.data.map(msg => ({
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt
        })))
        setSessionId(sid)
      }
    } catch (err) {
      console.error('加载历史消息失败:', err)
    } finally {
      setLoadingHistory(false)
    }
  }
  
  // 删除会话
  const deleteSession = async (sid, e) => {
    e.stopPropagation()
    if (!confirm('确定要删除这个对话吗？')) return
    
    try {
      await chatApi.deleteSession(sid)
      setSessions(prev => prev.filter(s => s !== sid))
      if (sessionId === sid) {
        handleNewChat()
      }
    } catch (err) {
      console.error('删除会话失败:', err)
    }
  }
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  // 发送欢迎消息（新对话时）
  useEffect(() => {
    if (messages.length === 0 && !sessionId) {
      setMessages([{
        role: 'assistant',
        content: '你好！我是您的健康管理AI智能体 🏥\n\n我可以帮助您：\n• 📋 查看和管理您的病历记录\n• 🖼️ 智能分析检查报告、化验单等医疗图片\n• 📊 计算 BMI、每日热量等健康指标\n• 💡 提供个性化健康建议\n\n我是一个**真正的智能体**，会自动判断需要调用哪些工具来回答您的问题！\n\n请问有什么可以帮助您的？',
        createdAt: new Date().toISOString()
      }])
    }
  }, [sessionId])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if ((!input.trim() && !selectedRecord) || loading) return
    
    const userInput = input.trim() || '请分析这张医疗图片'
    const messageContent = selectedRecord 
      ? `[分析病历图片: ${selectedRecord.title}]\n${userInput}`
      : userInput
    
    const userMessage = {
      role: 'user',
      content: messageContent,
      createdAt: new Date().toISOString(),
      record: selectedRecord
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    const currentRecord = selectedRecord
    setSelectedRecord(null)
    setLoading(true)
    
    try {
      let response
      
      if (currentRecord) {
        response = await chatApi.analyzeRecordImage(currentRecord.id, userInput)
      } else {
        response = await chatApi.send({
          message: userInput,
          sessionId: sessionId
        })
      }
      
      if (response.success) {
        // 更新 sessionId
        if (response.data.sessionId && !sessionId) {
          setSessionId(response.data.sessionId)
          // 刷新会话列表
          fetchSessions()
        }
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.content,
          createdAt: response.data.createdAt || new Date().toISOString()
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '抱歉，我暂时无法回答您的问题，请稍后再试。',
          createdAt: new Date().toISOString()
        }])
      }
    } catch (err) {
      console.error('发送消息失败:', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，服务暂时不可用，请稍后再试。',
        createdAt: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
    }
  }
  
  const handleNewChat = () => {
    setMessages([])
    setSessionId(null)
  }
  
  const quickQuestions = [
    '我有几份病历？',
    '分析我的所有检查结果',
    '计算我的 BMI',
    '给我一些健康建议'
  ]
  
  // 格式化会话标题
  const formatSessionName = (session) => {
    if (typeof session === 'object' && session.title) {
      return session.title
    }
    return '新对话'
  }
  
  // 格式化时间
  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
    return date.toLocaleDateString()
  }
  
  // 格式化会话时间（更简洁）
  const formatSessionTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const isToday = date.toDateString() === now.toDateString()
    const isYesterday = new Date(now - 86400000).toDateString() === date.toDateString()
    
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (isToday) return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    if (isYesterday) return '昨天'
    if (diff < 7 * 86400000) return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
    return `${date.getMonth() + 1}/${date.getDate()}`
  }
  
  return (
    <div className="h-[calc(100vh-8rem)] flex animate-fade-in">
      {/* 侧边栏 - 历史会话 */}
      <div className={`${showSidebar ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden`}>
        <div className="h-full bg-white rounded-l-2xl border border-gray-100 flex flex-col w-64">
          {/* 侧边栏头部 */}
          <div className="p-4 border-b border-gray-100">
            <button
              onClick={handleNewChat}
              className="w-full px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              新对话
            </button>
          </div>
          
          {/* 会话列表 */}
          <div className="flex-1 overflow-y-auto p-2">
            {sessions.length > 0 ? (
              <div className="space-y-1">
                {sessions.map((session) => {
                  const sid = typeof session === 'object' ? session.sessionId : session
                  const lastTime = typeof session === 'object' ? session.lastMessageTime : null
                  return (
                  <div
                    key={sid}
                    onClick={() => loadSessionHistory(sid)}
                    className={`group p-3 rounded-xl cursor-pointer transition-all ${
                      sessionId === sid 
                        ? 'bg-primary-50 text-primary-700' 
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="flex-shrink-0" />
                      <span className="flex-1 truncate text-sm font-medium">
                        {formatSessionName(session)}
                      </span>
                      <button
                        onClick={(e) => deleteSession(sid, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {lastTime && (
                      <div className="flex items-center gap-1 mt-1 ml-6 text-xs text-gray-400">
                        <Clock size={10} />
                        <span>{formatSessionTime(lastTime)}</span>
                      </div>
                    )}
                  </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                暂无历史对话
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 切换侧边栏按钮 */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="self-center p-1 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors z-10 -ml-3"
      >
        {showSidebar ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
      
      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col ml-2">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
              <Bot className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">AI 健康智能体</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                在线 · Function Calling 模式
              </p>
            </div>
          </div>
        </div>
        
        {/* 消息区域 */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          {loadingHistory ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 animate-fade-in ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* 头像 */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-primary-400 to-primary-600' 
                      : 'bg-gradient-to-br from-accent-400 to-accent-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="text-white" size={16} />
                    ) : (
                      <Sparkles className="text-white" size={16} />
                    )}
                  </div>
                  
                  {/* 消息内容 */}
                  <div className={`chat-bubble ${
                    message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'
                  }`}>
                    {/* 如果是分析图片的消息，显示图片缩略图 */}
                    {message.record && (
                      <div className="mb-2 rounded-lg overflow-hidden border border-white/20 w-32">
                        <img 
                          src={message.record.filePath} 
                          alt={message.record.title}
                          className="w-full h-20 object-cover"
                        />
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    {message.createdAt && (
                      <p className="text-xs opacity-50 mt-1 flex items-center gap-1">
                        <Clock size={10} />
                        {formatTime(message.createdAt)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {/* 加载中 */}
              {loading && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
                    <Sparkles className="text-white" size={16} />
                  </div>
                  <div className="chat-bubble chat-bubble-assistant">
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin text-primary-500" size={16} />
                      <span className="text-gray-500">智能体正在思考并调用工具...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
          
          {/* 快捷问题 */}
          {messages.length <= 1 && !loadingHistory && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-400 mb-2">快速提问：</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-primary-100 hover:text-primary-600 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* 选中的病历预览 */}
          {selectedRecord && (
            <div className="px-4 py-2 bg-primary-50 border-t border-primary-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-primary-200">
                  <img 
                    src={selectedRecord.filePath} 
                    alt={selectedRecord.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary-700">将分析此图片：</p>
                  <p className="text-xs text-primary-600">{selectedRecord.title}</p>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1 text-primary-400 hover:text-primary-600 rounded"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}
          
          {/* 输入框 */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
            <div className="flex gap-3">
              {/* 选择病历图片按钮 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRecordPicker(!showRecordPicker)}
                  className={`p-3 rounded-xl transition-all ${
                    records.length > 0 
                      ? 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-600' 
                      : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  } ${selectedRecord ? 'bg-primary-100 text-primary-600' : ''}`}
                  disabled={records.length === 0}
                  title={records.length > 0 ? '选择病历图片让 AI 分析' : '暂无可分析的图片'}
                >
                  <FileImage size={20} />
                </button>
                
                {/* 病历选择下拉框 */}
                {showRecordPicker && records.length > 0 && (
                  <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-10">
                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                      <p className="text-sm font-medium text-gray-700">选择要分析的病历图片</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {records.map((record) => (
                        <button
                          key={record.id}
                          type="button"
                          onClick={() => {
                            setSelectedRecord(record)
                            setShowRecordPicker(false)
                          }}
                          className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img 
                              src={record.filePath} 
                              alt={record.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{record.title}</p>
                            <p className="text-xs text-gray-500">{record.recordType} · {record.recordDate}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedRecord ? "输入您想问的问题，如：这个检查结果正常吗？" : "输入您的健康问题，智能体会自动调用工具回答..."}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || (!input.trim() && !selectedRecord)}
                className="px-5 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              AI 智能体会自动判断并调用工具 · 回答仅供参考
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Chat
