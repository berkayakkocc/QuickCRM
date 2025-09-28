// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || '/api'

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    // Auth endpoints
    auth: {
      login: `${API_BASE_URL}/Auth/login`,
      register: `${API_BASE_URL}/Auth/register`,
    },
    // Customer endpoints
    customers: {
      base: `${API_BASE_URL}/Customers`,
      search: `${API_BASE_URL}/Customers/search`,
      byId: (id: number) => `${API_BASE_URL}/Customers/${id}`,
    },
    // Stats endpoints
    stats: {
      dashboard: `${API_BASE_URL}/Stats/dashboard`,
      customersTotal: `${API_BASE_URL}/Stats/customers/total`,
      customersActive: `${API_BASE_URL}/Stats/customers/active`,
      customersThisMonth: `${API_BASE_URL}/Stats/customers/this-month`,
    },
    // Customer Notes endpoints
    customerNotes: {
      base: `${API_BASE_URL}/CustomerNotes`,
      byCustomerId: (customerId: number) => `${API_BASE_URL}/CustomerNotes/customer/${customerId}`,
      byId: (id: number) => `${API_BASE_URL}/CustomerNotes/${id}`,
    }
  }
}

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => {
  return `${API_BASE_URL}${endpoint}`
}

// Helper function to make API requests
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = getApiUrl(endpoint)
  
  // Auth token'ı al
  const token = localStorage.getItem('authToken')
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  }

  // Timeout controller
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 saniye timeout

  try {
    console.log('API Request:', url, options)
    
    const response = await fetch(url, { 
      ...defaultOptions, 
      ...options,
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    console.log('API Response:', response.status, response.statusText)
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token geçersizse logout yap
        localStorage.removeItem('authToken')
        window.location.href = '/login'
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('API Data:', data)
    return data
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('API Request timeout:', url)
        throw new Error('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.')
      }
      console.error('API Request error:', error.message)
      throw error
    }
    
    throw new Error('Bilinmeyen bir hata oluştu')
  }
}


