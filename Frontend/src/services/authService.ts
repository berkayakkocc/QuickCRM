import { apiRequest } from '../config/api'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  token?: string
  user?: {
    id: string
    username: string
    email: string
  }
  message?: string
}

class AuthService {
  private token: string | null = null

  constructor() {
    // LocalStorage'dan token'ı yükle
    this.token = localStorage.getItem('authToken')
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiRequest('/Auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      })
      
      console.log('Login response:', response) // Debug için
      
      // Token farklı field'larda olabilir, kontrol et
      const token = response.token || response.accessToken || response.access_token || response.jwt
      
      if (token) {
        this.token = token
        localStorage.setItem('authToken', token)
        console.log('Token saved:', token) // Debug için
      } else {
        console.warn('No token found in response:', response) // Debug için
      }
      
      return response
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiRequest('/Auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      })
      
      return response
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  async validate(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiRequest('/Auth/validate', {
        method: 'POST',
        body: JSON.stringify(credentials)
      })
      
      return response
    } catch (error) {
      console.error('Validate error:', error)
      throw error
    }
  }

  getToken(): string | null {
    return this.token
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  logout(): void {
    this.token = null
    localStorage.removeItem('authToken')
  }

  // API istekleri için authorization header'ı döndür
  getAuthHeaders(): Record<string, string> {
    if (this.token) {
      return {
        'Authorization': `Bearer ${this.token}`
      }
    }
    return {}
  }
}

export const authService = new AuthService()


