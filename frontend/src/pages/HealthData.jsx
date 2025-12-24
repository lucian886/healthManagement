import { useState, useEffect } from 'react'
import { healthDataApi, profileApi, chatApi } from '../api'
import { 
  Scale, 
  Heart, 
  Droplets, 
  Activity,
  Thermometer,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Clock,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  Brain,
  Utensils,
  Target,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'

// 数据类型配置
const DATA_TYPES = {
  weight: { 
    name: '体重', 
    unit: 'kg', 
    icon: Scale, 
    color: 'purple',
    normalRange: '18.5-24 BMI'
  },
  blood_pressure: { 
    name: '血压', 
    unit: 'mmHg', 
    icon: Heart, 
    color: 'red',
    normalRange: '90-140/60-90'
  },
  blood_sugar: { 
    name: '血糖', 
    unit: 'mmol/L', 
    icon: Droplets, 
    color: 'blue',
    normalRange: '3.9-6.1 空腹'
  },
  heart_rate: { 
    name: '心率', 
    unit: '次/分', 
    icon: Activity, 
    color: 'green',
    normalRange: '60-100'
  },
  temperature: { 
    name: '体温', 
    unit: '℃', 
    icon: Thermometer, 
    color: 'orange',
    normalRange: '36.1-37.2'
  },
}

const RECORD_TIMES = [
  { value: 'morning', label: '早晨' },
  { value: 'afternoon', label: '下午' },
  { value: 'evening', label: '晚上' },
  { value: 'night', label: '夜间' },
]

function HealthData() {
  const [activeType, setActiveType] = useState('weight')
  const [latestData, setLatestData] = useState({})
  const [trendData, setTrendData] = useState([])
  const [historyData, setHistoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [days, setDays] = useState(30)
  
  // AI 分析状态
  const [userProfile, setUserProfile] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [showAiPanel, setShowAiPanel] = useState(false)
  
  // 表单状态
  const [formData, setFormData] = useState({
    dataType: 'weight',
    value: '',
    systolicPressure: '',
    diastolicPressure: '',
    recordDate: new Date().toISOString().split('T')[0],
    recordTime: 'morning',
    note: ''
  })

  useEffect(() => {
    fetchData()
    fetchUserProfile()
  }, [activeType, days])
  
  // 获取用户档案（用于计算 BMI）
  const fetchUserProfile = async () => {
    try {
      const res = await profileApi.get()
      if (res.success) {
        setUserProfile(res.data)
      }
    } catch (err) {
      console.error('获取用户档案失败:', err)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      console.log('开始获取数据, activeType:', activeType, 'days:', days)
      
      const [latestRes, trendRes, historyRes] = await Promise.all([
        healthDataApi.getLatest(),
        healthDataApi.getTrend(activeType, days),
        healthDataApi.getHistory(activeType, 10)
      ])
      
      console.log('API 响应 - latest:', latestRes)
      console.log('API 响应 - trend:', trendRes)
      console.log('API 响应 - history:', historyRes)
      
      if (latestRes.success) {
        const latestMap = {}
        latestRes.data?.forEach(item => {
          latestMap[item.dataType] = item
        })
        setLatestData(latestMap)
      }
      
      if (trendRes.success) {
        console.log('设置 trendData:', trendRes.data)
        setTrendData(trendRes.data || [])
      } else {
        console.log('trendRes 不成功:', trendRes)
      }
      
      if (historyRes.success) {
        setHistoryData(historyRes.data || [])
      }
    } catch (err) {
      console.error('获取健康数据失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const submitData = {
        dataType: formData.dataType,
        recordDate: formData.recordDate,
        recordTime: formData.recordTime,
        note: formData.note
      }
      
      if (formData.dataType === 'blood_pressure') {
        submitData.systolicPressure = parseInt(formData.systolicPressure)
        submitData.diastolicPressure = parseInt(formData.diastolicPressure)
        submitData.value = `${formData.systolicPressure}/${formData.diastolicPressure}`
      } else {
        submitData.value = formData.value
      }
      
      const res = await healthDataApi.record(submitData)
      if (res.success) {
        setShowAddModal(false)
        setFormData({
          dataType: 'weight',
          value: '',
          systolicPressure: '',
          diastolicPressure: '',
          recordDate: new Date().toISOString().split('T')[0],
          recordTime: 'morning',
          note: ''
        })
        fetchData()
      }
    } catch (err) {
      console.error('记录失败:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定删除此记录？')) return
    try {
      const res = await healthDataApi.delete(id)
      if (res.success) {
        fetchData()
      }
    } catch (err) {
      console.error('删除失败:', err)
    }
  }

  // 计算趋势
  const getTrend = (type) => {
    const data = latestData[type]
    if (!data) return null
    
    const history = historyData.filter(h => h.dataType === type)
    if (history.length < 2) return 'stable'
    
    const current = type === 'blood_pressure' ? data.systolicPressure : parseFloat(data.value)
    const prev = type === 'blood_pressure' ? history[1]?.systolicPressure : parseFloat(history[1]?.value)
    
    if (!current || !prev) return 'stable'
    if (current > prev) return 'up'
    if (current < prev) return 'down'
    return 'stable'
  }
  
  // 计算 BMI
  const calculateBMI = () => {
    const weight = latestData.weight?.value
    const height = userProfile?.height
    if (!weight || !height) return null
    
    const bmi = parseFloat(weight) / Math.pow(height / 100, 2)
    let status = ''
    let color = ''
    
    if (bmi < 18.5) {
      status = '偏瘦'
      color = 'text-blue-500'
    } else if (bmi < 24) {
      status = '正常'
      color = 'text-green-500'
    } else if (bmi < 28) {
      status = '偏胖'
      color = 'text-yellow-500'
    } else {
      status = '肥胖'
      color = 'text-red-500'
    }
    
    return { value: bmi.toFixed(1), status, color }
  }
  
  // AI 分析体重趋势
  const analyzeWeight = async () => {
    if (!latestData.weight) {
      alert('请先记录体重数据')
      return
    }
    
    setAnalyzing(true)
    setShowAiPanel(true)
    setAiAnalysis(null)
    
    try {
      const bmi = calculateBMI()
      const weightHistory = trendData.map(d => `${d.recordDate}: ${d.value}kg`).join('\n')
      
      const prompt = `请作为专业的健康顾问，分析我的体重数据并给出建议。

## 我的信息
- 当前体重: ${latestData.weight.value} kg
- 身高: ${userProfile?.height || '未知'} cm
- BMI: ${bmi ? `${bmi.value} (${bmi.status})` : '未知'}
- 性别: ${userProfile?.gender === 'male' ? '男' : userProfile?.gender === 'female' ? '女' : '未知'}

## 最近 ${days} 天体重记录
${weightHistory || '暂无历史数据'}

请按以下格式回复：

### 📊 趋势分析
分析我的体重变化趋势（上升/下降/平稳），以及变化幅度是否健康。

### 🎯 目标建议  
根据我的 BMI，给出理想体重范围和合理的减重/增重目标。

### 🍽️ 饮食建议
给出具体的每日饮食计划建议，包括：
1. 每日推荐热量摄入
2. 早餐建议（2-3个具体选项）
3. 午餐建议（2-3个具体选项）
4. 晚餐建议（2-3个具体选项）
5. 加餐/零食建议

### ⚠️ 注意事项
需要特别注意的健康问题或建议。`
      
      const response = await chatApi.send({
        message: prompt,
        sessionId: `weight-analysis-${Date.now()}`
      })
      
      if (response.success) {
        setAiAnalysis({
          content: response.data.content,
          timestamp: new Date().toISOString(),
          bmi: bmi
        })
      } else {
        setAiAnalysis({
          error: true,
          content: '分析失败，请稍后重试'
        })
      }
    } catch (err) {
      console.error('AI 分析失败:', err)
      setAiAnalysis({
        error: true,
        content: '分析失败: ' + (err.message || '网络错误')
      })
    } finally {
      setAnalyzing(false)
    }
  }

  // 颜色映射
  const COLOR_MAP = {
    purple: { from: '#a855f7', to: '#c084fc' },
    red: { from: '#ef4444', to: '#f87171' },
    blue: { from: '#3b82f6', to: '#60a5fa' },
    green: { from: '#22c55e', to: '#4ade80' },
    orange: { from: '#f97316', to: '#fb923c' },
    primary: { from: '#10b981', to: '#34d399' },
  }

  // 简单趋势图
  const TrendChart = ({ data, type }) => {
    console.log('TrendChart 数据:', data, '类型:', type)
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-gray-400">
          暂无数据，开始记录吧
        </div>
      )
    }

    const values = data.map(d => {
      if (type === 'blood_pressure') {
        return d.systolicPressure
      }
      // 处理可能的字符串或数字
      const val = d.value
      return typeof val === 'string' ? parseFloat(val) : val
    }).filter(v => v != null && !isNaN(v))
    
    console.log('处理后的数值:', values)
    
    if (values.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-gray-400">
          暂无有效数据
        </div>
      )
    }

    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1
    const colorKey = DATA_TYPES[type]?.color || 'primary'
    const colors = COLOR_MAP[colorKey] || COLOR_MAP.primary
    
    return (
      <div className="h-48 flex items-end gap-1 px-4 pb-6 pt-2 relative">
        {/* Y轴刻度 */}
        <div className="absolute left-0 top-2 bottom-6 w-10 flex flex-col justify-between text-xs text-gray-400">
          <span>{max.toFixed(1)}</span>
          <span>{((max + min) / 2).toFixed(1)}</span>
          <span>{min.toFixed(1)}</span>
        </div>
        
        {/* 柱状图 */}
        <div className="flex-1 flex items-end gap-1 ml-10 h-full">
          {data.map((d, i) => {
            let val
            if (type === 'blood_pressure') {
              val = d.systolicPressure
            } else {
              val = typeof d.value === 'string' ? parseFloat(d.value) : d.value
            }
            
            if (val == null || isNaN(val)) return null
            
            // 计算高度百分比，确保最小高度
            const heightPercent = Math.max(((val - min) / range) * 80 + 15, 15)
            
            return (
              <div 
                key={i} 
                className="flex-1 group relative flex flex-col items-center"
              >
                <div 
                  className="w-full max-w-8 rounded-t transition-all hover:opacity-80 cursor-pointer"
                  style={{ 
                    height: `${heightPercent}%`,
                    minHeight: '20px',
                    background: `linear-gradient(to top, ${colors.from}, ${colors.to})`
                  }}
                />
                {/* 悬停提示 */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                  {d.recordDate}<br/>
                  {type === 'blood_pressure' ? `${d.systolicPressure}/${d.diastolicPressure}` : val} {d.unit || ''}
                </div>
                {/* X轴日期标签 */}
                {(i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)) && (
                  <span className="absolute -bottom-5 text-xs text-gray-400 whitespace-nowrap">
                    {d.recordDate?.slice(5) || ''}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const formatValue = (data, type) => {
    if (!data) return '--'
    if (type === 'blood_pressure') {
      return `${data.systolicPressure}/${data.diastolicPressure}`
    }
    return data.value
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">健康数据</h1>
          <p className="text-gray-500 text-sm mt-1">记录和追踪您的健康指标</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          记录数据
        </button>
      </div>

      {/* 数据卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.entries(DATA_TYPES).map(([key, config]) => {
          const data = latestData[key]
          const trend = getTrend(key)
          const Icon = config.icon
          
          return (
            <button
              key={key}
              onClick={() => setActiveType(key)}
              className={`p-4 rounded-2xl border transition-all text-left ${
                activeType === key 
                  ? `bg-${config.color}-50 border-${config.color}-200 shadow-md` 
                  : 'bg-white border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-xl bg-${config.color}-100 flex items-center justify-center`}>
                  <Icon className={`text-${config.color}-600`} size={20} />
                </div>
                {trend && (
                  <div className={`flex items-center ${
                    trend === 'up' ? 'text-red-500' : trend === 'down' ? 'text-green-500' : 'text-gray-400'
                  }`}>
                    {trend === 'up' && <TrendingUp size={16} />}
                    {trend === 'down' && <TrendingDown size={16} />}
                    {trend === 'stable' && <Minus size={16} />}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-1">{config.name}</p>
              <p className="text-xl font-bold text-gray-800">
                {formatValue(data, key)}
                <span className="text-sm font-normal text-gray-400 ml-1">{config.unit}</span>
              </p>
            </button>
          )
        })}
      </div>

      {/* 趋势图表 */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {DATA_TYPES[activeType]?.name}趋势
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDays(7)}
              className={`px-3 py-1 rounded-lg text-sm ${days === 7 ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              7天
            </button>
            <button
              onClick={() => setDays(30)}
              className={`px-3 py-1 rounded-lg text-sm ${days === 30 ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              30天
            </button>
            <button
              onClick={() => setDays(90)}
              className={`px-3 py-1 rounded-lg text-sm ${days === 90 ? 'bg-primary-100 text-primary-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              90天
            </button>
            
            {/* AI 分析按钮（仅体重时显示） */}
            {activeType === 'weight' && (
              <button
                onClick={analyzeWeight}
                disabled={analyzing}
                className="ml-2 px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-1.5 disabled:opacity-70"
              >
                {analyzing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                AI 分析
              </button>
            )}
          </div>
        </div>
        
        {/* BMI 信息卡（仅体重时显示） */}
        {activeType === 'weight' && latestData.weight && userProfile?.height && (
          <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <Target className="text-purple-500" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">当前 BMI</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-800">{calculateBMI()?.value}</span>
                    <span className={`text-sm font-medium ${calculateBMI()?.color}`}>
                      {calculateBMI()?.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>身高: {userProfile.height} cm</p>
                <p>体重: {latestData.weight.value} kg</p>
              </div>
            </div>
          </div>
        )}
        
        <TrendChart data={trendData} type={activeType} />
        <div className="mt-2 text-center text-sm text-gray-400">
          正常范围: {DATA_TYPES[activeType]?.normalRange}
        </div>
      </div>
      
      {/* AI 分析结果面板 */}
      {showAiPanel && activeType === 'weight' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain size={24} />
                <div>
                  <h3 className="font-semibold">AI 体重分析报告</h3>
                  <p className="text-sm text-white/80">基于您的体重数据和身体指标</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={analyzeWeight}
                  disabled={analyzing}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="重新分析"
                >
                  <RefreshCw size={18} className={analyzing ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => setShowAiPanel(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {analyzing ? (
              <div className="text-center py-12">
                <Loader2 className="animate-spin mx-auto text-purple-500 mb-4" size={40} />
                <p className="text-gray-600 font-medium">AI 正在分析您的体重数据...</p>
                <p className="text-sm text-gray-400 mt-1">分析趋势、计算目标、生成饮食建议</p>
              </div>
            ) : aiAnalysis ? (
              aiAnalysis.error ? (
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl text-red-600">
                  <AlertCircle size={20} />
                  <span>{aiAnalysis.content}</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* BMI 概览 */}
                  {aiAnalysis.bmi && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        aiAnalysis.bmi.status === '正常' ? 'bg-green-100' :
                        aiAnalysis.bmi.status === '偏瘦' ? 'bg-blue-100' :
                        aiAnalysis.bmi.status === '偏胖' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <span className={`text-xl font-bold ${aiAnalysis.bmi.color}`}>
                          {aiAnalysis.bmi.value}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">您的 BMI 指数</p>
                        <p className={`text-lg font-semibold ${aiAnalysis.bmi.color}`}>
                          {aiAnalysis.bmi.status}
                        </p>
                        <p className="text-xs text-gray-400">正常范围: 18.5 - 24</p>
                      </div>
                    </div>
                  )}
                  
                  {/* AI 分析内容 */}
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {aiAnalysis.content}
                    </div>
                  </div>
                  
                  {/* 时间戳 */}
                  {aiAnalysis.timestamp && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 pt-4 border-t border-gray-100">
                      <Clock size={14} />
                      分析时间: {new Date(aiAnalysis.timestamp).toLocaleString()}
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <Sparkles className="mx-auto text-purple-300 mb-4" size={40} />
                <p className="text-gray-500">点击上方按钮开始 AI 分析</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 历史记录 */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">最近记录</h2>
        {historyData.length > 0 ? (
          <div className="space-y-3">
            {historyData.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-${DATA_TYPES[record.dataType]?.color || 'gray'}-100 flex items-center justify-center`}>
                    {(() => {
                      const Icon = DATA_TYPES[record.dataType]?.icon || Activity
                      return <Icon className={`text-${DATA_TYPES[record.dataType]?.color || 'gray'}-600`} size={18} />
                    })()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {formatValue(record, record.dataType)} {record.unit}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      {record.recordDate}
                      {record.recordTime && (
                        <>
                          <Clock size={14} className="ml-2" />
                          {RECORD_TIMES.find(t => t.value === record.recordTime)?.label || record.recordTime}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            暂无记录
          </div>
        )}
      </div>

      {/* 添加数据弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">记录健康数据</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* 数据类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">数据类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(DATA_TYPES).map(([key, config]) => {
                    const Icon = config.icon
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData({ ...formData, dataType: key })}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          formData.dataType === key
                            ? `bg-${config.color}-50 border-${config.color}-300`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon size={20} className={`mx-auto mb-1 text-${config.color}-500`} />
                        <span className="text-xs">{config.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* 数值输入 */}
              {formData.dataType === 'blood_pressure' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">收缩压（高压）</label>
                    <input
                      type="number"
                      value={formData.systolicPressure}
                      onChange={(e) => setFormData({ ...formData, systolicPressure: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="120"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">舒张压（低压）</label>
                    <input
                      type="number"
                      value={formData.diastolicPressure}
                      onChange={(e) => setFormData({ ...formData, diastolicPressure: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="80"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    数值 ({DATA_TYPES[formData.dataType]?.unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={`输入${DATA_TYPES[formData.dataType]?.name}`}
                    required
                  />
                </div>
              )}
              
              {/* 日期和时间 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">记录日期</label>
                  <input
                    type="date"
                    value={formData.recordDate}
                    onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">时间段</label>
                  <select
                    value={formData.recordTime}
                    onChange={(e) => setFormData({ ...formData, recordTime: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {RECORD_TIMES.map(time => (
                      <option key={time.value} value={time.value}>{time.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* 备注 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="可选"
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                保存记录
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default HealthData

