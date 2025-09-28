import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../config/api'
import { useTheme } from '../contexts/ThemeContext'
import { useSearch } from '../contexts/SearchContext'
import toast from 'react-hot-toast'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'

// Chart.js'i kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

// Memoized Chart Components
const MemoizedLine = memo(Line)
const MemoizedDoughnut = memo(Doughnut)

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

interface ChartData {
  monthlyTrend: {
    labels: string[]
    data: number[]
  }
  categoryDistribution: {
    labels: string[]
    data: number[]
  }
}

interface Activity {
  id: number
  type: 'created' | 'updated' | 'deleted'
  customerName: string
  customerEmail: string
  timestamp: string
  user: string
}

const Dashboard: React.FC = () => {
  const { theme } = useTheme()
  const { openSearch } = useSearch()
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    thisMonthCustomers: 0
  })
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [chartData, setChartData] = useState<ChartData>({
    monthlyTrend: { labels: [], data: [] },
    categoryDistribution: { labels: [], data: [] }
  })
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const hasFetched = useRef(false)

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true
      fetchDashboardData()
    }
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const prepareActivities = useCallback((customers: Customer[]) => {
    // Müşteri verilerinden aktiviteler oluştur
    const activities: Activity[] = customers
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((customer, index) => ({
        id: index + 1,
        type: 'created' as const,
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerEmail: customer.email,
        timestamp: customer.createdAt,
        user: 'Admin' // Gerçek uygulamada kullanıcı bilgisi gelecek
      }))

    setActivities(activities)
  }, [])

  const prepareChartData = useCallback((customers: Customer[]) => {
    // Son 6 ayın verilerini hazırla
    const last6Months: Array<{ month: string; year: number; count: number }> = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      last6Months.push({
        month: date.toLocaleDateString('tr-TR', { month: 'short' }),
        year: date.getFullYear(),
        count: 0
      })
    }

    // Müşteri verilerini aylara göre grupla
    customers.forEach(customer => {
      const customerDate = new Date(customer.createdAt)
      const monthIndex = last6Months.findIndex(month => 
        month.year === customerDate.getFullYear() && 
        month.month === customerDate.toLocaleDateString('tr-TR', { month: 'short' })
      )
      if (monthIndex !== -1) {
        last6Months[monthIndex].count++
      }
    })

    // Kategori dağılımını hazırla (şirket bazında)
    const companyCounts: { [key: string]: number } = {}
    customers.forEach(customer => {
      const company = customer.company || 'Şirket Bilgisi Yok'
      companyCounts[company] = (companyCounts[company] || 0) + 1
    })

    const topCompanies = Object.entries(companyCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    setChartData({
      monthlyTrend: {
        labels: last6Months.map(m => `${m.month} ${m.year}`),
        data: last6Months.map(m => m.count)
      },
      categoryDistribution: {
        labels: topCompanies.map(([company]) => company),
        data: topCompanies.map(([, count]) => count)
      }
    })
  }, [])

  const fetchDashboardData = useCallback(async () => {
    try {
      // Stats endpoint'lerinden verileri çek
      const [totalCustomers, activeCustomers, thisMonthCustomers, customersData] = await Promise.all([
        apiRequest('/Stats/customers/total'),
        apiRequest('/Stats/customers/active'),
        apiRequest('/Stats/customers/this-month'),
        apiRequest('/Customers')
      ])

      setStats({
        totalCustomers: totalCustomers.count || totalCustomers || 0,
        activeCustomers: activeCustomers.count || activeCustomers || 0,
        thisMonthCustomers: thisMonthCustomers.count || thisMonthCustomers || 0
      })

      // Son 5 müşteriyi al ve tarihe göre sırala
      const sortedCustomers = customersData
        .sort((a: Customer, b: Customer) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
      setRecentCustomers(sortedCustomers)

      // Grafik verilerini hazırla
      prepareChartData(customersData)
      
      // Aktivite verilerini hazırla
      prepareActivities(customersData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Dashboard verileri yüklenirken hata oluştu!')
    } finally {
      setLoading(false)
    }
  }, [prepareChartData, prepareActivities])

  // Keyboard shortcuts are handled globally in Layout component

  // Memoized chart options
  const lineChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    plugins: {
      legend: {
        labels: {
          color: 'var(--text-primary)',
          font: { size: 12 }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'var(--text-secondary)',
          font: { size: 11 },
          maxRotation: 45
        },
        grid: {
          color: 'var(--border-primary)',
          display: false
        }
      },
      y: {
        ticks: {
          color: 'var(--text-secondary)',
          font: { size: 11 }
        },
        grid: {
          color: 'var(--border-primary)',
          display: false
        }
      }
    }
  }), [theme])

  const doughnutChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'var(--text-primary)',
          font: { size: 11 },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle' as const
        }
      }
    }
  }), [theme])

  // Memoized chart data
  const lineChartData = useMemo(() => ({
    labels: chartData.monthlyTrend.labels,
    datasets: [{
      label: 'Yeni Müşteriler',
      data: chartData.monthlyTrend.data,
      borderColor: theme === 'dark' ? '#60a5fa' : '#3b82f6',
      backgroundColor: theme === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4
    }]
  }), [chartData.monthlyTrend, theme])

  const doughnutChartData = useMemo(() => ({
    labels: chartData.categoryDistribution.labels,
    datasets: [{
      data: chartData.categoryDistribution.data,
      backgroundColor: [
        theme === 'dark' ? '#60a5fa' : '#3b82f6',
        theme === 'dark' ? '#34d399' : '#10b981',
        theme === 'dark' ? '#fbbf24' : '#f59e0b',
        theme === 'dark' ? '#f87171' : '#ef4444',
        theme === 'dark' ? '#a78bfa' : '#8b5cf6'
      ],
      borderWidth: 0
    }]
  }), [chartData.categoryDistribution, theme])

  // Skeleton Loading Components
  const SkeletonCard = memo(() => (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: `0 1px 3px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`,
      border: '1px solid var(--border-primary)',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          padding: '0.75rem',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '8px',
          marginRight: '1rem',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}>
          <div style={{ 
            width: '1.25rem', 
            height: '1.25rem', 
            backgroundColor: 'var(--text-tertiary)',
            borderRadius: '4px',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}></div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ 
            height: '0.875rem', 
            backgroundColor: 'var(--text-tertiary)',
            borderRadius: '4px',
            marginBottom: '0.5rem',
            width: '60%',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}></div>
          <div style={{ 
            height: '1.75rem', 
            backgroundColor: 'var(--text-tertiary)',
            borderRadius: '4px',
            width: '40%',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}></div>
        </div>
      </div>
    </div>
  ))

  const SkeletonChart = memo(() => (
    <div style={{ 
      backgroundColor: 'var(--bg-primary)',
      padding: isMobile ? '1rem' : '1.5rem',
      borderRadius: '12px',
      boxShadow: `0 1px 3px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`,
      border: '1px solid var(--border-primary)',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div style={{ 
        height: '1.125rem', 
        backgroundColor: 'var(--text-tertiary)',
        borderRadius: '4px',
        marginBottom: '1.5rem',
        width: '50%',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}></div>
      <div style={{ 
        height: '200px', 
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '8px',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `3px solid var(--text-tertiary)`,
          borderTop: `3px solid transparent`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    </div>
  ))

  const SkeletonActivity = memo(() => (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      padding: '1rem 0',
      borderBottom: '1px solid var(--border-primary)'
    }}>
      <div style={{
        width: '2.5rem',
        height: '2.5rem',
        backgroundColor: 'var(--text-tertiary)',
        borderRadius: '50%',
        marginRight: '1rem',
        flexShrink: 0,
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }}></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          height: '0.875rem',
          backgroundColor: 'var(--text-tertiary)',
          borderRadius: '4px',
          marginBottom: '0.25rem',
          width: '70%',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}></div>
        <div style={{
          height: '0.875rem',
          backgroundColor: 'var(--text-tertiary)',
          borderRadius: '4px',
          marginBottom: '0.25rem',
          width: '90%',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}></div>
        <div style={{
          height: '0.75rem',
          backgroundColor: 'var(--text-tertiary)',
          borderRadius: '4px',
          width: '60%',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}></div>
      </div>
    </div>
  ))

  return (
    <div style={{ 
      backgroundColor: 'var(--bg-secondary)',
      minHeight: '100vh',
      padding: isMobile ? '0.5rem' : '1rem',
      transition: 'background-color 0.3s ease',
      animation: 'fadeIn 0.6s ease-out'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '3rem',
          textAlign: 'center',
          padding: '2rem 0'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: theme === 'dark' ? '#f9fafb' : '#1f2937',
            borderRadius: '12px',
            margin: '0 auto 1.5rem auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.3s ease'
          }}>
            <span style={{ 
              color: theme === 'dark' ? '#1f2937' : '#ffffff',
              fontWeight: '700',
              fontSize: '1.5rem',
              transition: 'color 0.3s ease'
            }}>
              Q
            </span>
          </div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
            transition: 'color 0.3s ease'
          }}>
            QuickCRM
          </h1>
          <p style={{ 
            fontSize: '1rem', 
            color: 'var(--text-secondary)',
            fontWeight: '400',
            transition: 'color 0.3s ease'
          }}>
            Müşteri yönetim sisteminize hoş geldiniz
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: isMobile ? '0.75rem' : '1rem',
          marginBottom: '2rem'
        }}>
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
          <Link 
            to="/customers"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: `0 1px 3px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`,
              border: '1px solid var(--border-primary)',
              textDecoration: 'none',
              display: 'block',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 8px 25px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.15)'}`;
                e.currentTarget.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = `0 1px 3px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`;
                e.currentTarget.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
              }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                padding: '0.75rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '8px',
                marginRight: '1rem',
                transition: 'background-color 0.3s ease'
              }}>
                <div style={{ 
                  width: '1.25rem', 
                  height: '1.25rem', 
                  backgroundColor: 'var(--text-secondary)',
                  borderRadius: '4px',
                  transition: 'background-color 0.3s ease'
                }}></div>
              </div>
              <div>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--text-secondary)',
                  margin: '0 0 0.5rem 0',
                  fontWeight: '500',
                  transition: 'color 0.3s ease'
                }}>
                  Toplam Müşteri
                </p>
                <p style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '700', 
                  color: 'var(--text-primary)',
                  margin: '0',
                  transition: 'color 0.3s ease'
                }}>
                  {loading ? '...' : stats.totalCustomers}
                </p>
              </div>
            </div>
          </Link>

          <Link 
            to="/customers?active=true"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: `0 1px 3px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`,
              border: '1px solid var(--border-primary)',
              textDecoration: 'none',
              display: 'block',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 8px 25px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.15)'}`;
                e.currentTarget.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = `0 1px 3px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`;
                e.currentTarget.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
              }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                padding: '0.75rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '8px',
                marginRight: '1rem',
                transition: 'background-color 0.3s ease'
              }}>
                <div style={{ 
                  width: '1.25rem', 
                  height: '1.25rem', 
                  backgroundColor: 'var(--text-secondary)',
                  borderRadius: '4px',
                  transition: 'background-color 0.3s ease'
                }}></div>
              </div>
              <div>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--text-secondary)',
                  margin: '0 0 0.5rem 0',
                  fontWeight: '500',
                  transition: 'color 0.3s ease'
                }}>
                  Aktif Müşteri
                </p>
                <p style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '700', 
                  color: 'var(--text-primary)',
                  margin: '0',
                  transition: 'color 0.3s ease'
                }}>
                  {loading ? '...' : stats.activeCustomers}
                </p>
              </div>
            </div>
          </Link>

          <Link 
            to="/customers?thisMonth=true"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: `0 1px 3px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`,
              border: '1px solid var(--border-primary)',
              textDecoration: 'none',
              display: 'block',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 8px 25px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.15)'}`;
                e.currentTarget.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = `0 1px 3px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`;
                e.currentTarget.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
              }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                padding: '0.75rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '8px',
                marginRight: '1rem',
                transition: 'background-color 0.3s ease'
              }}>
                <div style={{ 
                  width: '1.25rem', 
                  height: '1.25rem', 
                  backgroundColor: 'var(--text-secondary)',
                  borderRadius: '4px',
                  transition: 'background-color 0.3s ease'
                }}></div>
              </div>
              <div>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--text-secondary)',
                  margin: '0 0 0.5rem 0',
                  fontWeight: '500',
                  transition: 'color 0.3s ease'
                }}>
                  Bu Ay Eklenen
                </p>
                <p style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '700', 
                  color: 'var(--text-primary)',
                  margin: '0',
                  transition: 'color 0.3s ease'
                }}>
                  {loading ? '...' : stats.thisMonthCustomers}
                </p>
              </div>
            </div>
          </Link>
            </>
          )}
        </div>

        {/* Charts Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: isMobile ? '0.75rem' : '1rem',
          marginBottom: '2rem',
          overflow: 'hidden'
        }}>
          {loading ? (
            <>
              <SkeletonChart />
              <SkeletonChart />
            </>
          ) : (
            <>
          {/* Monthly Trend Chart */}
          <div style={{ 
            backgroundColor: 'var(--bg-primary)',
            padding: isMobile ? '1rem' : '1.5rem',
            borderRadius: '12px',
            boxShadow: `0 1px 3px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`,
            border: '1px solid var(--border-primary)',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: 'var(--text-primary)',
              margin: '0 0 1.5rem 0',
              transition: 'color 0.3s ease'
            }}>
              📈 Aylık Müşteri Trendi
            </h3>
            {loading ? (
              <div style={{ 
                height: '200px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                transition: 'color 0.3s ease'
              }}>
                Yükleniyor...
              </div>
            ) : (
              <div style={{ 
                height: '200px', 
                width: '100%',
                position: 'relative'
              }}>
                <MemoizedLine
                data={lineChartData}
                options={lineChartOptions}
                style={{ 
                  height: '200px', 
                  width: '100%',
                  maxWidth: '100%'
                }}
              />
              </div>
            )}
          </div>

          {/* Company Distribution Chart */}
          <div style={{ 
            backgroundColor: 'var(--bg-primary)',
            padding: isMobile ? '1rem' : '1.5rem',
            borderRadius: '12px',
            boxShadow: `0 1px 3px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`,
            border: '1px solid var(--border-primary)',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: 'var(--text-primary)',
              margin: '0 0 1.5rem 0',
              transition: 'color 0.3s ease'
            }}>
              🏢 Şirket Dağılımı
            </h3>
            {loading ? (
              <div style={{ 
                height: '200px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                transition: 'color 0.3s ease'
              }}>
                Yükleniyor...
              </div>
            ) : (
              <div style={{ 
                height: '200px', 
                width: '100%',
                position: 'relative'
              }}>
                <MemoizedDoughnut
                data={doughnutChartData}
                options={doughnutChartOptions}
                style={{ 
                  height: '200px', 
                  width: '100%',
                  maxWidth: '100%'
                }}
              />
              </div>
            )}
          </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ 
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '12px',
          boxShadow: `0 1px 3px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`,
          border: '1px solid var(--border-primary)',
          padding: '1.5rem',
          marginBottom: '2rem',
          transition: 'all 0.3s ease'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: 'var(--text-primary)',
            margin: '0 0 1.5rem 0',
            transition: 'color 0.3s ease'
          }}>
            ⚡ Hızlı Aksiyonlar
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: isMobile ? '0.75rem' : '1rem'
          }}>
            <Link 
              to="/customers/new" 
              style={{ 
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                border: '1px solid var(--border-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ 
                width: '2.5rem',
                height: '2.5rem',
                backgroundColor: theme === 'dark' ? '#f9fafb' : '#1f2937',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.75rem',
                transition: 'background-color 0.3s ease'
              }}>
                <span style={{ 
                  color: theme === 'dark' ? '#1f2937' : '#ffffff',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  transition: 'color 0.3s ease'
                }}>
                  +
                </span>
              </div>
              <div>
                <div style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem',
                  transition: 'color 0.3s ease'
                }}>
                  Yeni Müşteri
                </div>
                <div style={{ 
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  transition: 'color 0.3s ease'
                }}>
                  Hızlı ekleme
                </div>
              </div>
            </Link>

            <Link 
              to="/customers" 
              style={{ 
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                border: '1px solid var(--border-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ 
                width: '2.5rem',
                height: '2.5rem',
                backgroundColor: theme === 'dark' ? '#f9fafb' : '#1f2937',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.75rem',
                transition: 'background-color 0.3s ease'
              }}>
                <span style={{ 
                  color: theme === 'dark' ? '#1f2937' : '#ffffff',
                  fontSize: '1rem',
                  transition: 'color 0.3s ease'
                }}>
                  👥
                </span>
              </div>
              <div>
                <div style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem',
                  transition: 'color 0.3s ease'
                }}>
                  Tüm Müşteriler
                </div>
                <div style={{ 
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  transition: 'color 0.3s ease'
                }}>
                  Listeyi görüntüle
                </div>
              </div>
            </Link>

            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '8px',
              border: '1px solid var(--border-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? '#374151' : '#f3f4f6';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            onClick={() => {
              // Hızlı arama modal'ı açılacak (gelecekte implement edilecek)
              alert('Hızlı arama özelliği yakında eklenecek!')
            }}
            >
              <div style={{ 
                width: '2.5rem',
                height: '2.5rem',
                backgroundColor: theme === 'dark' ? '#f9fafb' : '#1f2937',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.75rem',
                transition: 'background-color 0.3s ease'
              }}>
                <span style={{ 
                  color: theme === 'dark' ? '#1f2937' : '#ffffff',
                  fontSize: '1rem',
                  transition: 'color 0.3s ease'
                }}>
                  🔍
                </span>
              </div>
              <div>
                <div style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  marginBottom: '0.25rem',
                  transition: 'color 0.3s ease'
                }}>
                  Hızlı Arama
                </div>
                <div style={{ 
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  transition: 'color 0.3s ease'
                }}>
                  Yakında...
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Timeline */}
        <div style={{ 
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '12px',
          boxShadow: `0 1px 3px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`,
          border: '1px solid var(--border-primary)',
          overflow: 'hidden',
          marginBottom: '2rem',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ 
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-primary)',
            backgroundColor: 'var(--bg-tertiary)',
            transition: 'all 0.3s ease'
          }}>
            <h2 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: 'var(--text-primary)',
              margin: '0',
              transition: 'color 0.3s ease'
            }}>
              📋 Son Aktiviteler
            </h2>
          </div>
          <div style={{ padding: '1.5rem' }}>
            {loading ? (
              <div>
                <SkeletonActivity />
                <SkeletonActivity />
                <SkeletonActivity />
                <SkeletonActivity />
                <SkeletonActivity />
              </div>
            ) : activities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '50%',
                  margin: '0 auto 1.5rem auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.3s ease'
                }}>
                  <span style={{ 
                    fontSize: '2rem',
                    transition: 'color 0.3s ease'
                  }}>
                    📝
                  </span>
                </div>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  color: 'var(--text-primary)',
                  margin: '0 0 0.5rem 0',
                  transition: 'color 0.3s ease'
                }}>
                  Henüz aktivite yok
                </h3>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--text-secondary)',
                  margin: '0',
                  transition: 'color 0.3s ease'
                }}>
                  Müşteri işlemleri burada görünecek
                </p>
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {activities.map((activity, index) => (
                  <div key={activity.id} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '1rem 0',
                    borderBottom: index < activities.length - 1 ? '1px solid var(--border-primary)' : 'none',
                    transition: 'all 0.2s ease'
                  }}>
                    {/* Timeline Icon */}
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      backgroundColor: theme === 'dark' ? '#f9fafb' : '#1f2937',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1rem',
                      flexShrink: 0,
                      transition: 'background-color 0.3s ease'
                    }}>
                      <span style={{
                        color: theme === 'dark' ? '#1f2937' : '#ffffff',
                        fontSize: '1rem',
                        transition: 'color 0.3s ease'
                      }}>
                        {activity.type === 'created' ? '➕' : activity.type === 'updated' ? '✏️' : '🗑️'}
                      </span>
                    </div>

                    {/* Timeline Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '0.25rem',
                        transition: 'color 0.3s ease'
                      }}>
                        {activity.type === 'created' ? 'Yeni müşteri eklendi' : 
                         activity.type === 'updated' ? 'Müşteri güncellendi' : 'Müşteri silindi'}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.25rem',
                        transition: 'color 0.3s ease'
                      }}>
                        <strong>{activity.customerName}</strong> ({activity.customerEmail})
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'color 0.3s ease'
                      }}>
                        <span>👤</span>
                        {activity.user}
                        <span style={{ margin: '0 0.25rem' }}>•</span>
                        <span>🕒</span>
                        {new Date(activity.timestamp).toLocaleString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Customers */}
        <div style={{ 
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '12px',
          boxShadow: `0 1px 3px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`,
          border: '1px solid var(--border-primary)',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ 
            padding: '1.5rem',
            borderBottom: '1px solid var(--border-primary)',
            backgroundColor: 'var(--bg-tertiary)',
            transition: 'all 0.3s ease'
          }}>
            <h2 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: 'var(--text-primary)',
              margin: '0',
              transition: 'color 0.3s ease'
            }}>
              Son Eklenen Müşteriler
            </h2>
          </div>
          <div style={{ padding: '1.5rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ 
                  fontSize: '1rem',
                  color: 'var(--text-secondary)',
                  transition: 'color 0.3s ease'
                }}>
                  Yükleniyor...
                </div>
              </div>
            ) : recentCustomers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '50%',
                  margin: '0 auto 1.5rem auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.3s ease'
                }}>
                  <div style={{ 
                    width: '2rem', 
                    height: '2rem', 
                    backgroundColor: 'var(--text-secondary)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.3s ease'
                  }}>
                    <span style={{ 
                      color: 'var(--bg-primary)',
                      fontSize: '1rem',
                      fontWeight: '700',
                      transition: 'color 0.3s ease'
                    }}>
                      +
                    </span>
                  </div>
                </div>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  color: 'var(--text-primary)',
                  margin: '0 0 0.5rem 0',
                  transition: 'color 0.3s ease'
                }}>
                  Henüz müşteri yok
                </h3>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--text-secondary)',
                  margin: '0 0 2rem 0',
                  maxWidth: '400px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  lineHeight: '1.6',
                  transition: 'color 0.3s ease'
                }}>
                  İlk müşterinizi ekleyerek QuickCRM'yi kullanmaya başlayın. 
                  Müşteri bilgilerini kolayca yönetin ve takip edin.
                </p>
                <Link 
                  to="/customers/new" 
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: theme === 'dark' ? '#f9fafb' : '#1f2937',
                    color: theme === 'dark' ? '#1f2937' : '#ffffff',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#e5e7eb' : '#374151';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#f9fafb' : '#1f2937';
                  }}
                >
                  <div style={{ 
                    width: '1rem', 
                    height: '1rem', 
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderRadius: '4px',
                    marginRight: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.3s ease'
                  }}>
                    <span style={{ 
                      color: theme === 'dark' ? '#f9fafb' : '#1f2937',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      transition: 'color 0.3s ease'
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
                    borderBottom: '1px solid var(--border-primary)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}>
                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1rem',
                      transition: 'background-color 0.3s ease'
                    }}>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        transition: 'color 0.3s ease'
                      }}>
                        {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        marginBottom: '0.25rem',
                        transition: 'color 0.3s ease'
                      }}>
                        {customer.firstName} {customer.lastName}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.25rem',
                        transition: 'color 0.3s ease'
                      }}>
                        {customer.email}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'color 0.3s ease'
                      }}>
                        <span>📅</span>
                        {new Date(customer.createdAt).toLocaleDateString('tr-TR')}
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.625rem',
                          fontWeight: '500',
                          borderRadius: '4px',
                          backgroundColor: customer.isActive ? '#f0fdf4' : '#fef2f2',
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
                  borderTop: '1px solid var(--border-primary)',
                  marginTop: '1rem',
                  transition: 'border-color 0.3s ease'
                }}>
                  <Link 
                    to="/customers" 
                    style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.75rem 1.5rem',
                      backgroundColor: theme === 'dark' ? '#f9fafb' : '#1f2937',
                      color: theme === 'dark' ? '#1f2937' : '#ffffff',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#e5e7eb' : '#374151';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#f9fafb' : '#1f2937';
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

