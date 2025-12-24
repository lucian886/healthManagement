import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { recordApi } from '../api'
import { 
  FileText, 
  Upload, 
  Plus, 
  Trash2, 
  X,
  Calendar,
  Building2,
  User,
  Loader2,
  Image,
  File,
  Edit,
  Eye,
  FolderUp,
  CheckCircle,
  Search,
  Filter,
  Grid,
  List,
  Clock,
  Sparkles,
  MessageCircle,
  ChevronRight,
  Tag
} from 'lucide-react'

function Records() {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [filteredRecords, setFilteredRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [currentRecord, setCurrentRecord] = useState(null)
  const [uploading, setUploading] = useState(false)
  
  // 视图和筛选状态
  const [viewMode, setViewMode] = useState('grid') // grid, list, timeline
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    recordType: '',
    description: '',
    hospital: '',
    doctor: '',
    recordDate: '',
    file: null,
    newFiles: []
  })
  const [batchFormData, setBatchFormData] = useState({
    recordType: '',
    hospital: '',
    doctor: '',
    recordDate: '',
    files: []
  })
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  
  const recordTypes = [
    '检查报告',
    '化验单',
    '处方',
    '病历',
    'CT/MRI',
    'X光片',
    '其他'
  ]
  
  useEffect(() => {
    fetchRecords()
  }, [])
  
  // 搜索和筛选
  useEffect(() => {
    let result = [...records]
    
    // 搜索
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(r => 
        r.title?.toLowerCase().includes(query) ||
        r.hospital?.toLowerCase().includes(query) ||
        r.doctor?.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.recordType?.toLowerCase().includes(query)
      )
    }
    
    // 类型筛选
    if (filterType) {
      result = result.filter(r => r.recordType === filterType)
    }
    
    // 年份筛选
    if (filterYear) {
      result = result.filter(r => r.recordDate?.startsWith(filterYear))
    }
    
    setFilteredRecords(result)
  }, [records, searchQuery, filterType, filterYear])
  
  // 获取所有年份
  const getYears = () => {
    const years = new Set()
    records.forEach(r => {
      if (r.recordDate) {
        years.add(r.recordDate.substring(0, 4))
      }
    })
    return Array.from(years).sort().reverse()
  }
  
  // 按时间分组（用于时间线视图）
  const getGroupedByMonth = () => {
    const groups = {}
    filteredRecords.forEach(r => {
      const date = r.recordDate || '未知日期'
      const key = date.substring(0, 7) // YYYY-MM
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(r)
    })
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }
  
  const fetchRecords = async () => {
    try {
      const response = await recordApi.list()
      if (response.success) {
        setRecords(response.data || [])
      }
    } catch (err) {
      console.error('获取病历失败:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const resetForm = () => {
    setFormData({
      title: '',
      recordType: '',
      description: '',
      hospital: '',
      doctor: '',
      recordDate: '',
      file: null,
      newFiles: []
    })
    setCurrentRecord(null)
  }
  
  const resetBatchForm = () => {
    setBatchFormData({
      recordType: '',
      hospital: '',
      doctor: '',
      recordDate: '',
      files: []
    })
    setUploadProgress({ current: 0, total: 0 })
  }
  
  const openCreateModal = () => {
    resetForm()
    setModalMode('create')
    setShowModal(true)
  }
  
  const openBatchModal = () => {
    resetBatchForm()
    setShowBatchModal(true)
  }
  
  const openEditModal = (record, e) => {
    e?.stopPropagation()
    setCurrentRecord(record)
    setFormData({
      title: record.title || '',
      recordType: record.recordType || '',
      description: record.description || '',
      hospital: record.hospital || '',
      doctor: record.doctor || '',
      recordDate: record.recordDate || '',
      file: null,
      newFiles: []
    })
    setModalMode('edit')
    setShowModal(true)
  }
  
  const closeModal = () => {
    setShowModal(false)
    resetForm()
  }
  
  const closeBatchModal = () => {
    setShowBatchModal(false)
    resetBatchForm()
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    
    try {
      if (modalMode === 'create') {
        const data = new FormData()
        data.append('title', formData.title)
        data.append('recordType', formData.recordType)
        data.append('description', formData.description)
        data.append('hospital', formData.hospital)
        data.append('doctor', formData.doctor)
        data.append('recordDate', formData.recordDate)
        if (formData.file) {
          data.append('file', formData.file)
        }
        
        const response = await recordApi.upload(data)
        
        if (response.success) {
          closeModal()
          fetchRecords()
        }
      } else if (modalMode === 'edit') {
        const updateData = {
          title: formData.title,
          recordType: formData.recordType,
          description: formData.description,
          hospital: formData.hospital,
          doctor: formData.doctor,
          recordDate: formData.recordDate
        }
        
        await recordApi.update(currentRecord.id, updateData)
        
        if (formData.newFiles && formData.newFiles.length > 0) {
          await recordApi.addImages(currentRecord.id, formData.newFiles)
        }
        
        closeModal()
        fetchRecords()
      }
    } catch (err) {
      console.error('操作失败:', err)
      alert(err.message || '操作失败，请稍后重试')
    } finally {
      setUploading(false)
    }
  }
  
  const handleBatchSubmit = async (e) => {
    e.preventDefault()
    if (batchFormData.files.length === 0) {
      alert('请选择要上传的文件')
      return
    }
    
    setUploading(true)
    setUploadProgress({ current: 0, total: batchFormData.files.length })
    
    try {
      const data = new FormData()
      data.append('recordType', batchFormData.recordType)
      data.append('hospital', batchFormData.hospital)
      data.append('doctor', batchFormData.doctor)
      data.append('recordDate', batchFormData.recordDate)
      
      for (let i = 0; i < batchFormData.files.length; i++) {
        data.append('files', batchFormData.files[i])
      }
      
      const response = await recordApi.uploadBatch(data)
      
      if (response.success) {
        setUploadProgress({ current: batchFormData.files.length, total: batchFormData.files.length })
        setTimeout(() => {
          closeBatchModal()
          fetchRecords()
        }, 500)
      }
    } catch (err) {
      console.error('批量上传失败:', err)
      alert(err.message || '批量上传失败，请稍后重试')
    } finally {
      setUploading(false)
    }
  }
  
  const handleDelete = async (id, e) => {
    e?.stopPropagation()
    if (!confirm('确定要删除这条病历吗？')) return
    
    try {
      const response = await recordApi.delete(id)
      if (response.success) {
        fetchRecords()
      }
    } catch (err) {
      console.error('删除失败:', err)
    }
  }
  
  const handleBatchFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setBatchFormData({ ...batchFormData, files })
  }
  
  const removeFile = (index) => {
    const newFiles = [...batchFormData.files]
    newFiles.splice(index, 1)
    setBatchFormData({ ...batchFormData, files: newFiles })
  }
  
  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatMonth = (monthStr) => {
    if (monthStr === '未知日期') return monthStr
    const [year, month] = monthStr.split('-')
    return `${year}年${parseInt(month)}月`
  }
  
  // 跳转到详情页
  const goToDetail = (record) => {
    navigate(`/records/${record.id}`)
  }
  
  // 跳转到 AI 分析
  const goToAIAnalysis = (record, e) => {
    e?.stopPropagation()
    navigate('/chat', { state: { analyzeRecord: record } })
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    )
  }
  
  // 统计信息
  const stats = {
    total: records.length,
    types: [...new Set(records.map(r => r.recordType).filter(Boolean))].length,
    hospitals: [...new Set(records.map(r => r.hospital).filter(Boolean))].length,
    thisYear: records.filter(r => r.recordDate?.startsWith(new Date().getFullYear().toString())).length
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 标题和操作 */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">病历管理</h1>
          <p className="text-gray-500 mt-1">上传和管理您的病历、检查报告等医疗文件</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openBatchModal}
            className="px-5 py-2.5 bg-white border border-primary-500 text-primary-600 font-medium rounded-xl hover:bg-primary-50 transition-all flex items-center gap-2"
          >
            <FolderUp size={20} />
            批量上传
          </button>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            上传病历
          </button>
        </div>
      </div>
      
      {/* 统计卡片 */}
      {records.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                <p className="text-sm text-gray-500">总病历数</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Tag className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.types}</p>
                <p className="text-sm text-gray-500">病历类型</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Building2 className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.hospitals}</p>
                <p className="text-sm text-gray-500">就诊医院</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Calendar className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.thisYear}</p>
                <p className="text-sm text-gray-500">今年记录</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 搜索和筛选栏 */}
      {records.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex flex-wrap items-center gap-4">
            {/* 搜索框 */}
            <div className="flex-1 min-w-[200px] relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索病历标题、医院、医生..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            {/* 筛选按钮 */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showFilters || filterType || filterYear
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter size={18} />
              筛选
              {(filterType || filterYear) && (
                <span className="w-2 h-2 rounded-full bg-primary-500" />
              )}
            </button>
            
            {/* 视图切换 */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                title="网格视图"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                title="列表视图"
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'timeline' ? 'bg-white shadow-sm' : ''}`}
                title="时间线视图"
              >
                <Clock size={18} />
              </button>
            </div>
          </div>
          
          {/* 筛选选项 */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-xs text-gray-500 mb-1">类型</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">全部类型</option>
                  {recordTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">年份</label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="">全部年份</option>
                  {getYears().map(year => (
                    <option key={year} value={year}>{year}年</option>
                  ))}
                </select>
              </div>
              {(filterType || filterYear) && (
                <button
                  onClick={() => { setFilterType(''); setFilterYear('') }}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  清除筛选
                </button>
              )}
              <div className="ml-auto text-sm text-gray-500">
                找到 {filteredRecords.length} 条记录
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 病历列表 */}
      {filteredRecords.length > 0 ? (
        <>
          {/* 网格视图 */}
          {viewMode === 'grid' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecords.map((record) => (
                <div 
                  key={record.id} 
                  onClick={() => goToDetail(record)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
                >
                  {/* 图片预览 */}
                  <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden">
                    {record.filePath && record.fileType?.includes('image') ? (
                      <img 
                        src={record.filePath} 
                        alt={record.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : record.images && record.images.length > 0 ? (
                      <img 
                        src={record.images[0].filePath} 
                        alt={record.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="text-gray-300" size={48} />
                      </div>
                    )}
                    
                    {/* 类型标签 */}
                    {record.recordType && (
                      <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-lg">
                        {record.recordType}
                      </span>
                    )}
                    
                    {/* AI 分析按钮 */}
                    <button
                      onClick={(e) => goToAIAnalysis(record, e)}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary-50"
                      title="AI 分析"
                    >
                      <Sparkles size={16} className="text-primary-600" />
                    </button>
                    
                    {/* 图片数量 */}
                    {record.images && record.images.length > 1 && (
                      <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 text-white text-xs rounded-lg">
                        {record.images.length} 张
                      </span>
                    )}
                  </div>
                  
                  {/* 内容 */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 truncate mb-2">{record.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      {record.hospital && (
                        <span className="flex items-center gap-1 truncate">
                          <Building2 size={14} />
                          {record.hospital}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={12} />
                        {record.recordDate || '日期未知'}
                      </span>
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* 列表视图 */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {filteredRecords.map((record) => (
                <div 
                  key={record.id} 
                  onClick={() => goToDetail(record)}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer flex items-center gap-4 group"
                >
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {record.filePath && record.fileType?.includes('image') ? (
                      <img src={record.filePath} alt="" className="w-full h-full object-cover" />
                    ) : record.images && record.images.length > 0 ? (
                      <img src={record.images[0].filePath} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="text-gray-400" size={24} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800 truncate">{record.title}</h3>
                      {record.recordType && (
                        <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full text-xs flex-shrink-0">
                          {record.recordType}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {record.hospital && (
                        <span className="flex items-center gap-1">
                          <Building2 size={14} />
                          {record.hospital}
                        </span>
                      )}
                      {record.doctor && (
                        <span className="flex items-center gap-1">
                          <User size={14} />
                          {record.doctor}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {record.recordDate || '日期未知'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => goToAIAnalysis(record, e)}
                      className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                      title="AI 分析"
                    >
                      <Sparkles size={18} />
                    </button>
                    <button
                      onClick={(e) => openEditModal(record, e)}
                      className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(record.id, e)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* 时间线视图 */}
          {viewMode === 'timeline' && (
            <div className="relative">
              {/* 时间线 */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
              
              <div className="space-y-8">
                {getGroupedByMonth().map(([month, monthRecords]) => (
                  <div key={month} className="relative">
                    {/* 月份标题 */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-sm z-10">
                        {month === '未知日期' ? '?' : month.slice(5)}月
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700">{formatMonth(month)}</h3>
                      <span className="text-sm text-gray-400">{monthRecords.length} 条记录</span>
                    </div>
                    
                    {/* 该月的记录 */}
                    <div className="ml-16 space-y-3">
                      {monthRecords.map((record) => (
                        <div 
                          key={record.id}
                          onClick={() => goToDetail(record)}
                          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {record.filePath && record.fileType?.includes('image') ? (
                                <img src={record.filePath} alt="" className="w-full h-full object-cover" />
                              ) : record.images && record.images.length > 0 ? (
                                <img src={record.images[0].filePath} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <FileText className="text-gray-400" size={20} />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-gray-800 truncate">{record.title}</h4>
                                {record.recordType && (
                                  <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded text-xs">
                                    {record.recordType}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                {record.hospital && <span>{record.hospital}</span>}
                                <span>{record.recordDate?.slice(8)}日</span>
                              </div>
                            </div>
                            
                            <button
                              onClick={(e) => goToAIAnalysis(record, e)}
                              className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Sparkles size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : records.length > 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Search className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-800 mb-2">未找到匹配的病历</h3>
          <p className="text-gray-500">试试调整搜索条件或清除筛选</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <FileText className="text-gray-400" size={36} />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">暂无病历记录</h3>
          <p className="text-gray-500 mb-4">上传您的病历、检查报告等医疗文件</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={openBatchModal}
              className="px-5 py-2.5 border border-primary-500 text-primary-600 font-medium rounded-xl hover:bg-primary-50 transition-all inline-flex items-center gap-2"
            >
              <FolderUp size={20} />
              批量上传
            </button>
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all inline-flex items-center gap-2"
            >
              <Upload size={20} />
              上传病历
            </button>
          </div>
        </div>
      )}
      
      {/* 单个上传模态框 - 保持原有代码 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">
                {modalMode === 'create' ? '上传病历' : '编辑病历'}
              </h2>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">标题 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="例如：2024年体检报告"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">类型</label>
                <select
                  value={formData.recordType}
                  onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">请选择类型</option>
                  {recordTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">医院</label>
                  <input
                    type="text"
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="医院名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">医生</label>
                  <input
                    type="text"
                    value={formData.doctor}
                    onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="医生姓名"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">就诊日期</label>
                <input
                  type="date"
                  value={formData.recordDate}
                  onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="描述病历内容或诊断结果"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {modalMode === 'create' ? '上传文件 *' : '图片管理'}
                </label>
                
                {modalMode === 'edit' && currentRecord?.images && currentRecord.images.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">已有图片（{currentRecord.images.length}张）：</p>
                    <div className="flex flex-wrap gap-2">
                      {currentRecord.images.map((img) => (
                        <div key={img.id} className="relative group">
                          <img 
                            src={img.filePath} 
                            alt={img.fileName}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm('确定删除这张图片吗？')) {
                                try {
                                  await recordApi.deleteImage(currentRecord.id, img.id)
                                  fetchRecords()
                                  const updated = await recordApi.get(currentRecord.id)
                                  if (updated.success) setCurrentRecord(updated.data)
                                } catch (e) {
                                  alert('删除失败')
                                }
                              }
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {modalMode === 'edit' && currentRecord?.filePath && (!currentRecord.images || currentRecord.images.length === 0) && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                    <img src={currentRecord.filePath} alt="" className="w-12 h-12 object-cover rounded" />
                    <span className="text-sm text-gray-600 flex-1">{currentRecord.fileName}</span>
                    <a href={currentRecord.filePath} target="_blank" rel="noopener noreferrer"
                      className="text-primary-600 text-sm hover:underline">查看</a>
                  </div>
                )}
                
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-300 transition-colors">
                  <input
                    type="file"
                    onChange={(e) => {
                      if (modalMode === 'create') {
                        setFormData({ ...formData, file: e.target.files[0] })
                      } else {
                        const files = Array.from(e.target.files)
                        setFormData({ ...formData, newFiles: [...(formData.newFiles || []), ...files] })
                      }
                    }}
                    className="hidden"
                    id="file-upload"
                    accept="image/*,.pdf"
                    multiple={modalMode === 'edit'}
                    required={modalMode === 'create'}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {modalMode === 'create' && formData.file ? (
                      <div className="flex items-center justify-center gap-2 text-primary-600">
                        <File size={20} />
                        <span>{formData.file.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                        <p className="text-gray-600">
                          {modalMode === 'create' ? '点击选择文件' : '点击添加更多图片'}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">支持 JPG、PNG、PDF 格式</p>
                      </>
                    )}
                  </label>
                </div>
                
                {modalMode === 'edit' && formData.newFiles && formData.newFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">待添加（{formData.newFiles.length}张）：</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.newFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg border border-primary-200 flex items-center justify-center">
                            <File size={20} className="text-primary-500" />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = [...(formData.newFiles || [])]
                              newFiles.splice(index, 1)
                              setFormData({ ...formData, newFiles })
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                  取消
                </button>
                <button type="submit" disabled={uploading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                  {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                  {modalMode === 'create' ? '上传' : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* 批量上传模态框 - 保持原有代码 */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">批量上传病历</h2>
              <button onClick={closeBatchModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleBatchSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">类型</label>
                  <select
                    value={batchFormData.recordType}
                    onChange={(e) => setBatchFormData({ ...batchFormData, recordType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">请选择类型</option>
                    {recordTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">就诊日期</label>
                  <input
                    type="date"
                    value={batchFormData.recordDate}
                    onChange={(e) => setBatchFormData({ ...batchFormData, recordDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">医院</label>
                  <input
                    type="text"
                    value={batchFormData.hospital}
                    onChange={(e) => setBatchFormData({ ...batchFormData, hospital: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="医院名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">医生</label>
                  <input
                    type="text"
                    value={batchFormData.doctor}
                    onChange={(e) => setBatchFormData({ ...batchFormData, doctor: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="医生姓名"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选择文件 *</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-300 transition-colors">
                  <input
                    type="file"
                    onChange={handleBatchFileSelect}
                    className="hidden"
                    id="batch-file-upload"
                    accept="image/*,.pdf"
                    multiple
                  />
                  <label htmlFor="batch-file-upload" className="cursor-pointer">
                    <FolderUp className="mx-auto text-gray-400 mb-2" size={40} />
                    <p className="text-gray-600">点击选择多个文件</p>
                    <p className="text-sm text-gray-400 mt-1">支持 JPG、PNG、PDF 格式</p>
                  </label>
                </div>
              </div>
              
              {batchFormData.files.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    已选择 {batchFormData.files.length} 个文件
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {batchFormData.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {uploading && uploadProgress.current > index ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : (
                            <File size={16} className="text-gray-400" />
                          )}
                          <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                          <span className="text-xs text-gray-400">({formatFileSize(file.size)})</span>
                        </div>
                        {!uploading && (
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {uploading && uploadProgress.total > 0 && (
                <div className="p-4 bg-primary-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-primary-700">上传中...</span>
                    <span className="text-sm text-primary-700">{uploadProgress.current}/{uploadProgress.total}</span>
                  </div>
                  <div className="w-full bg-primary-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeBatchModal}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                  取消
                </button>
                <button type="submit" disabled={uploading || batchFormData.files.length === 0}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                  {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                  上传 {batchFormData.files.length > 0 && `(${batchFormData.files.length})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Records
