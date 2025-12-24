import { useState, useEffect } from 'react'
import { reminderApi } from '../api'
import { 
  Bell, 
  Plus, 
  X, 
  Clock,
  Pill,
  Stethoscope,
  Dumbbell,
  Droplet,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Repeat
} from 'lucide-react'

const REMINDER_TYPES = [
  { value: 'medication', label: '吃药提醒', icon: Pill, color: 'blue' },
  { value: 'checkup', label: '复查提醒', icon: Stethoscope, color: 'purple' },
  { value: 'exercise', label: '运动提醒', icon: Dumbbell, color: 'green' },
  { value: 'water', label: '喝水提醒', icon: Droplet, color: 'cyan' },
  { value: 'custom', label: '自定义提醒', icon: Bell, color: 'orange' },
]

const REPEAT_TYPES = [
  { value: 'once', label: '仅一次' },
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
]

const WEEKDAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

function Reminders() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const [formData, setFormData] = useState({
    reminderType: 'medication',
    content: '',
    reminderTime: '08:00',
    repeatType: 'daily',
    repeatDays: ''
  })

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    setLoading(true)
    try {
      const res = await reminderApi.list()
      if (res.success) {
        setReminders(res.data || [])
      }
    } catch (err) {
      console.error('获取提醒列表失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        reminderTime: formData.reminderTime ? formData.reminderTime + ':00' : null
      }
      
      let res
      if (editingId) {
        res = await reminderApi.update(editingId, submitData)
      } else {
        res = await reminderApi.create(submitData)
      }
      
      if (res.success) {
        setShowAddModal(false)
        setEditingId(null)
        setFormData({
          reminderType: 'medication',
          content: '',
          reminderTime: '08:00',
          repeatType: 'daily',
          repeatDays: ''
        })
        fetchReminders()
      }
    } catch (err) {
      console.error('保存失败:', err)
    }
  }

  const handleEdit = (reminder) => {
    setEditingId(reminder.id)
    setFormData({
      reminderType: reminder.reminderType,
      content: reminder.content,
      reminderTime: reminder.reminderTime ? reminder.reminderTime.substring(0, 5) : '08:00',
      repeatType: reminder.repeatType || 'daily',
      repeatDays: reminder.repeatDays || ''
    })
    setShowAddModal(true)
  }

  const handleToggle = async (id) => {
    try {
      const res = await reminderApi.toggle(id)
      if (res.success) {
        fetchReminders()
      }
    } catch (err) {
      console.error('切换状态失败:', err)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定删除此提醒？')) return
    try {
      const res = await reminderApi.delete(id)
      if (res.success) {
        fetchReminders()
      }
    } catch (err) {
      console.error('删除失败:', err)
    }
  }

  const getReminderTypeConfig = (type) => {
    return REMINDER_TYPES.find(t => t.value === type) || REMINDER_TYPES[4]
  }

  const formatTime = (time) => {
    if (!time) return '--:--'
    return time.substring(0, 5)
  }

  const formatRepeat = (repeatType, repeatDays) => {
    const type = REPEAT_TYPES.find(t => t.value === repeatType)
    if (!type) return '每天'
    
    if (repeatType === 'weekly' && repeatDays) {
      const days = repeatDays.split(',').map(d => WEEKDAYS[parseInt(d) - 1] || d).join('、')
      return `每周 ${days}`
    }
    
    return type.label
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  // 按类型分组
  const groupedReminders = reminders.reduce((acc, reminder) => {
    const type = reminder.reminderType || 'custom'
    if (!acc[type]) acc[type] = []
    acc[type].push(reminder)
    return acc
  }, {})

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">健康提醒</h1>
          <p className="text-gray-500 text-sm mt-1">设置吃药、复查、运动等健康提醒</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setFormData({
              reminderType: 'medication',
              content: '',
              reminderTime: '08:00',
              repeatType: 'daily',
              repeatDays: ''
            })
            setShowAddModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          添加提醒
        </button>
      </div>

      {/* 快捷添加 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {REMINDER_TYPES.map((type) => {
          const Icon = type.icon
          return (
            <button
              key={type.value}
              onClick={() => {
                setEditingId(null)
                setFormData({
                  reminderType: type.value,
                  content: type.label,
                  reminderTime: '08:00',
                  repeatType: 'daily',
                  repeatDays: ''
                })
                setShowAddModal(true)
              }}
              className={`p-4 rounded-xl border border-gray-100 bg-white hover:border-${type.color}-200 hover:bg-${type.color}-50 transition-all text-center group`}
            >
              <div className={`w-10 h-10 mx-auto rounded-xl bg-${type.color}-100 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                <Icon className={`text-${type.color}-600`} size={20} />
              </div>
              <span className="text-sm text-gray-600">{type.label}</span>
            </button>
          )
        })}
      </div>

      {/* 提醒列表 */}
      {reminders.length > 0 ? (
        <div className="space-y-6">
          {REMINDER_TYPES.map((type) => {
            const typeReminders = groupedReminders[type.value]
            if (!typeReminders || typeReminders.length === 0) return null
            
            const Icon = type.icon
            
            return (
              <div key={type.value}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg bg-${type.color}-100 flex items-center justify-center`}>
                    <Icon className={`text-${type.color}-600`} size={16} />
                  </div>
                  <h2 className="font-semibold text-gray-700">{type.label}</h2>
                  <span className="text-sm text-gray-400">({typeReminders.length})</span>
                </div>
                
                <div className="space-y-3">
                  {typeReminders.map((reminder) => (
                    <div 
                      key={reminder.id}
                      className={`bg-white rounded-xl p-4 border transition-all ${
                        reminder.enabled 
                          ? 'border-gray-100 shadow-sm' 
                          : 'border-gray-100 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-800">
                              {formatTime(reminder.reminderTime)}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                              <Repeat size={12} />
                              {formatRepeat(reminder.repeatType, reminder.repeatDays)}
                            </p>
                          </div>
                          <div className="border-l border-gray-200 h-10" />
                          <div>
                            <p className="font-medium text-gray-800">{reminder.content}</p>
                            {reminder.nextReminderTime && reminder.enabled && (
                              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <Calendar size={12} />
                                下次提醒: {new Date(reminder.nextReminderTime).toLocaleString('zh-CN')}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggle(reminder.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              reminder.enabled 
                                ? 'text-green-500 hover:bg-green-50' 
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                            title={reminder.enabled ? '点击禁用' : '点击启用'}
                          >
                            {reminder.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                          </button>
                          <button
                            onClick={() => handleEdit(reminder)}
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(reminder.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Bell className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">暂无提醒</p>
          <p className="text-gray-400 text-sm mt-1">点击上方按钮添加健康提醒</p>
        </div>
      )}

      {/* 添加/编辑提醒弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {editingId ? '编辑提醒' : '添加提醒'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingId(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* 提醒类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">提醒类型</label>
                <div className="grid grid-cols-3 gap-2">
                  {REMINDER_TYPES.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, reminderType: type.value })}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          formData.reminderType === type.value
                            ? `bg-${type.color}-50 border-${type.color}-300`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon size={18} className={`mx-auto mb-1 text-${type.color}-500`} />
                        <span className="text-xs">{type.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* 提醒内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">提醒内容 *</label>
                <input
                  type="text"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="如：吃降压药"
                  required
                />
              </div>
              
              {/* 提醒时间 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">提醒时间</label>
                <input
                  type="time"
                  value={formData.reminderTime}
                  onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              {/* 重复类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">重复</label>
                <select
                  value={formData.repeatType}
                  onChange={(e) => setFormData({ ...formData, repeatType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {REPEAT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              {/* 每周选择 */}
              {formData.repeatType === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">选择星期</label>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map((day, index) => {
                      const dayValue = (index + 1).toString()
                      const isSelected = formData.repeatDays.split(',').includes(dayValue)
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const days = formData.repeatDays ? formData.repeatDays.split(',') : []
                            if (isSelected) {
                              setFormData({
                                ...formData,
                                repeatDays: days.filter(d => d !== dayValue).join(',')
                              })
                            } else {
                              setFormData({
                                ...formData,
                                repeatDays: [...days, dayValue].join(',')
                              })
                            }
                          }}
                          className={`px-3 py-1 rounded-lg text-sm transition-all ${
                            isSelected
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                {editingId ? '保存修改' : '添加提醒'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reminders









