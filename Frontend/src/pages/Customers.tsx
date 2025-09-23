import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface Customer {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  isActive: boolean
  createdAt: string
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [showThisMonthOnly, setShowThisMonthOnly] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // URL'den filtre parametrelerini kontrol et
    const urlParams = new URLSearchParams(location.search)
    const activeFilter = urlParams.get('active')
    const thisMonthFilter = urlParams.get('thisMonth')
    
    setShowActiveOnly(activeFilter === 'true')
    setShowThisMonthOnly(thisMonthFilter === 'true')
    
    fetchCustomers()
  }, [location.search])

  const fetchCustomers = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net'
      const response = await fetch(`${apiUrl}/api/customers`)
      console.log('API Response:', response)
      if (response.ok) {
        const data = await response.json()
        console.log('Customer Data:', data)
        setCustomers(data)
      } else {
        console.error('API Error:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchCustomers()
      return
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net'
      const response = await fetch(`${apiUrl}/api/customers/search?searchTerm=${encodeURIComponent(searchTerm)}`)
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error searching customers:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net'
      const response = await fetch(`${apiUrl}/api/customers/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setCustomers(customers.filter(c => c.id !== id))
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    // Önce aktif müşteri filtresini uygula
    if (showActiveOnly && !customer.isActive) {
      return false
    }
    
    // Bu ay eklenen müşteri filtresini uygula
    if (showThisMonthOnly) {
      const customerDate = new Date(customer.createdAt)
      const currentDate = new Date()
      const isThisMonth = customerDate.getMonth() === currentDate.getMonth() && 
                         customerDate.getFullYear() === currentDate.getFullYear()
      if (!isThisMonth) {
        return false
      }
    }
    
    // Sonra arama terimini uygula
    return customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase()))
  })

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '1rem',
      position: 'relative'
    }}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)',
        pointerEvents: 'none'
      }}></div>
      
      <div style={{ 
        maxWidth: '64rem', 
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          padding: '2rem 0 1rem 0'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '800', 
              color: '#ffffff',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              margin: '0 0 0.5rem 0',
              letterSpacing: '-0.02em'
            }}>
              {showActiveOnly ? 'Aktif Müşteriler' : showThisMonthOnly ? 'Bu Ay Eklenen Müşteriler' : 'Müşteriler'}
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '500',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
              margin: '0'
            }}>
              {showActiveOnly ? 'Sadece aktif müşterileri görüntülüyorsunuz' : 
               showThisMonthOnly ? 'Bu ay eklenen müşterileri görüntülüyorsunuz' : 
               'Müşteri bilgilerinizi yönetin'}
            </p>
          </div>
          <Link
            to="/customers/new"
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              borderRadius: '16px',
              textDecoration: 'none',
              fontWeight: '600',
              boxShadow: '0 10px 30px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.3s ease',
              fontSize: '1rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(37, 99, 235, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(37, 99, 235, 0.4)';
            }}
          >
            <div style={{
              width: '1.5rem',
              height: '1.5rem',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              marginRight: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{
                color: '#2563eb',
                fontSize: '1rem',
                fontWeight: '700'
              }}>
                +
              </span>
            </div>
            Yeni Müşteri
          </Link>
        </div>

        {/* Search */}
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '2rem',
          borderRadius: '24px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          marginBottom: '2rem',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: 'linear-gradient(90deg, #2563eb, #1d4ed8, #9333ea)'
          }}></div>
          
          <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            alignItems: 'center',
            position: 'relative',
            zIndex: 5
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Müşteri ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem 1rem 3rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '16px',
                    fontSize: '1rem',
                    outline: 'none',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#fafafa',
                    height: '56px',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(37, 99, 235, 0.2)';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.backgroundColor = '#fafafa';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '1.5rem',
                  color: '#6b7280',
                  zIndex: 1
                }}>
                  🔍
                </div>
              </div>
            </div>
            <button
              onClick={handleSearch}
              style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(37, 99, 235, 0.4)',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                position: 'relative',
                zIndex: 10,
                minWidth: '120px',
                height: '56px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(37, 99, 235, 0.5)';
                e.currentTarget.style.zIndex = '20';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.4)';
                e.currentTarget.style.zIndex = '10';
              }}
            >
              Ara
            </button>
          </div>
        </div>

        {/* Customers Table */}
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          overflow: 'hidden',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: 'linear-gradient(90deg, #16a34a, #10b981, #059669)'
          }}></div>
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              fontSize: '1.125rem',
              color: '#6b7280'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem auto'
              }}></div>
              Müşteriler yükleniyor...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              color: '#6b7280',
              fontSize: '1.125rem'
            }}>
              {searchTerm ? 'Arama kriterlerine uygun müşteri bulunamadı.' : 'Henüz müşteri eklenmemiş.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead style={{ 
                  background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  <tr>
                    <th style={{ 
                      padding: '1.5rem 2rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      Müşteri
                    </th>
                    <th style={{ 
                      padding: '1.5rem 2rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      İletişim
                    </th>
                    <th style={{ 
                      padding: '1.5rem 2rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      Durum
                    </th>
                    <th style={{ 
                      padding: '1.5rem 2rem',
                      textAlign: 'left',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      color: '#374151',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      <td style={{ padding: '1.5rem 2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{
                            width: '3rem',
                            height: '3rem',
                            backgroundColor: customer.isActive ? '#dbeafe' : '#fee2e2',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '1rem',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                          }}>
                            <span style={{
                              fontSize: '1.25rem',
                              fontWeight: '700',
                              color: customer.isActive ? '#2563eb' : '#dc2626'
                            }}>
                              {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div style={{ 
                              fontSize: '1rem',
                              fontWeight: '700',
                              color: '#111827',
                              marginBottom: '0.25rem'
                            }}>
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div style={{ 
                              fontSize: '0.75rem',
                              color: '#6b7280',
                              fontStyle: 'italic'
                            }}>
                              {customer.company || 'Şirket belirtilmemiş'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.5rem 2rem' }}>
                        <div style={{ 
                          fontSize: '0.875rem',
                          color: '#111827',
                          marginBottom: '0.25rem',
                          fontWeight: '500'
                        }}>
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div style={{ 
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <span>📞</span>
                            {customer.phone}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1.5rem 2rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.5rem 1rem',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          borderRadius: '12px',
                          backgroundColor: customer.isActive ? '#dcfce7' : '#fee2e2',
                          color: customer.isActive ? '#166534' : '#991b1b',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          gap: '0.25rem'
                        }}>
                          <div style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: customer.isActive ? '#16a34a' : '#dc2626',
                            borderRadius: '50%'
                          }}></div>
                          {customer.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td style={{ padding: '1.5rem 2rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <Link
                            to={`/customers/edit/${customer.id}`}
                            style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '2.5rem',
                              height: '2.5rem',
                              backgroundColor: '#dbeafe',
                              color: '#2563eb',
                              textDecoration: 'none',
                              borderRadius: '10px',
                              fontSize: '1rem',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#2563eb';
                              e.currentTarget.style.color = '#ffffff';
                              e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#dbeafe';
                              e.currentTarget.style.color = '#2563eb';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            ✏️
                          </Link>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '2.5rem',
                              height: '2.5rem',
                              backgroundColor: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              cursor: 'pointer',
                              borderRadius: '10px',
                              fontSize: '1rem',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.2)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#dc2626';
                              e.currentTarget.style.color = '#ffffff';
                              e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#fee2e2';
                              e.currentTarget.style.color = '#dc2626';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Customers