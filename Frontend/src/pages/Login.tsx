import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, LoginRequest } from '../services/authService'
import { useTheme } from '../contexts/ThemeContext'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'

const Login: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Form submit function for keyboard shortcut
  const handleFormSubmit = () => {
    const form = document.querySelector('form');
    if (form) {
      const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (submitButton && !submitButton.disabled) {
        submitButton.click();
      }
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSave: handleFormSubmit,
    onEscape: () => {
      console.log('Login: Escape pressed - clearing form');
      setFormData({ email: '', password: '' });
      setError('');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Starting login process...')
      const response = await authService.login(formData)
      console.log('Login response received:', response)
      
      // Token kaydedildikten sonra authService'ten kontrol et
      if (authService.isAuthenticated()) {
        console.log('Login successful, redirecting to dashboard')
        // localStorage değişikliğini manuel olarak tetikle
        window.dispatchEvent(new Event('storage'))
        window.dispatchEvent(new Event('authChange'))
        // Kısa bir gecikme sonra yönlendir
        setTimeout(() => {
          navigate('/dashboard')
        }, 100)
      } else {
        console.log('Login failed - not authenticated')
        setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Giriş yapılırken bir hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      transition: 'background-color 0.3s ease'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-primary)',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: `0 1px 3px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`,
        border: '1px solid var(--border-primary)',
        width: '100%',
        maxWidth: '400px',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            backgroundColor: theme === 'dark' ? '#f9fafb' : '#1f2937',
            borderRadius: '10px',
            margin: '0 auto 1rem auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.3s ease'
          }}>
            <span style={{ 
              color: theme === 'dark' ? '#1f2937' : '#ffffff',
              fontWeight: '700',
              fontSize: '1.25rem',
              transition: 'color 0.3s ease'
            }}>
              Q
            </span>
          </div>
          <h1 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: 'var(--text-primary)',
            margin: '0 0 0.5rem 0',
            transition: 'color 0.3s ease'
          }}>
            QuickCRM
          </h1>
          <p style={{ 
            color: 'var(--text-secondary)',
            margin: '0',
            fontSize: '0.875rem',
            transition: 'color 0.3s ease'
          }}>
            Hesabınıza giriş yapın
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
              transition: 'color 0.3s ease'
            }}>
              E-posta
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--border-secondary)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--text-primary)';
                e.target.style.boxShadow = `0 0 0 3px ${theme === 'dark' ? 'rgba(249, 250, 251, 0.1)' : 'rgba(31, 41, 55, 0.1)'}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-secondary)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--text-primary)',
              transition: 'color 0.3s ease',
              marginBottom: '0.5rem'
            }}>
              Şifre
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--border-secondary)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--text-primary)';
                e.target.style.boxShadow = `0 0 0 3px ${theme === 'dark' ? 'rgba(249, 250, 251, 0.1)' : 'rgba(31, 41, 55, 0.1)'}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-secondary)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#9ca3af' : (theme === 'dark' ? '#f9fafb' : '#1f2937'),
              color: theme === 'dark' ? '#1f2937' : '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#e5e7eb' : '#374151'
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#f9fafb' : '#1f2937'
              }
            }}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          backgroundColor: 'var(--bg-tertiary)',
          padding: '0.75rem',
          borderRadius: '8px',
          border: '1px solid var(--border-primary)',
          transition: 'all 0.3s ease'
        }}>
          <p style={{ margin: '0' }}>
            Test için: <strong>admin@quickcrm.com</strong> / <strong>Admin123!</strong>
          </p>
        </div>
        
        {/* Theme Toggle Button */}
        <div style={{
          textAlign: 'center',
          marginTop: '1rem'
        }}>
          <button
            onClick={toggleTheme}
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '3rem',
              height: '3rem',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '1.25rem',
              margin: '0 auto'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            title={theme === 'dark' ? 'Gündüz moduna geç' : 'Gece moduna geç'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login


