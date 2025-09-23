import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface DashboardStats {
  totalCustomers: number
  activeCustomers: number
  thisMonthCustomers: number
}

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

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    thisMonthCustomers: 0
  })
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchRecentCustomers()
  }, [])

  const fetchStats = async () => {
    try {
      const apiUrl = 'https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net'
      const response = await fetch(`${apiUrl}/api/stats/dashboard`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentCustomers = async () => {
    try {
      const apiUrl = 'https://quickcrm-backend-2024-edh6dkfdhvbsc9f6.westeurope-01.azurewebsites.net'
      const response = await fetch(`${apiUrl}/api/customers`)
      if (response.ok) {
        const data = await response.json()
        // Son 5 müşteriyi al ve tarihe göre sırala
        const sortedCustomers = data
          .sort((a: Customer, b: Customer) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
        setRecentCustomers(sortedCustomers)
      }
    } catch (error) {
      console.error('Error fetching recent customers:', error)
    }
  }
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
        maxWidth: '56rem', 
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '1.5rem',
          textAlign: 'center',
          padding: '2rem 0 1rem 0'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#2563eb',
            borderRadius: '20px',
            margin: '0 auto 1rem auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)'
          }}>
            <span style={{ 
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '2rem'
            }}>
              Q
            </span>
          </div>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '800', 
            color: '#ffffff',
            marginBottom: '0.5rem',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            letterSpacing: '-0.02em'
          }}>
            QuickCRM
          </h1>
          <p style={{ 
            fontSize: '1.125rem', 
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: '500',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
          }}>
            Müşteri yönetim sisteminize hoş geldiniz
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <Link 
            to="/customers"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '1.5rem',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              textDecoration: 'none',
              display: 'block',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)';
            }}
          >
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '4px',
              background: 'linear-gradient(90deg, #2563eb, #1d4ed8)'
            }}></div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                padding: '1rem',
                backgroundColor: '#dbeafe',
                borderRadius: '12px',
                marginRight: '1rem',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)'
              }}>
                <div style={{ 
                  width: '1.5rem', 
                  height: '1.5rem', 
                  backgroundColor: '#2563eb',
                  borderRadius: '8px'
                }}></div>
              </div>
              <div>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#64748b',
                  margin: '0 0 0.5rem 0',
                  fontWeight: '500'
                }}>
                  Toplam Müşteri
                </p>
                <p style={{ 
                  fontSize: '2rem', 
                  fontWeight: '800', 
                  color: '#0f172a',
                  margin: '0',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {loading ? '...' : stats.totalCustomers}
                </p>
              </div>
            </div>
          </Link>

          <Link 
            to="/customers?active=true"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '1.5rem',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              textDecoration: 'none',
              display: 'block',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)';
            }}
          >
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '4px',
              background: 'linear-gradient(90deg, #16a34a, #15803d)'
            }}></div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                padding: '1rem',
                backgroundColor: '#dcfce7',
                borderRadius: '12px',
                marginRight: '1rem',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)'
              }}>
                <div style={{ 
                  width: '1.5rem', 
                  height: '1.5rem', 
                  backgroundColor: '#16a34a',
                  borderRadius: '8px'
                }}></div>
              </div>
              <div>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#64748b',
                  margin: '0 0 0.5rem 0',
                  fontWeight: '500'
                }}>
                  Aktif Müşteri
                </p>
                <p style={{ 
                  fontSize: '2rem', 
                  fontWeight: '800', 
                  color: '#0f172a',
                  margin: '0',
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {loading ? '...' : stats.activeCustomers}
                </p>
              </div>
            </div>
          </Link>

          <Link 
            to="/customers?thisMonth=true"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '1.5rem',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              textDecoration: 'none',
              display: 'block',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)';
            }}
          >
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '4px',
              background: 'linear-gradient(90deg, #9333ea, #7c3aed)'
            }}></div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                padding: '1rem',
                backgroundColor: '#f3e8ff',
                borderRadius: '12px',
                marginRight: '1rem',
                boxShadow: '0 4px 12px rgba(147, 51, 234, 0.15)'
              }}>
                <div style={{ 
                  width: '1.5rem', 
                  height: '1.5rem', 
                  backgroundColor: '#9333ea',
                  borderRadius: '8px'
                }}></div>
              </div>
              <div>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#64748b',
                  margin: '0 0 0.5rem 0',
                  fontWeight: '500'
                }}>
                  Bu Ay Eklenen
                </p>
                <p style={{ 
                  fontSize: '2rem', 
                  fontWeight: '800', 
                  color: '#0f172a',
                  margin: '0',
                  background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {loading ? '...' : stats.thisMonthCustomers}
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Customers */}
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          overflow: 'hidden',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)'
        }}>
          <div style={{ 
            padding: '1.5rem',
            borderBottom: '1px solid #f1f5f9',
            background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: '#0f172a',
              margin: '0',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Son Eklenen Müşteriler
            </h2>
          </div>
          <div style={{ padding: '2rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ 
                  fontSize: '1.125rem',
                  color: '#4b5563'
                }}>
                  Yükleniyor...
                </div>
              </div>
            ) : recentCustomers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                  borderRadius: '50%',
                  margin: '0 auto 1.5rem auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}>
                  <div style={{ 
                    width: '3rem', 
                    height: '3rem', 
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ 
                      color: '#ffffff',
                      fontSize: '1.5rem',
                      fontWeight: '700'
                    }}>
                      +
                    </span>
                  </div>
                </div>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700', 
                  color: '#0f172a',
                  margin: '0 0 0.5rem 0'
                }}>
                  Henüz müşteri yok
                </h3>
                <p style={{ 
                  fontSize: '1rem', 
                  color: '#64748b',
                  margin: '0 0 2rem 0',
                  maxWidth: '400px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  lineHeight: '1.6'
                }}>
                  İlk müşterinizi ekleyerek QuickCRM'yi kullanmaya başlayın. 
                  Müşteri bilgilerini kolayca yönetin ve takip edin.
                </p>
                <Link 
                  to="/customers/new" 
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '1rem 2rem',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: '600',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(37, 99, 235, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.3)';
                  }}
                >
                  <div style={{ 
                    width: '1.25rem', 
                    height: '1.25rem', 
                    backgroundColor: '#ffffff',
                    borderRadius: '6px',
                    marginRight: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ 
                      color: '#2563eb',
                      fontSize: '0.875rem',
                      fontWeight: '700'
                    }}>
                      +
                    </span>
                  </div>
                  İlk Müşteriyi Ekle
                </Link>
              </div>
            ) : (
              <div>
                {recentCustomers.map((customer) => (
                  <div key={customer.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      backgroundColor: customer.isActive ? '#dbeafe' : '#fee2e2',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1rem',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}>
                      <span style={{
                        fontSize: '1rem',
                        fontWeight: '700',
                        color: customer.isActive ? '#2563eb' : '#dc2626'
                      }}>
                        {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: '700',
                        color: '#111827',
                        marginBottom: '0.25rem'
                      }}>
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        marginBottom: '0.25rem'
                      }}>
                        {customer.email}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span>📅</span>
                        {new Date(customer.createdAt).toLocaleDateString('tr-TR')}
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.625rem',
                          fontWeight: '700',
                          borderRadius: '8px',
                          backgroundColor: customer.isActive ? '#dcfce7' : '#fee2e2',
                          color: customer.isActive ? '#166534' : '#991b1b',
                          marginLeft: '0.5rem'
                        }}>
                          {customer.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{
                  textAlign: 'center',
                  padding: '1.5rem 0 0 0',
                  borderTop: '1px solid #f1f5f9',
                  marginTop: '1rem'
                }}>
                  <Link 
                    to="/customers" 
                    style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      color: '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.3)';
                    }}
                  >
                    Tüm Müşterileri Görüntüle
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard