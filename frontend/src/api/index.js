import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加 Token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

// 认证相关 API
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
}

// 档案相关 API
export const profileApi = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
}

// 病历相关 API
export const recordApi = {
  list: () => api.get('/records'),
  get: (id) => api.get(`/records/${id}`),
  create: (data) => api.post('/records', data),
  upload: (formData) => api.post('/records/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadBatch: (formData) => api.post('/records/upload-batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/records/${id}`, data),
  delete: (id) => api.delete(`/records/${id}`),
  addImages: (recordId, files) => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    return api.post(`/records/${recordId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  deleteImage: (recordId, imageId) => api.delete(`/records/${recordId}/images/${imageId}`),
}

// 聊天相关 API
export const chatApi = {
  send: (data) => api.post('/chat', data),
  getHistory: (sessionId) => api.get(`/chat/history/${sessionId}`),
  getSessions: () => api.get('/chat/sessions'),
  deleteSession: (sessionId) => api.delete(`/chat/sessions/${sessionId}`),
  analyzeRecordImage: (recordId, message) => api.post(`/chat/analyze-image/${recordId}`, { message }),
}

// 健康数据 API
export const healthDataApi = {
  // 记录健康数据
  record: (data) => api.post('/health-data', data),
  // 获取最新数据
  getLatest: () => api.get('/health-data/latest'),
  // 获取趋势数据
  getTrend: (dataType, days = 30) => api.get(`/health-data/trend/${dataType}?days=${days}`),
  // 获取某天数据
  getDaily: (date) => api.get(`/health-data/daily?date=${date}`),
  // 获取历史数据
  getHistory: (dataType, limit = 30) => api.get(`/health-data/history/${dataType}?limit=${limit}`),
  // 删除数据
  delete: (id) => api.delete(`/health-data/${id}`),
}

// 健康提醒 API
export const reminderApi = {
  // 创建提醒
  create: (data) => api.post('/reminders', data),
  // 获取所有提醒
  list: () => api.get('/reminders'),
  // 获取活跃提醒
  getActive: () => api.get('/reminders/active'),
  // 更新提醒
  update: (id, data) => api.put(`/reminders/${id}`, data),
  // 切换状态
  toggle: (id) => api.patch(`/reminders/${id}/toggle`),
  // 删除提醒
  delete: (id) => api.delete(`/reminders/${id}`),
}

// 用药管理 API
export const medicationApi = {
  // 添加用药
  add: (data) => api.post('/medications', data),
  // 获取所有用药
  list: () => api.get('/medications'),
  // 获取正在服用的
  getActive: () => api.get('/medications/active'),
  // 更新用药
  update: (id, data) => api.put(`/medications/${id}`, data),
  // 停止用药
  stop: (id) => api.patch(`/medications/${id}/stop`),
  // 删除用药
  delete: (id) => api.delete(`/medications/${id}`),
}

// 生活记录 API
export const lifeRecordApi = {
  // 添加记录
  add: (data) => api.post('/life-records', data),
  // 获取某天记录
  getDaily: (date) => api.get(`/life-records/daily?date=${date}`),
  // 获取类型记录
  getByType: (type) => api.get(`/life-records/type/${type}`),
  // 获取最近记录
  getRecent: (type) => api.get(`/life-records/recent/${type}`),
  // 删除记录
  delete: (id) => api.delete(`/life-records/${id}`),
}

export default api
