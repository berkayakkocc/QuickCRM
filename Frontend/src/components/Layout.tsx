import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'
import { useTheme } from '../contexts/ThemeContext'
import { useSearch } from '../contexts/SearchContext'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const { theme, actualTheme, toggleTheme } = useTheme()
  const { openSearch } = useSearch()
  const [showKeyboardHelp, setShowKeyboardHelp] = React.useState(false)

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    onNewCustomer: () => {
      console.log('Layout: New customer shortcut triggered');
      // Keyboard help modal'ı kapat
      if (showKeyboardHelp) {
        setShowKeyboardHelp(false);
      }
      // Kısa bir gecikme ile sayfaya git
      setTimeout(() => {
        window.location.href = '/customers/new';
      }, 100);
    },
    onSearch: () => {
      console.log('Layout: Search shortcut triggered');
      // Keyboard help modal'ı kapat
      if (showKeyboardHelp) {
        setShowKeyboardHelp(false);
      }
      // Kısa bir gecikme ile arama aç
      setTimeout(() => {
        openSearch();
      }, 100);
    },
    onEscape: () => {
      console.log('Layout: Escape pressed');
      if (showKeyboardHelp) {
        setShowKeyboardHelp(false);
      }
    }
  });

  // Dashboard navigation with modal close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '1') {
        e.preventDefault();
        console.log('Layout: Ctrl+1 pressed - Dashboard');
        // Keyboard help modal'ı kapat
        if (showKeyboardHelp) {
          setShowKeyboardHelp(false);
        }
        // Kısa bir gecikme ile dashboard'a git
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [showKeyboardHelp]);

  // Listen for custom events from modal
  React.useEffect(() => {
    const handleOpenSearch = () => {
      console.log('Layout: Custom event - openSearch');
      openSearch();
    };

    window.addEventListener('openSearch', handleOpenSearch);
    return () => window.removeEventListener('openSearch', handleOpenSearch);
  }, [openSearch]);

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const handleLogout = () => {
    authService.logout()
    window.location.href = '/login'
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      transition: 'background-color 0.3s ease'
    }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'var(--bg-primary)',
        boxShadow: `0 1px 3px ${actualTheme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`,
        borderBottom: '1px solid var(--border-primary)',
        transition: 'all 0.3s ease'
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
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <div style={{ 
                width: '1.25rem',
                height: '1.25rem',
                backgroundColor: actualTheme === 'dark' ? '#f9fafb' : '#1f2937',
                borderRadius: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.3s ease'
              }}>
                <span style={{ 
                  color: actualTheme === 'dark' ? '#1f2937' : '#ffffff',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  transition: 'color 0.3s ease'
                }}>
                  Q
                </span>
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  margin: '0',
                  transition: 'color 0.3s ease'
                }}>
                  QuickCRM
                </h1>
                <p style={{ 
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  margin: '-0.125rem 0 0 0',
                  transition: 'color 0.3s ease'
                }}>
                  Müşteri Yönetimi
                </p>
              </div>
            </Link>

            {/* Navigation */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                to="/"
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  backgroundColor: isActive('/') ? 'var(--bg-tertiary)' : 'transparent',
                  color: isActive('/') ? 'var(--text-primary)' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/')) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                Dashboard
              </Link>
              <Link
                to="/customers"
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  backgroundColor: isActive('/customers') ? 'var(--bg-tertiary)' : 'transparent',
                  color: isActive('/customers') ? 'var(--text-primary)' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/customers')) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/customers')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                Müşteriler
              </Link>
              <Link
                to="/customers/new"
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.5rem 1rem',
                  backgroundColor: actualTheme === 'dark' ? '#f9fafb' : '#1f2937',
                  color: actualTheme === 'dark' ? '#1f2937' : '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderRadius: '0.375rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = actualTheme === 'dark' ? '#e5e7eb' : '#374151';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = actualTheme === 'dark' ? '#f9fafb' : '#1f2937';
                }}
              >
                Yeni Müşteri
              </Link>
              
              {/* Search Button */}
              <button
                onClick={openSearch}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.5rem',
                  height: '2.5rem',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '1rem',
                  marginRight: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
                title="Arama (Ctrl+K)"
              >
                🔍
              </button>
              
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.5rem',
                  height: '2.5rem',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '1rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
                title={
                  theme === 'light' ? 'Gece moduna geç' : 
                  theme === 'dark' ? 'Otomatik moda geç' : 
                  'Gündüz moduna geç'
                }
              >
                {theme === 'light' ? '🌙' : theme === 'dark' ? '🔄' : '☀️'}
              </button>
              
              {/* Keyboard Help Button */}
              <button
                onClick={() => setShowKeyboardHelp(true)}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.5rem',
                  height: '2.5rem',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '1rem',
                  marginRight: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
                title="Klavye kısayolları (?)"
              >
                ⌨️
              </button>
              
              <button
                onClick={handleLogout}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--border-primary)',
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
                Çıkış
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        backgroundColor: 'var(--bg-secondary)',
        minHeight: 'calc(100vh - 4rem)',
        padding: '2rem 0',
        transition: 'background-color 0.3s ease'
      }}>
        {children}
        </main>
        <KeyboardShortcutsHelp 
          isOpen={showKeyboardHelp} 
          onClose={() => setShowKeyboardHelp(false)} 
        />
      </div>
    )
  }

export default Layout

