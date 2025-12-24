import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { profileApi, recordApi, healthDataApi, reminderApi } from '../api'
import { 
  Heart, 
  FileText, 
  MessageCircle, 
  User,
  Activity,
  Scale,
  Ruler,
  Droplets,
  ArrowRight,
  Sparkles,
  Pill,
  Bell,
  UtensilsCrossed,
  TrendingUp,
  Clock
} from 'lucide-react'

function Dashboard() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [records, setRecords] = useState([])
  const [healthData, setHealthData] = useState([])
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, recordsRes, healthRes, reminderRes] = await Promise.all([
          profileApi.get(),
          recordApi.list(),
          healthDataApi.getLatest(),
          reminderApi.getActive()
        ])
        
        if (profileRes.success) setProfile(profileRes.data)
        if (recordsRes.success) setRecords(recordsRes.data || [])
        if (healthRes.success) setHealthData(healthRes.data || [])
        if (reminderRes.success) setReminders(reminderRes.data || [])
      } catch (err) {
        console.error('获取数据失败:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  // 计算 BMI
  const calculateBMI = () => {
    if (profile?.height && profile?.weight) {
      const heightM = profile.height / 100
      return (profile.weight / (heightM * heightM)).toFixed(1)
    }
    return null
  }
  
  const bmi = calculateBMI()
  
  const getBMIStatus = (bmi) => {
    if (!bmi) return { text: '未知', color: 'gray' }
    if (bmi < 18.5) return { text: '偏瘦', color: 'blue' }
    if (bmi < 24) return { text: '正常', color: 'green' }
    if (bmi < 28) return { text: '超重', color: 'yellow' }
    return { text: '肥胖', color: 'red' }
  }
  
  const bmiStatus = getBMIStatus(bmi)

  // 获取最新健康数据
  const getLatestHealthValue = (type) => {
    const data = healthData.find(h => h.dataType === type)
    if (!data) return null
    if (type === 'blood_pressure') {
      return `${data.systolicPressure}/${data.diastolicPressure}`
    }
    return data.value
  }
  
  const quickActions = [
    { 
      icon: MessageCircle, 
      label: 'AI 健康咨询', 
      desc: '症状分析与健康建议',
      path: '/chat',
      gradient: 'from-violet-400 to-violet-600'
    },
    { 
      icon: Activity, 
      label: '健康数据', 
      desc: '体重/血压/血糖记录',
      path: '/health-data',
      gradient: 'from-primary-400 to-primary-600'
    },
    { 
      icon: Pill, 
      label: '用药管理', 
      desc: '记录用药与查询药物',
      path: '/medication',
      gradient: 'from-blue-400 to-blue-600'
    },
    { 
      icon: UtensilsCrossed, 
      label: '生活记录', 
      desc: '饮食/运动/睡眠记录',
      path: '/life-record',
      gradient: 'from-orange-400 to-orange-600'
    },
    { 
      icon: Bell, 
      label: '健康提醒', 
      desc: '吃药/复查/体检提醒',
      path: '/reminders',
      gradient: 'from-amber-400 to-amber-600'
    },
    { 
      icon: FileText, 
      label: '病历管理', 
      desc: '上传与管理病历',
      path: '/records',
      gradient: 'from-teal-400 to-teal-600'
    },
  ]
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 欢迎卡片 */}
      <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-accent-500 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} className="text-yellow-300" />
            <span className="text-primary-100 text-sm">智能健康管家</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            你好，{profile?.realName || user?.username || '用户'}！
          </h1>
          <p className="text-primary-100">
            今天也要保持健康的生活方式哦 💪
          </p>
        </div>
      </div>
      
      {/* 健康指标卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Scale className="text-purple-600" size={20} />
            </div>
            <span className="text-gray-500 text-sm">体重</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {getLatestHealthValue('weight') || profile?.weight || '--'}
            <span className="text-sm font-normal text-gray-400 ml-1">kg</span>
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Heart className="text-red-600" size={20} />
            </div>
            <span className="text-gray-500 text-sm">血压</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {getLatestHealthValue('blood_pressure') || '--'}
            <span className="text-sm font-normal text-gray-400 ml-1">mmHg</span>
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Activity className="text-green-600" size={20} />
            </div>
            <span className="text-gray-500 text-sm">BMI</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-800">{bmi || '--'}</p>
            {bmi && (
              <span className={`text-sm px-2 py-0.5 rounded-full bg-${bmiStatus.color}-100 text-${bmiStatus.color}-600`}>
                {bmiStatus.text}
              </span>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Droplets className="text-blue-600" size={20} />
            </div>
            <span className="text-gray-500 text-sm">血糖</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {getLatestHealthValue('blood_sugar') || '--'}
            <span className="text-sm font-normal text-gray-400 ml-1">mmol/L</span>
          </p>
        </div>
      </div>

      {/* 今日提醒 */}
      {reminders.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Bell className="text-amber-500" size={18} />
              今日提醒
            </h2>
            <Link to="/reminders" className="text-amber-600 text-sm font-medium hover:text-amber-700">
              管理提醒
            </Link>
          </div>
          <div className="space-y-2">
            {reminders.slice(0, 3).map((reminder) => (
              <div key={reminder.id} className="flex items-center gap-3 bg-white/80 rounded-xl p-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Clock className="text-amber-600" size={16} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{reminder.content}</p>
                  <p className="text-xs text-gray-500">
                    {reminder.reminderTime?.substring(0, 5) || '待设置'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 功能入口 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">健康管理</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="text-white" size={24} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">{action.label}</h3>
              <p className="text-sm text-gray-500 mb-3">{action.desc}</p>
              <div className="flex items-center text-primary-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                前往
                <ArrowRight size={16} className="ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* 最近病历 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">最近病历</h2>
          <Link to="/records" className="text-primary-600 text-sm font-medium hover:text-primary-700">
            查看全部
          </Link>
        </div>
        
        {records.length > 0 ? (
          <div className="grid gap-3">
            {records.slice(0, 3).map((record) => (
              <div key={record.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="text-gray-500" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 truncate">{record.title}</h4>
                  <p className="text-sm text-gray-500">
                    {record.recordType || '病历'} · {record.recordDate || '日期未知'}
                  </p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {record.hospital}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
            <FileText className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500">暂无病历记录</p>
            <Link to="/records" className="inline-block mt-3 text-primary-600 text-sm font-medium">
              上传第一份病历
            </Link>
          </div>
        )}
      </div>

      {/* AI 助手提示 */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-1">AI 健康助手</h3>
            <p className="text-sm text-gray-600 mb-3">
              描述您的症状，AI 将分析可能原因并给出建议。也可以查询药物信息、获取健康建议。
            </p>
            <Link 
              to="/chat" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors"
            >
              开始咨询
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
