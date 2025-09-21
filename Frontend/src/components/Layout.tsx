import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}>
        <div style={{ 
          maxWidth: '56rem',
          margin: '0 auto',
          padding: '0 0.75rem'
        }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '2.5rem'
          }}>
            {/* Logo */}
            <Link 
              to="/" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.opacity = '1';
              }}
            >
              <div style={{ 
                width: '1.25rem',
                height: '1.25rem',
                backgroundColor: '#2563eb',
                borderRadius: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
              }}>
                <span style={{ 
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.75rem'
                }}>
                  Q
                </span>
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#111827',
                  margin: '0'
                }}>
                  QuickCRM
                </h1>
                <p style={{ 
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  margin: '-0.125rem 0 0 0'
                }}>
                  Müşteri Yönetimi
                </p>
              </div>
            </Link>

            {/* Navigation */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Link
                to="/"
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  backgroundColor: isActive('/') ? '#dbeafe' : 'transparent',
                  color: isActive('/') ? '#1d4ed8' : '#4b5563'
                }}
              >
                <div style={{ 
                  width: '0.75rem', 
                  height: '0.75rem', 
                  backgroundColor: isActive('/') ? '#1d4ed8' : '#4b5563',
                  borderRadius: '0.25rem',
                  marginRight: '0.25rem'
                }}></div>
                Dashboard
              </Link>
              <Link
                to="/customers"
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  backgroundColor: isActive('/customers') ? '#dbeafe' : 'transparent',
                  color: isActive('/customers') ? '#1d4ed8' : '#4b5563'
                }}
              >
                <div style={{ 
                  width: '0.75rem', 
                  height: '0.75rem', 
                  backgroundColor: isActive('/customers') ? '#1d4ed8' : '#4b5563',
                  borderRadius: '0.25rem',
                  marginRight: '0.25rem'
                }}></div>
                Müşteriler
              </Link>
              <Link
                to="/customers/new"
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  borderRadius: '0.25rem',
                  textDecoration: 'none'
                }}
              >
                <div style={{ 
                  width: '0.75rem', 
                  height: '0.75rem', 
                  backgroundColor: '#ffffff',
                  borderRadius: '0.25rem',
                  marginRight: '0.25rem'
                }}></div>
                Yeni Müşteri
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  )
}

export default Layout