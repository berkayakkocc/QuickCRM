import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import CustomerForm from './pages/CustomerForm'
import Login from './pages/Login'
import { authService } from './services/authService'
import { ThemeProvider } from './contexts/ThemeContext'
import { SearchProvider } from './contexts/SearchContext'
import SearchModal from './components/SearchModal'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Sayfa yüklendiğinde authentication durumunu kontrol et
    const checkAuth = () => {
      try {
        const authStatus = authService.isAuthenticated()
        console.log('App - Auth status:', authStatus)
        setIsAuthenticated(authStatus)
      } catch (error) {
        console.error('App - Auth check error:', error)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // LocalStorage değişikliklerini dinle
    const handleStorageChange = () => {
      console.log('App - Storage change detected')
      checkAuth()
    }

    // Hem storage event'ini hem de custom event'i dinle
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('authChange', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authChange', handleStorageChange)
    }
  }, [])

  console.log('App render - IsAuthenticated:', isAuthenticated, 'Loading:', loading)

  // Loading durumunda basit bir loading göstergesi
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Yükleniyor...
      </div>
    )
  }

      return (
        <ThemeProvider>
          <SearchProvider>
            <Router>
        <Routes>
          <Route path="/" element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Login />} />
          <Route path="/customers" element={isAuthenticated ? <Layout><Customers /></Layout> : <Login />} />
          <Route path="/customers/new" element={isAuthenticated ? <Layout><CustomerForm /></Layout> : <Login />} />
          <Route path="/customers/edit/:id" element={isAuthenticated ? <Layout><CustomerForm /></Layout> : <Login />} />
          <Route path="*" element={<Login />} />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
            />
            <SearchModal />
            </Router>
          </SearchProvider>
        </ThemeProvider>
      )
}

export default App


