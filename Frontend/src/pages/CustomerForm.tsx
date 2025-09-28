import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiRequest } from '../config/api'
import { useTheme } from '../contexts/ThemeContext'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'
import toast from 'react-hot-toast'
// ArrowLeftIcon import removed - not used

interface CustomerFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string 
  notes: string
}

const CustomerForm: React.FC = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    notes: ''
  })

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
      console.log('CustomerForm: Escape pressed - going back');
      navigate('/customers');
    }
  });

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit) {
      fetchCustomer()
    }
  }, [id])

  const fetchCustomer = async () => {
    if (!id) return

    setLoading(true)
    try {
      const customer = await apiRequest(`/Customers/${id}`)
      setFormData({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone || '',
        company: customer.company || '',
        notes: customer.notes || ''
      })
    } catch (error) {
      console.error('Error fetching customer:', error)
      toast.error('Müşteri bilgileri yüklenirken hata oluştu!')
    } finally {
      setLoading(false)
    }
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSave: () => {
      if (!saving) {
        const form = document.querySelector('form');
        if (form) {
          const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (submitButton && !submitButton.disabled) {
            submitButton.click();
          }
        }
      }
    },
    onEscape: () => {
      navigate('/customers');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted!') // Debug
    console.log('Form data:', formData) // Debug
    console.log('Is edit:', isEdit) // Debug
    setSaving(true)

    try {
      const url = isEdit ? `/Customers/${id}` : '/Customers'
      const method = isEdit ? 'PUT' : 'POST'
      
      const payload = isEdit 
        ? { id: parseInt(id!), ...formData, isActive: true }
        : formData

      console.log('API Request:', { url, method, payload }) // Debug

      await apiRequest(url, {
        method,
        body: JSON.stringify(payload),
      })

      console.log('API Request successful!') // Debug
      
      // Başarı mesajını göster
      const successMsg = isEdit ? 'Müşteri başarıyla güncellendi!' : 'Müşteri başarıyla oluşturuldu!'
      toast.success(successMsg)
      
      // 2 saniye bekle ve sonra yönlendir
      setTimeout(() => {
        navigate('/customers', { replace: true })
      }, 2000)
      
    } catch (error) {
      console.error('Error saving customer:', error)
      toast.error('Müşteri kaydedilirken bir hata oluştu!')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'background-color 0.3s ease'
      }}>
        <div style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          transition: 'color 0.3s ease'
        }}>
          Yükleniyor...
        </div>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      minHeight: '100vh',
      padding: '2rem 1rem',
      transition: 'background-color 0.3s ease'
    }}>
      <div style={{
        maxWidth: '56rem',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '2rem',
          padding: '0 0 1rem 0'
        }}>
          <button
            onClick={() => navigate('/customers')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '500',
              marginRight: '1.5rem',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>←</span>
            Geri Dön
          </button>
          <div>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: '0 0 0.5rem 0',
              letterSpacing: '-0.02em',
              transition: 'color 0.3s ease'
            }}>
              {isEdit ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
            </h1>
            <p style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              fontWeight: '400',
              margin: '0',
              transition: 'color 0.3s ease'
            }}>
              {isEdit ? 'Müşteri bilgilerini güncelleyin' : 'Yeni müşteri bilgilerini girin'}
            </p>
          </div>
        </div>

        {/* Form */}
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '12px',
          boxShadow: `0 1px 3px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`,
          border: '1px solid var(--border-primary)',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}>
          <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <label htmlFor="firstName" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
              transition: 'color 0.3s ease',
                  marginBottom: '0.5rem'
                }}>
                  Ad *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-secondary)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--text-primary)';
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${theme === 'dark' ? 'rgba(249, 250, 251, 0.1)' : 'rgba(31, 41, 55, 0.1)'}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-secondary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label htmlFor="lastName" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
              transition: 'color 0.3s ease',
                  marginBottom: '0.5rem'
                }}>
                  Soyad *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-secondary)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--text-primary)';
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${theme === 'dark' ? 'rgba(249, 250, 251, 0.1)' : 'rgba(31, 41, 55, 0.1)'}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-secondary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="email" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'var(--text-primary)',
              transition: 'color 0.3s ease',
                marginBottom: '0.5rem'
              }}>
                E-posta *
              </label>
              <input
                type="email"
                id="email"
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
                  transition: 'all 0.2s ease',
                  backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#6b7280';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(107, 114, 128, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <label htmlFor="phone" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
              transition: 'color 0.3s ease',
                  marginBottom: '0.5rem'
                }}>
                  Telefon
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-secondary)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--text-primary)';
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${theme === 'dark' ? 'rgba(249, 250, 251, 0.1)' : 'rgba(31, 41, 55, 0.1)'}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-secondary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div>
                <label htmlFor="company" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
              transition: 'color 0.3s ease',
                  marginBottom: '0.5rem'
                }}>
                  Şirket
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-secondary)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--text-primary)';
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${theme === 'dark' ? 'rgba(249, 250, 251, 0.1)' : 'rgba(31, 41, 55, 0.1)'}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-secondary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label htmlFor="notes" style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'var(--text-primary)',
              transition: 'color 0.3s ease',
                marginBottom: '0.5rem'
              }}>
                Notlar
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-secondary)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                  resize: 'vertical',
                  minHeight: '100px',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#6b7280';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(107, 114, 128, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-primary)',
              transition: 'border-color 0.3s ease'
            }}>
              <button
                type="button"
                onClick={() => navigate('/customers')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: saving ? '#9ca3af' : (theme === 'dark' ? '#f9fafb' : '#1f2937'),
                  color: theme === 'dark' ? '#1f2937' : '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#e5e7eb' : '#374151';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!saving) {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#f9fafb' : '#1f2937';
                  }
                }}
              >
                {saving ? 'Kaydediliyor...' : (isEdit ? 'Güncelle' : 'Kaydet')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CustomerForm


