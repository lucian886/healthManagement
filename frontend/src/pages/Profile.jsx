import { useState, useEffect } from 'react'
import { profileApi } from '../api'
import { 
  User, 
  Phone, 
  MapPin, 
  Heart, 
  AlertCircle,
  Save,
  Loader2,
  Check
} from 'lucide-react'

function Profile() {
  const [profile, setProfile] = useState({
    realName: '',
    gender: '',
    birthDate: '',
    phone: '',
    address: '',
    height: '',
    weight: '',
    bloodType: '',
    allergies: '',
    medicalHistory: '',
    familyHistory: '',
    emergencyContact: '',
    emergencyPhone: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await profileApi.get()
        if (response.success && response.data) {
          setProfile({
            realName: response.data.realName || '',
            gender: response.data.gender || '',
            birthDate: response.data.birthDate || '',
            phone: response.data.phone || '',
            address: response.data.address || '',
            height: response.data.height || '',
            weight: response.data.weight || '',
            bloodType: response.data.bloodType || '',
            allergies: response.data.allergies || '',
            medicalHistory: response.data.medicalHistory || '',
            familyHistory: response.data.familyHistory || '',
            emergencyContact: response.data.emergencyContact || '',
            emergencyPhone: response.data.emergencyPhone || ''
          })
        }
      } catch (err) {
        console.error('获取档案失败:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    setSaved(false)
    
    try {
      const response = await profileApi.update({
        ...profile,
        height: profile.height ? parseFloat(profile.height) : null,
        weight: profile.weight ? parseFloat(profile.weight) : null
      })
      
      if (response.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(response.message || '保存失败')
      }
    } catch (err) {
      setError(err.message || '保存失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }
  
  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
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
      {/* 标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">健康档案</h1>
        <p className="text-gray-500 mt-1">完善您的健康信息，获得更精准的健康建议</p>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm animate-fade-in flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}
      
      {saved && (
        <div className="p-4 bg-green-50 border border-green-100 text-green-600 rounded-xl text-sm animate-fade-in flex items-center gap-2">
          <Check size={20} />
          档案保存成功
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <User className="text-primary-600" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">基本信息</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">真实姓名</label>
              <input
                type="text"
                value={profile.realName}
                onChange={(e) => handleChange('realName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="请输入真实姓名"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">性别</label>
              <select
                value={profile.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">请选择</option>
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">出生日期</label>
              <input
                type="date"
                value={profile.birthDate}
                onChange={(e) => handleChange('birthDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">手机号码</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="请输入手机号码"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">住址</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="请输入住址"
              />
            </div>
          </div>
        </div>
        
        {/* 健康信息 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Heart className="text-red-600" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">健康信息</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">身高 (cm)</label>
              <input
                type="number"
                value={profile.height}
                onChange={(e) => handleChange('height', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="170"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">体重 (kg)</label>
              <input
                type="number"
                value={profile.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="65"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">血型</label>
              <select
                value={profile.bloodType}
                onChange={(e) => handleChange('bloodType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">请选择</option>
                <option value="A">A 型</option>
                <option value="B">B 型</option>
                <option value="AB">AB 型</option>
                <option value="O">O 型</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">过敏史</label>
              <textarea
                value={profile.allergies}
                onChange={(e) => handleChange('allergies', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={2}
                placeholder="请描述您的过敏史（如药物过敏、食物过敏等）"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">病史</label>
              <textarea
                value={profile.medicalHistory}
                onChange={(e) => handleChange('medicalHistory', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={2}
                placeholder="请描述您的病史（如慢性病、手术史等）"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">家族病史</label>
              <textarea
                value={profile.familyHistory}
                onChange={(e) => handleChange('familyHistory', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={2}
                placeholder="请描述家族病史（如遗传疾病等）"
              />
            </div>
          </div>
        </div>
        
        {/* 紧急联系人 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <Phone className="text-orange-600" size={20} />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">紧急联系人</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">联系人姓名</label>
              <input
                type="text"
                value={profile.emergencyContact}
                onChange={(e) => handleChange('emergencyContact', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="请输入紧急联系人姓名"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">联系人电话</label>
              <input
                type="tel"
                value={profile.emergencyPhone}
                onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="请输入紧急联系人电话"
              />
            </div>
          </div>
        </div>
        
        {/* 保存按钮 */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
            保存档案
          </button>
        </div>
      </form>
    </div>
  )
}

export default Profile











