import { useState, useEffect } from 'react'
import { lifeRecordApi } from '../api'
import { 
  UtensilsCrossed, 
  Dumbbell, 
  Moon,
  Plus, 
  X, 
  Calendar,
  Clock,
  Flame,
  Footprints,
  MapPin,
  Smile,
  Meh,
  Frown,
  Coffee,
  Sun,
  Sunset,
  Star,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const RECORD_TYPES = [
  { value: 'diet', label: '饮食', icon: UtensilsCrossed, color: 'orange' },
  { value: 'exercise', label: '运动', icon: Dumbbell, color: 'green' },
  { value: 'sleep', label: '睡眠', icon: Moon, color: 'purple' },
]

const MEAL_TYPES = [
  { value: 'breakfast', label: '早餐', icon: Coffee },
  { value: 'lunch', label: '午餐', icon: Sun },
  { value: 'dinner', label: '晚餐', icon: Sunset },
  { value: 'snack', label: '加餐', icon: Star },
]

const EXERCISE_TYPES = [
  { value: 'walking', label: '步行' },
  { value: 'running', label: '跑步' },
  { value: 'cycling', label: '骑行' },
  { value: 'swimming', label: '游泳' },
  { value: 'yoga', label: '瑜伽' },
  { value: 'gym', label: '健身' },
  { value: 'ball', label: '球类' },
  { value: 'other', label: '其他' },
]

const SLEEP_QUALITY = [
  { value: 'good', label: '很好', icon: Smile, color: 'green' },
  { value: 'normal', label: '一般', icon: Meh, color: 'yellow' },
  { value: 'poor', label: '较差', icon: Frown, color: 'red' },
]

const MOODS = [
  { value: 'happy', label: '开心', emoji: '😊' },
  { value: 'normal', label: '平静', emoji: '😐' },
  { value: 'sad', label: '低落', emoji: '😔' },
  { value: 'anxious', label: '焦虑', emoji: '😰' },
]

function LifeRecord() {
  const [activeType, setActiveType] = useState('diet')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  
  const [formData, setFormData] = useState({
    recordType: 'diet',
    recordDate: new Date().toISOString().split('T')[0],
    recordTime: '',
    // 饮食
    mealType: 'breakfast',
    foodContent: '',
    calories: '',
    // 运动
    exerciseType: 'walking',
    durationMinutes: '',
    caloriesBurned: '',
    distance: '',
    steps: '',
    // 睡眠
    sleepStart: '22:00',
    sleepEnd: '07:00',
    sleepDuration: '',
    sleepQuality: 'normal',
    // 通用
    mood: 'normal',
    note: ''
  })

  useEffect(() => {
    fetchRecords()
  }, [activeType])

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const res = await lifeRecordApi.getRecent(activeType)
      if (res.success) {
        setRecords(res.data || [])
      }
    } catch (err) {
      console.error('获取记录失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const submitData = {
        recordType: formData.recordType,
        recordDate: formData.recordDate,
        mood: formData.mood,
        note: formData.note
      }
      
      if (formData.recordType === 'diet') {
        submitData.mealType = formData.mealType
        submitData.foodContent = formData.foodContent
        submitData.calories = formData.calories ? parseFloat(formData.calories) : null
        submitData.recordTime = formData.recordTime ? formData.recordTime + ':00' : null
      } else if (formData.recordType === 'exercise') {
        submitData.exerciseType = formData.exerciseType
        submitData.durationMinutes = formData.durationMinutes ? parseInt(formData.durationMinutes) : null
        submitData.caloriesBurned = formData.caloriesBurned ? parseFloat(formData.caloriesBurned) : null
        submitData.distance = formData.distance ? parseFloat(formData.distance) : null
        submitData.steps = formData.steps ? parseInt(formData.steps) : null
        submitData.recordTime = formData.recordTime ? formData.recordTime + ':00' : null
      } else if (formData.recordType === 'sleep') {
        submitData.sleepStart = formData.sleepStart ? formData.sleepStart + ':00' : null
        submitData.sleepEnd = formData.sleepEnd ? formData.sleepEnd + ':00' : null
        submitData.sleepDuration = formData.sleepDuration ? parseFloat(formData.sleepDuration) : null
        submitData.sleepQuality = formData.sleepQuality
      }
      
      const res = await lifeRecordApi.add(submitData)
      if (res.success) {
        setShowAddModal(false)
        resetForm()
        fetchRecords()
      }
    } catch (err) {
      console.error('添加失败:', err)
    }
  }

  const resetForm = () => {
    setFormData({
      recordType: activeType,
      recordDate: new Date().toISOString().split('T')[0],
      recordTime: '',
      mealType: 'breakfast',
      foodContent: '',
      calories: '',
      exerciseType: 'walking',
      durationMinutes: '',
      caloriesBurned: '',
      distance: '',
      steps: '',
      sleepStart: '22:00',
      sleepEnd: '07:00',
      sleepDuration: '',
      sleepQuality: 'normal',
      mood: 'normal',
      note: ''
    })
  }

  const handleDelete = async (id) => {
    if (!confirm('确定删除此记录？')) return
    try {
      const res = await lifeRecordApi.delete(id)
      if (res.success) {
        fetchRecords()
      }
    } catch (err) {
      console.error('删除失败:', err)
    }
  }

  const formatTime = (time) => {
    if (!time) return ''
    return time.substring(0, 5)
  }

  const renderRecordCard = (record) => {
    const TypeIcon = RECORD_TYPES.find(t => t.value === record.recordType)?.icon || UtensilsCrossed
    const typeColor = RECORD_TYPES.find(t => t.value === record.recordType)?.color || 'gray'
    
    return (
      <div 
        key={record.id} 
        className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-all"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl bg-${typeColor}-100 flex items-center justify-center flex-shrink-0`}>
              <TypeIcon className={`text-${typeColor}-600`} size={20} />
            </div>
            
            <div className="flex-1">
              {record.recordType === 'diet' && (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">
                      {MEAL_TYPES.find(m => m.value === record.mealType)?.label || '用餐'}
                    </span>
                    {record.calories && (
                      <span className="text-sm text-orange-500 flex items-center gap-1">
                        <Flame size={14} />
                        {record.calories} kcal
                      </span>
                    )}
                  </div>
                  {record.foodContent && (
                    <p className="text-sm text-gray-600">{record.foodContent}</p>
                  )}
                </>
              )}
              
              {record.recordType === 'exercise' && (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">
                      {EXERCISE_TYPES.find(e => e.value === record.exerciseType)?.label || '运动'}
                    </span>
                    {record.durationMinutes && (
                      <span className="text-sm text-green-500">
                        {record.durationMinutes} 分钟
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    {record.caloriesBurned && (
                      <span className="flex items-center gap-1">
                        <Flame size={14} />
                        {record.caloriesBurned} kcal
                      </span>
                    )}
                    {record.distance && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {record.distance} km
                      </span>
                    )}
                    {record.steps && (
                      <span className="flex items-center gap-1">
                        <Footprints size={14} />
                        {record.steps} 步
                      </span>
                    )}
                  </div>
                </>
              )}
              
              {record.recordType === 'sleep' && (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">睡眠记录</span>
                    {record.sleepDuration && (
                      <span className="text-sm text-purple-500">
                        {record.sleepDuration} 小时
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    {record.sleepStart && record.sleepEnd && (
                      <span>
                        {formatTime(record.sleepStart)} - {formatTime(record.sleepEnd)}
                      </span>
                    )}
                    {record.sleepQuality && (
                      <span className={`flex items-center gap-1 ${
                        record.sleepQuality === 'good' ? 'text-green-500' :
                        record.sleepQuality === 'poor' ? 'text-red-500' : 'text-yellow-500'
                      }`}>
                        {SLEEP_QUALITY.find(s => s.value === record.sleepQuality)?.label || '一般'}
                      </span>
                    )}
                  </div>
                </>
              )}
              
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {record.recordDate}
                </span>
                {record.mood && (
                  <span>{MOODS.find(m => m.value === record.mood)?.emoji}</span>
                )}
                {record.note && (
                  <span className="text-gray-500 truncate max-w-[150px]">{record.note}</span>
                )}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => handleDelete(record.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-gray-800">生活记录</h1>
          <p className="text-gray-500 text-sm mt-1">记录您的饮食、运动和睡眠</p>
        </div>
        <button
          onClick={() => {
            setFormData({ ...formData, recordType: activeType })
            setShowAddModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          添加记录
        </button>
      </div>

      {/* 类型切换 */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        {RECORD_TYPES.map((type) => {
          const Icon = type.icon
          return (
            <button
              key={type.value}
              onClick={() => setActiveType(type.value)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                activeType === type.value
                  ? `bg-white shadow-sm text-${type.color}-600`
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={18} />
              {type.label}
            </button>
          )
        })}
      </div>

      {/* 今日统计 */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-5">
        <h3 className="font-medium text-gray-700 mb-3">今日记录</h3>
        <div className="grid grid-cols-3 gap-4">
          {activeType === 'diet' && (
            <>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {records.filter(r => r.recordDate === selectedDate && r.mealType === 'breakfast').length > 0 ? '✓' : '-'}
                </p>
                <p className="text-sm text-gray-500">早餐</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {records.filter(r => r.recordDate === selectedDate && r.mealType === 'lunch').length > 0 ? '✓' : '-'}
                </p>
                <p className="text-sm text-gray-500">午餐</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {records.filter(r => r.recordDate === selectedDate && r.mealType === 'dinner').length > 0 ? '✓' : '-'}
                </p>
                <p className="text-sm text-gray-500">晚餐</p>
              </div>
            </>
          )}
          {activeType === 'exercise' && (
            <>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {records.filter(r => r.recordDate === selectedDate).reduce((sum, r) => sum + (r.durationMinutes || 0), 0)}
                </p>
                <p className="text-sm text-gray-500">分钟</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {records.filter(r => r.recordDate === selectedDate).reduce((sum, r) => sum + (r.caloriesBurned || 0), 0)}
                </p>
                <p className="text-sm text-gray-500">消耗卡路里</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {records.filter(r => r.recordDate === selectedDate).reduce((sum, r) => sum + (r.steps || 0), 0)}
                </p>
                <p className="text-sm text-gray-500">步数</p>
              </div>
            </>
          )}
          {activeType === 'sleep' && (
            <>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {records.find(r => r.recordDate === selectedDate)?.sleepDuration || '-'}
                </p>
                <p className="text-sm text-gray-500">睡眠时长(小时)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {formatTime(records.find(r => r.recordDate === selectedDate)?.sleepStart) || '-'}
                </p>
                <p className="text-sm text-gray-500">入睡时间</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {formatTime(records.find(r => r.recordDate === selectedDate)?.sleepEnd) || '-'}
                </p>
                <p className="text-sm text-gray-500">醒来时间</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 记录列表 */}
      {records.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700">最近记录</h3>
          {records.map(record => renderRecordCard(record))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          {(() => {
            const Icon = RECORD_TYPES.find(t => t.value === activeType)?.icon || UtensilsCrossed
            return <Icon className="mx-auto text-gray-300 mb-4" size={48} />
          })()}
          <p className="text-gray-500">暂无{RECORD_TYPES.find(t => t.value === activeType)?.label}记录</p>
          <button
            onClick={() => {
              setFormData({ ...formData, recordType: activeType })
              setShowAddModal(true)
            }}
            className="mt-4 text-primary-600 font-medium hover:text-primary-700"
          >
            添加第一条记录
          </button>
        </div>
      )}

      {/* 添加记录弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">添加{RECORD_TYPES.find(t => t.value === formData.recordType)?.label}记录</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* 记录类型 */}
              <div className="flex gap-2">
                {RECORD_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, recordType: type.value })}
                      className={`flex-1 p-3 rounded-xl border text-center transition-all ${
                        formData.recordType === type.value
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
              
              {/* 日期 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">记录日期</label>
                <input
                  type="date"
                  value={formData.recordDate}
                  onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              {/* 饮食表单 */}
              {formData.recordType === 'diet' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">餐次</label>
                    <div className="grid grid-cols-4 gap-2">
                      {MEAL_TYPES.map((meal) => {
                        const Icon = meal.icon
                        return (
                          <button
                            key={meal.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, mealType: meal.value })}
                            className={`p-2 rounded-xl border text-center transition-all ${
                              formData.mealType === meal.value
                                ? 'bg-orange-50 border-orange-300'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon size={16} className="mx-auto mb-1 text-orange-500" />
                            <span className="text-xs">{meal.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">食物内容</label>
                    <textarea
                      value={formData.foodContent}
                      onChange={(e) => setFormData({ ...formData, foodContent: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      rows={2}
                      placeholder="如：米饭、青菜、鸡肉"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">卡路里 (kcal)</label>
                    <input
                      type="number"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="可选"
                    />
                  </div>
                </>
              )}
              
              {/* 运动表单 */}
              {formData.recordType === 'exercise' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">运动类型</label>
                    <div className="grid grid-cols-4 gap-2">
                      {EXERCISE_TYPES.map((ex) => (
                        <button
                          key={ex.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, exerciseType: ex.value })}
                          className={`p-2 rounded-xl border text-center transition-all ${
                            formData.exerciseType === ex.value
                              ? 'bg-green-50 border-green-300'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-xs">{ex.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">运动时长 (分钟)</label>
                      <input
                        type="number"
                        value={formData.durationMinutes}
                        onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">消耗卡路里</label>
                      <input
                        type="number"
                        value={formData.caloriesBurned}
                        onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="可选"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">距离 (km)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.distance}
                        onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="可选"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">步数</label>
                      <input
                        type="number"
                        value={formData.steps}
                        onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="可选"
                      />
                    </div>
                  </div>
                </>
              )}
              
              {/* 睡眠表单 */}
              {formData.recordType === 'sleep' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">入睡时间</label>
                      <input
                        type="time"
                        value={formData.sleepStart}
                        onChange={(e) => setFormData({ ...formData, sleepStart: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">醒来时间</label>
                      <input
                        type="time"
                        value={formData.sleepEnd}
                        onChange={(e) => setFormData({ ...formData, sleepEnd: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">睡眠时长 (小时)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.sleepDuration}
                      onChange={(e) => setFormData({ ...formData, sleepDuration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="7.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">睡眠质量</label>
                    <div className="grid grid-cols-3 gap-2">
                      {SLEEP_QUALITY.map((quality) => {
                        const Icon = quality.icon
                        return (
                          <button
                            key={quality.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, sleepQuality: quality.value })}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              formData.sleepQuality === quality.value
                                ? `bg-${quality.color}-50 border-${quality.color}-300`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon size={20} className={`mx-auto mb-1 text-${quality.color}-500`} />
                            <span className="text-sm">{quality.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
              
              {/* 心情 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">今日心情</label>
                <div className="flex gap-2">
                  {MOODS.map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, mood: mood.value })}
                      className={`flex-1 p-2 rounded-xl border text-center transition-all ${
                        formData.mood === mood.value
                          ? 'bg-primary-50 border-primary-300'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl">{mood.emoji}</span>
                      <p className="text-xs mt-1">{mood.label}</p>
                    </button>
                  ))}
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

export default LifeRecord












