import { useState, useEffect } from 'react'
import { medicationApi, chatApi } from '../api'
import { 
  Pill, 
  Plus, 
  X, 
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  Pause,
  Trash2,
  Search,
  Info,
  MessageCircle
} from 'lucide-react'

const METHODS = [
  { value: 'oral', label: '口服' },
  { value: 'injection', label: '注射' },
  { value: 'external', label: '外用' },
  { value: 'sublingual', label: '舌下含服' },
  { value: 'inhale', label: '吸入' },
]

const FREQUENCIES = [
  { value: 'once_daily', label: '每日一次' },
  { value: 'twice_daily', label: '每日两次' },
  { value: 'three_times_daily', label: '每日三次' },
  { value: 'four_times_daily', label: '每日四次' },
  { value: 'once_weekly', label: '每周一次' },
  { value: 'as_needed', label: '按需服用' },
]

function Medication() {
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [selectedDrug, setSelectedDrug] = useState(null)
  const [drugInfo, setDrugInfo] = useState(null)
  const [drugInfoLoading, setDrugInfoLoading] = useState(false)
  const [filter, setFilter] = useState('active') // active, all
  
  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    method: 'oral',
    frequency: 'once_daily',
    takeTime: '08:00',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    note: ''
  })

  useEffect(() => {
    fetchMedications()
  }, [filter])

  const fetchMedications = async () => {
    setLoading(true)
    try {
      const res = filter === 'active' 
        ? await medicationApi.getActive()
        : await medicationApi.list()
      
      if (res.success) {
        setMedications(res.data || [])
      }
    } catch (err) {
      console.error('获取用药记录失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        takeTime: formData.takeTime ? formData.takeTime + ':00' : null,
        endDate: formData.endDate || null
      }
      
      const res = await medicationApi.add(submitData)
      if (res.success) {
        setShowAddModal(false)
        setFormData({
          medicationName: '',
          dosage: '',
          method: 'oral',
          frequency: 'once_daily',
          takeTime: '08:00',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          note: ''
        })
        fetchMedications()
      }
    } catch (err) {
      console.error('添加失败:', err)
    }
  }

  const handleStop = async (id) => {
    if (!confirm('确定停止服用此药物？')) return
    try {
      const res = await medicationApi.stop(id)
      if (res.success) {
        fetchMedications()
      }
    } catch (err) {
      console.error('停止失败:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定删除此用药记录？')) return
    try {
      const res = await medicationApi.delete(id)
      if (res.success) {
        fetchMedications()
      }
    } catch (err) {
      console.error('删除失败:', err)
    }
  }

  const searchDrugInfo = async (drugName) => {
    setSelectedDrug(drugName)
    setShowInfoModal(true)
    setDrugInfoLoading(true)
    setDrugInfo(null)
    
    try {
      // 通过 AI 聊天获取药物信息
      const res = await chatApi.send({
        message: `请告诉我关于${drugName}的详细信息，包括用法用量、适应症、副作用、禁忌和注意事项`,
        sessionId: 'drug_info_' + Date.now()
      })
      
      if (res.success) {
        setDrugInfo(res.data?.reply || '暂无信息')
      }
    } catch (err) {
      setDrugInfo('查询药物信息失败，请稍后重试')
    } finally {
      setDrugInfoLoading(false)
    }
  }

  const formatTime = (time) => {
    if (!time) return '--'
    return time.substring(0, 5)
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
          <h1 className="text-2xl font-bold text-gray-800">用药管理</h1>
          <p className="text-gray-500 text-sm mt-1">记录和管理您的用药情况</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          添加药物
        </button>
      </div>

      {/* 筛选 */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'active' 
              ? 'bg-primary-100 text-primary-600' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <CheckCircle size={16} className="inline mr-1" />
          正在服用
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === 'all' 
              ? 'bg-primary-100 text-primary-600' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部记录
        </button>
      </div>

      {/* 药物列表 */}
      {medications.length > 0 ? (
        <div className="grid gap-4">
          {medications.map((med) => (
            <div 
              key={med.id} 
              className={`bg-white rounded-2xl p-5 border transition-all ${
                med.active ? 'border-green-200 shadow-sm' : 'border-gray-100 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    med.active ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Pill className={med.active ? 'text-green-600' : 'text-gray-400'} size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800 text-lg">{med.medicationName}</h3>
                      {med.active ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
                          服用中
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                          已停用
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      {med.dosage && (
                        <p>剂量: {med.dosage}</p>
                      )}
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <span className="text-gray-400">用法:</span>
                          {METHODS.find(m => m.value === med.method)?.label || med.method}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-gray-400">频率:</span>
                          {FREQUENCIES.find(f => f.value === med.frequency)?.label || med.frequency}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-gray-500">
                        {med.takeTime && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatTime(med.takeTime)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {med.startDate} {med.endDate && `至 ${med.endDate}`}
                        </span>
                      </div>
                      {med.note && (
                        <p className="text-gray-400 mt-1">备注: {med.note}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => searchDrugInfo(med.medicationName)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="查询药物信息"
                  >
                    <Info size={18} />
                  </button>
                  {med.active && (
                    <button
                      onClick={() => handleStop(med.id)}
                      className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                      title="停止服用"
                    >
                      <Pause size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(med.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除记录"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Pill className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">暂无用药记录</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 text-primary-600 font-medium hover:text-primary-700"
          >
            添加第一个药物
          </button>
        </div>
      )}

      {/* 添加药物弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">添加药物</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">药品名称 *</label>
                <input
                  type="text"
                  value={formData.medicationName}
                  onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="如：阿莫西林"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">剂量</label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="如：500mg 或 一片"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">用法</label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {METHODS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">频率</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {FREQUENCIES.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">服药时间</label>
                <input
                  type="time"
                  value={formData.takeTime}
                  onChange={(e) => setFormData({ ...formData, takeTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="可选"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="如：饭后服用"
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                添加药物
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 药物信息弹窗 */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Pill className="text-primary-500" size={20} />
                  {selectedDrug}
                </h3>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {drugInfoLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent" />
                </div>
              ) : drugInfo ? (
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700">{drugInfo}</div>
                </div>
              ) : (
                <p className="text-gray-500 text-center">暂无信息</p>
              )}
            </div>
            
            <div className="p-4 bg-yellow-50 border-t border-yellow-100">
              <p className="text-xs text-yellow-700 flex items-start gap-2">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                以上信息仅供参考，具体用药请遵医嘱。如有不适，请及时就医。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Medication









