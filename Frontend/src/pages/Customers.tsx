import React, { useState, useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { apiRequest } from '../config/api'
import { useTheme } from '../contexts/ThemeContext'
import { useSearch } from '../contexts/SearchContext'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'
import AdvancedFilters from '../components/AdvancedFilters'
import toast from 'react-hot-toast'

interface Customer {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  notes?: string
  isActive: boolean
  createdAt: string
}

interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  status: 'all' | 'active' | 'inactive';
  company: string;
  searchTerm: string;
  sortBy: 'name' | 'email' | 'createdAt' | 'company';
  sortOrder: 'asc' | 'desc';
}

const Customers: React.FC = () => {
  const { theme } = useTheme()
  const { openSearch } = useSearch()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [showThisMonthOnly, setShowThisMonthOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null)
  const [editingNote, setEditingNote] = useState<number | null>(null)
  const [noteText, setNoteText] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState({
    customer: true,
    contact: true,
    status: true,
    date: true,
    notes: true,
    actions: true
  })
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { start: '', end: '' },
    status: 'all',
    company: '',
    searchTerm: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const location = useLocation()

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewCustomer: () => {
      console.log('Customers: New customer shortcut triggered');
      window.location.href = '/customers/new';
    },
    onSearch: () => {
      console.log('Customers: Search shortcut triggered');
      openSearch();
    }
  });

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
      const data = await apiRequest('/Customers')
      console.log('Customer Data:', data)
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Müşteriler yüklenirken hata oluştu!')
    } finally {
      setLoading(false)
    }
  }


  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      await apiRequest(`/Customers/${id}`, {
        method: 'DELETE',
      })
      setCustomers(customers.filter(c => c.id !== id))
      toast.success('Müşteri başarıyla silindi!')
    } catch (error) {
      console.error('Error deleting customer:', error)
      toast.error('Müşteri silinirken hata oluştu!')
    }
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewCustomer: () => {
      window.location.href = '/customers/new';
    },
    onSearch: openSearch
  });

  // Smart search function - more precise matching
  const fuzzySearch = (query: string, text: string): boolean => {
    if (!query) return true
    
    const queryLower = query.toLowerCase().trim()
    const textLower = text.toLowerCase().trim()
    
    // Exact match (highest priority)
    if (textLower.includes(queryLower)) return true
    
    // Word boundary match - query must match at word start
    const words = textLower.split(/\s+/)
    for (const word of words) {
      if (word.startsWith(queryLower)) return true
    }
    
    // Fuzzy match - but only if query is at least 3 characters
    if (queryLower.length >= 3) {
      let queryIndex = 0
      let consecutiveMatches = 0
      let maxConsecutive = 0
      
      for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
        if (textLower[i] === queryLower[queryIndex]) {
          queryIndex++
          consecutiveMatches++
          maxConsecutive = Math.max(maxConsecutive, consecutiveMatches)
        } else {
          consecutiveMatches = 0
        }
      }
      
      // Only return true if we matched all characters AND had at least 2 consecutive matches
      return queryIndex === queryLower.length && maxConsecutive >= 2
    }
    
    return false
  }

  // Advanced filtering with memoization
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // Search term filter
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase()
        const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase()
        
        const matchesSearch = 
          fuzzySearch(searchTerm, fullName) ||
          fuzzySearch(searchTerm, customer.email.toLowerCase()) ||
          (customer.phone && fuzzySearch(searchTerm, customer.phone)) ||
          (customer.company && fuzzySearch(searchTerm, customer.company.toLowerCase()))
        
        if (!matchesSearch) return false
      }

      // Status filter
      if (filters.status !== 'all') {
        if (filters.status === 'active' && !customer.isActive) return false
        if (filters.status === 'inactive' && customer.isActive) return false
      }

      // Company filter
      if (filters.company && customer.company !== filters.company) {
        return false
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const customerDate = new Date(customer.createdAt)
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null

        if (startDate && customerDate < startDate) return false
        if (endDate && customerDate > endDate) return false
      }

      // Legacy filters for backward compatibility
      if (showActiveOnly && !customer.isActive) return false
      if (showThisMonthOnly) {
        const customerDate = new Date(customer.createdAt)
        const currentDate = new Date()
        const isThisMonth = customerDate.getMonth() === currentDate.getMonth() && 
                           customerDate.getFullYear() === currentDate.getFullYear()
        if (!isThisMonth) return false
      }

      return true
    }).sort((a, b) => {
      // Sorting logic
      let aValue: any, bValue: any

      // Use sortConfig if available, otherwise use filters
      const sortKey = sortConfig?.key || filters.sortBy
      const sortDirection = sortConfig?.direction || filters.sortOrder

      switch (sortKey) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase()
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase()
          break
        case 'email':
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case 'company':
          aValue = (a.company || '').toLowerCase()
          bValue = (b.company || '').toLowerCase()
          break
        case 'phone':
          aValue = (a.phone || '').toLowerCase()
          bValue = (b.phone || '').toLowerCase()
          break
        case 'status':
          aValue = a.isActive ? 1 : 0
          bValue = b.isActive ? 1 : 0
          break
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }, [customers, filters, showActiveOnly, showThisMonthOnly])

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, showActiveOnly, showThisMonthOnly])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  // Bulk selection handlers
  const handleSelectCustomer = (customerId: number) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    )
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(paginatedCustomers.map(c => c.id))
    }
    setSelectAll(!selectAll)
  }

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) return
    
    if (!window.confirm(`${selectedCustomers.length} müşteriyi silmek istediğinizden emin misiniz?`)) {
      return
    }

    try {
      // Paralel silme işlemleri
      await Promise.all(
        selectedCustomers.map(id => 
          apiRequest(`/Customers/${id}`, { method: 'DELETE' })
        )
      )
      
      setCustomers(customers.filter(c => !selectedCustomers.includes(c.id)))
      setSelectedCustomers([])
      setSelectAll(false)
      toast.success(`${selectedCustomers.length} müşteri başarıyla silindi!`)
    } catch (error) {
      console.error('Error deleting customers:', error)
      toast.error('Müşteriler silinirken hata oluştu!')
    }
  }


  // Customer modal handlers
  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowCustomerModal(true)
  }

  const handleCloseModal = () => {
    setShowCustomerModal(false)
    setSelectedCustomer(null)
  }

  // Generate search suggestions
  const generateSuggestions = (query: string) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([])
      setShowSuggestions(false)
      return
    }

    const suggestions = new Set<string>()
    
    customers.forEach(customer => {
      // Name suggestions
      const fullName = `${customer.firstName} ${customer.lastName}`
      if (fuzzySearch(query, fullName)) {
        suggestions.add(fullName)
      }
      
      // Email suggestions
      if (fuzzySearch(query, customer.email)) {
        suggestions.add(customer.email)
      }
      
      // Company suggestions
      if (customer.company && fuzzySearch(query, customer.company)) {
        suggestions.add(customer.company)
      }
      
      // Phone suggestions
      if (customer.phone && fuzzySearch(query, customer.phone)) {
        suggestions.add(customer.phone)
      }
    })
    
    setSearchSuggestions(Array.from(suggestions).slice(0, 5))
    setShowSuggestions(true)
  }

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFilters(prev => ({ ...prev, searchTerm: value }))
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }
    
    // Set new timeout for suggestions
    if (value.length >= 2) {
      const timeout = window.setTimeout(() => {
        generateSuggestions(value)
      }, 300) // 300ms debounce
      setSearchTimeout(timeout)
    } else {
      setSearchSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setFilters(prev => ({ ...prev, searchTerm: suggestion }))
    setShowSuggestions(false)
  }

  // Handle search blur
  const handleSearchBlur = () => {
    // Hide suggestions after a short delay
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  // Export functions
  const handleExportAll = () => {
    const csvContent = generateCSV(customers)
    downloadCSV(csvContent, 'tum_musteriler')
  }

  const handleExportFiltered = () => {
    const csvContent = generateCSV(filteredCustomers)
    downloadCSV(csvContent, 'filtrelenmis_musteriler')
  }

  const handleBulkExport = () => {
    const selectedCustomerData = customers.filter(c => selectedCustomers.includes(c.id))
    const csvContent = generateCSV(selectedCustomerData)
    downloadCSV(csvContent, 'secili_musteriler')
  }

  const generateCSV = (customerList: Customer[]) => {
    // UTF-8 BOM for proper Turkish character support
    const BOM = '\uFEFF'
    
    // Headers with proper Turkish characters
    const headers = [
      'Ad',
      'Soyad', 
      'Email',
      'Telefon',
      'Şirket',
      'Notlar',
      'Durum',
      'Oluşturulma Tarihi'
    ]
    
    const csvRows = []
    
    // Add headers (semicolon separated for Turkish Excel)
    csvRows.push(headers.join(';'))
    
    // Add data rows
    customerList.forEach(customer => {
      const row = [
        customer.firstName || '',
        customer.lastName || '',
        customer.email || '',
        customer.phone || '',
        customer.company || '',
        customer.notes || '',
        customer.isActive ? 'Aktif' : 'Pasif',
        new Date(customer.createdAt).toLocaleDateString('tr-TR')
      ]
      
      // Wrap fields containing comma in quotes and join with semicolon
      const escapedRow = row.map(field => {
        const fieldStr = String(field)
        if (fieldStr.includes(',')) {
          return `"${fieldStr}"`
        }
        return fieldStr
      })
      
      csvRows.push(escapedRow.join(';'))
    })
    
    return BOM + csvRows.join('\n')
  }

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('CSV dosyası başarıyla indirildi!')
  }

  // Advanced sorting function
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key, direction })
  }

  // Get sort icon
  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return '↕️'
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  // Note editing handlers
  const handleEditNote = (customerId: number, currentNote: string) => {
    setEditingNote(customerId)
    setNoteText(currentNote || '')
  }

  const handleSaveNote = async (customerId: number) => {
    try {
      await apiRequest(`/Customers/${customerId}`, {
        method: 'PUT',
        body: JSON.stringify({
          id: customerId,
          notes: noteText
        })
      })
      
      // Update local state
      setCustomers(prev => prev.map(c => 
        c.id === customerId ? { ...c, notes: noteText } : c
      ))
      
      setEditingNote(null)
      setNoteText('')
      toast.success('Not başarıyla güncellendi!')
    } catch (error) {
      console.error('Error updating note:', error)
      toast.error('Not güncellenirken hata oluştu!')
    }
  }

  const handleCancelNote = () => {
    setEditingNote(null)
    setNoteText('')
  }

  // Export functions

  // Import functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      parseAndImportCSV(text)
    }
    reader.readAsText(file)
  }

  const parseAndImportCSV = (csvText: string) => {
    const lines = csvText.split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    
    // Expected headers: Ad, Soyad, Email, Telefon, Şirket, Notlar, Durum
    const expectedHeaders = ['Ad', 'Soyad', 'Email', 'Telefon', 'Şirket', 'Notlar', 'Durum']
    
    if (!expectedHeaders.every(header => headers.includes(header))) {
      toast.error('CSV dosyası beklenen format ile uyumlu değil!')
      return
    }

    const customersToImport = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      const values = line.split(',').map(v => v.trim())
      if (values.length < 3) continue // At least name, surname, email
      
      const customer = {
        firstName: values[0] || '',
        lastName: values[1] || '',
        email: values[2] || '',
        phone: values[3] || '',
        company: values[4] || '',
        notes: values[5] || '',
        isActive: values[6]?.toLowerCase() === 'aktif' || true
      }
      
      if (customer.firstName && customer.lastName && customer.email) {
        customersToImport.push(customer)
      }
    }
    
    if (customersToImport.length === 0) {
      toast.error('Geçerli müşteri verisi bulunamadı!')
      return
    }
    
    importCustomers(customersToImport)
  }

  const importCustomers = async (customersToImport: any[]) => {
    try {
      const promises = customersToImport.map(customer => 
        apiRequest('/Customers', {
          method: 'POST',
          body: JSON.stringify(customer)
        })
      )
      
      await Promise.all(promises)
      
      // Refresh customer list
      fetchCustomers()
      
      toast.success(`${customersToImport.length} müşteri başarıyla eklendi!`)
      setShowImportModal(false)
    } catch (error) {
      console.error('Error importing customers:', error)
      toast.error('Müşteriler içe aktarılırken hata oluştu!')
    }
  }

  // Filter handlers
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      status: 'all',
      company: '',
      searchTerm: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  // Pagination Component
  const Pagination = () => {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
      const pages = []
      const maxVisible = 5
      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
      let end = Math.min(totalPages, start + maxVisible - 1)

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '1.5rem',
        borderTop: '1px solid var(--border-primary)',
        backgroundColor: 'var(--bg-tertiary)',
        transition: 'all 0.3s ease'
      }}>
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.5rem',
            height: '2.5rem',
            backgroundColor: currentPage === 1 ? 'transparent' : 'var(--bg-primary)',
            color: currentPage === 1 ? 'var(--text-tertiary)' : 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '6px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '0.875rem'
          }}
        >
          ←
        </button>

        {getPageNumbers().map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2.5rem',
              height: '2.5rem',
              backgroundColor: currentPage === page ? 'var(--text-primary)' : 'var(--bg-primary)',
              color: currentPage === page ? 'var(--bg-primary)' : 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '0.875rem',
              fontWeight: currentPage === page ? '600' : '400'
            }}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.5rem',
            height: '2.5rem',
            backgroundColor: currentPage === totalPages ? 'transparent' : 'var(--bg-primary)',
            color: currentPage === totalPages ? 'var(--text-tertiary)' : 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '6px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '0.875rem'
          }}
        >
          →
        </button>

        <div style={{
          marginLeft: '1rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          transition: 'color 0.3s ease'
        }}>
          {startIndex + 1}-{Math.min(endIndex, filteredCustomers.length)} / {filteredCustomers.length}
        </div>
      </div>
    )
  }

  // Skeleton Loading Component
  const CustomerSkeleton = () => (
    <tr style={{ 
      borderBottom: '1px solid var(--border-primary)',
      transition: 'all 0.2s ease'
    }}>
      <td style={{ padding: '1rem 1.5rem', width: '50px' }}>
        <div style={{ 
          width: '16px',
          height: '16px',
          backgroundColor: 'var(--text-tertiary)',
          borderRadius: '3px',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}></div>
      </td>
      <td style={{ padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '8px',
            marginRight: '0.75rem',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            transition: 'background-color 0.3s ease'
          }}></div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              height: '0.875rem',
              backgroundColor: 'var(--text-tertiary)',
              borderRadius: '4px',
              marginBottom: '0.25rem',
              width: '60%',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}></div>
            <div style={{ 
              height: '0.75rem',
              backgroundColor: 'var(--text-tertiary)',
              borderRadius: '4px',
              width: '40%',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}></div>
          </div>
        </div>
      </td>
      <td style={{ padding: '1rem 1.5rem' }}>
        <div style={{ 
          height: '0.875rem',
          backgroundColor: 'var(--text-tertiary)',
          borderRadius: '4px',
          marginBottom: '0.25rem',
          width: '80%',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}></div>
        <div style={{ 
          height: '0.75rem',
          backgroundColor: 'var(--text-tertiary)',
          borderRadius: '4px',
          width: '60%',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}></div>
      </td>
      <td style={{ padding: '1rem 1.5rem' }}>
        <div style={{ 
          height: '1.5rem',
          backgroundColor: 'var(--text-tertiary)',
          borderRadius: '6px',
          width: '4rem',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}></div>
      </td>
      <td style={{ padding: '1rem 1.5rem', maxWidth: '200px' }}>
        <div style={{ 
          height: '0.75rem',
          backgroundColor: 'var(--text-tertiary)',
          borderRadius: '4px',
          width: '80%',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}></div>
      </td>
      <td style={{ padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div style={{ 
            width: '2rem',
            height: '2rem',
            backgroundColor: 'var(--text-tertiary)',
            borderRadius: '6px',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}></div>
          <div style={{ 
            width: '2rem',
            height: '2rem',
            backgroundColor: 'var(--text-tertiary)',
            borderRadius: '6px',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}></div>
        </div>
      </td>
    </tr>
  )

  return (
    <div style={{ 
      backgroundColor: 'var(--bg-secondary)',
      minHeight: '100vh',
      padding: '2rem 1rem',
      transition: 'background-color 0.3s ease'
    }}>
      <div style={{ 
        maxWidth: '64rem', 
        margin: '0 auto'
      }}>
        {/* Bulk Actions Bar */}
        {selectedCustomers.length > 0 && (
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '8px',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: `0 1px 3px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                transition: 'color 0.3s ease'
              }}>
                {selectedCustomers.length} müşteri seçildi
              </span>
              <button
                onClick={() => {
                  setSelectedCustomers([])
                  setSelectAll(false)
                }}
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  transition: 'color 0.3s ease'
                }}
              >
                Seçimi temizle
              </button>
            </div>
            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              <button
                onClick={handleBulkExport}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-primary)'
                }}
              >
                📊 CSV İndir
              </button>
              <button
                onClick={handleBulkDelete}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fee2e2'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fef2f2'
                }}
              >
                🗑️ Toplu Sil
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          padding: '0 0 1rem 0'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '1.875rem', 
              fontWeight: '700', 
              color: 'var(--text-primary)',
              margin: '0 0 0.5rem 0',
              letterSpacing: '-0.02em',
              transition: 'color 0.3s ease'
            }}>
              {showActiveOnly ? 'Aktif Müşteriler' : showThisMonthOnly ? 'Bu Ay Eklenen Müşteriler' : 'Müşteriler'}
            </h1>
            <p style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              fontWeight: '400',
              margin: '0',
              transition: 'color 0.3s ease'
            }}>
              {showActiveOnly ? 'Sadece aktif müşterileri görüntülüyorsunuz' : 
               showThisMonthOnly ? 'Bu ay eklenen müşterileri görüntülüyorsunuz' : 
               'Müşteri bilgilerinizi yönetin'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* View Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem' }}>
              {/* View Toggle */}
              <div style={{ 
                display: 'flex', 
                backgroundColor: 'var(--bg-tertiary)', 
                borderRadius: '8px',
                padding: '2px',
                border: '1px solid var(--border-primary)'
              }}>
                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: viewMode === 'table' ? 'var(--text-primary)' : 'transparent',
                    color: viewMode === 'table' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  📊 Tablo
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: viewMode === 'card' ? 'var(--text-primary)' : 'transparent',
                    color: viewMode === 'card' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  🎴 Kart
                </button>
              </div>
              
              {/* Column Visibility Toggle */}
              <button
                onClick={() => setShowColumnSettings(!showColumnSettings)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: showColumnSettings ? 'var(--text-primary)' : 'var(--bg-tertiary)',
                  color: showColumnSettings ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                onMouseEnter={(e) => {
                  if (!showColumnSettings) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-primary)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showColumnSettings) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                👁️ Kolonlar
              </button>
            </div>
            
            <button
              onClick={handleExportAll}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
              }}
            >
              📊 Tümünü İndir
            </button>
            <button
              onClick={handleExportFiltered}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
              }}
            >
              📋 Filtrelenmiş İndir
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
              }}
            >
              📥 CSV İçe Aktar
            </button>
            <Link
              to="/customers/new"
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.75rem 1.5rem',
                backgroundColor: theme === 'dark' ? '#f9fafb' : '#1f2937',
                color: theme === 'dark' ? '#1f2937' : '#ffffff',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                fontSize: '0.875rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? '#e5e7eb' : '#374151';
              }}
              onMouseLeave={(e) => {
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
              Yeni Müşteri
            </Link>
          </div>
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          totalCount={customers.length}
          filteredCount={filteredCustomers.length}
          customers={customers}
          searchSuggestions={searchSuggestions}
          showSuggestions={showSuggestions}
          onSearchChange={handleSearchChange}
          onSuggestionClick={handleSuggestionClick}
          onSearchBlur={handleSearchBlur}
        />


        {/* Customers Table */}
        <div style={{ 
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '12px',
          boxShadow: `0 1px 3px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`,
          border: '1px solid var(--border-primary)',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}>
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              fontSize: '1.125rem',
              color: 'var(--text-secondary)',
              transition: 'color 0.3s ease'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid var(--border-primary)',
                borderTop: '4px solid var(--text-primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem auto',
                transition: 'border-color 0.3s ease'
              }}></div>
              <div style={{ 
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.5rem',
                transition: 'color 0.3s ease'
              }}>
                Müşteriler yükleniyor...
              </div>
              <div style={{ 
                fontSize: '0.875rem',
                color: 'var(--text-tertiary)',
                transition: 'color 0.3s ease'
              }}>
                Lütfen bekleyin
              </div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              color: 'var(--text-secondary)',
              fontSize: '1.125rem',
              transition: 'color 0.3s ease'
            }}>
              {filters.searchTerm ? 'Arama kriterlerine uygun müşteri bulunamadı.' : 'Henüz müşteri eklenmemiş.'}
            </div>
          ) : viewMode === 'table' ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead style={{ 
                  backgroundColor: 'var(--bg-tertiary)',
                  borderBottom: '1px solid var(--border-primary)',
                  transition: 'all 0.3s ease'
                }}>
                  <tr>
                    <th style={{ 
                      padding: '1rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      transition: 'color 0.3s ease',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      width: '50px'
                    }}>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer'
                        }}
                      />
                    </th>
                    {visibleColumns.customer && (
                      <th 
                        style={{ 
                          padding: '1rem 1.5rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: 'var(--text-secondary)',
                          transition: 'color 0.3s ease',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('name')}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--text-primary)'
                          e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-secondary)'
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          Müşteri
                          <span style={{ fontSize: '0.875rem' }}>{getSortIcon('name')}</span>
                        </div>
                      </th>
                    )}
                    {visibleColumns.contact && (
                      <th 
                        style={{ 
                          padding: '1rem 1.5rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: 'var(--text-secondary)',
                          transition: 'color 0.3s ease',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                        onClick={() => handleSort('email')}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--text-primary)'
                          e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-secondary)'
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          İletişim
                          <span style={{ fontSize: '0.875rem' }}>{getSortIcon('email')}</span>
                        </div>
                      </th>
                    )}
                    <th style={{ 
                      padding: '1rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      transition: 'color 0.3s ease',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Durum
                    </th>
                    <th 
                      style={{ 
                        padding: '1rem 1.5rem',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        transition: 'color 0.3s ease',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                      onClick={() => handleSort('createdAt')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--text-primary)'
                        e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-secondary)'
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Tarih
                        <span style={{ fontSize: '0.875rem' }}>{getSortIcon('createdAt')}</span>
                      </div>
                    </th>
                    <th style={{ 
                      padding: '1rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      transition: 'color 0.3s ease',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Notlar
                    </th>
                    <th style={{ 
                      padding: '1rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      transition: 'color 0.3s ease',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <>
                      <CustomerSkeleton />
                      <CustomerSkeleton />
                      <CustomerSkeleton />
                      <CustomerSkeleton />
                      <CustomerSkeleton />
                    </>
                  ) : (
                    paginatedCustomers.map((customer) => (
                    <tr key={customer.id} style={{ 
                      borderBottom: '1px solid var(--border-primary)',
                      transition: 'all 0.2s ease',
                      backgroundColor: selectedCustomers.includes(customer.id) ? 'var(--bg-tertiary)' : 'transparent',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedCustomers.includes(customer.id)) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedCustomers.includes(customer.id)) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    onClick={() => handleCustomerClick(customer)}>
                      <td style={{ padding: '1rem 1.5rem', width: '50px' }}>
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleSelectCustomer(customer.id)
                          }}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer'
                          }}
                        />
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            backgroundColor: 'var(--bg-tertiary)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '0.75rem',
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
                          <div>
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
                              transition: 'color 0.3s ease'
                            }}>
                              {customer.company || 'Şirket belirtilmemiş'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ 
                          fontSize: '0.875rem',
                          color: 'var(--text-primary)',
                          marginBottom: '0.25rem',
                          fontWeight: '500',
                          transition: 'color 0.3s ease'
                        }}>
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div style={{ 
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            transition: 'color 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <span>📞</span>
                            {customer.phone}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          borderRadius: '6px',
                          backgroundColor: customer.isActive ? '#f0fdf4' : '#fef2f2',
                          color: customer.isActive ? '#166534' : '#991b1b',
                          gap: '0.25rem'
                        }}>
                          <div style={{
                            width: '4px',
                            height: '4px',
                            backgroundColor: customer.isActive ? '#16a34a' : '#dc2626',
                            borderRadius: '50%'
                          }}></div>
                          {customer.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ 
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          transition: 'color 0.3s ease'
                        }}>
                          {new Date(customer.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', maxWidth: '200px' }}>
                        {editingNote === customer.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Not ekle..."
                              style={{
                                width: '100%',
                                minHeight: '60px',
                                padding: '0.5rem',
                                border: '1px solid var(--border-primary)',
                                borderRadius: '4px',
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                fontSize: '0.75rem',
                                resize: 'vertical',
                                transition: 'all 0.2s ease'
                              }}
                            />
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button
                                onClick={() => handleSaveNote(customer.id)}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  backgroundColor: 'var(--text-primary)',
                                  color: 'var(--bg-primary)',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                ✓
                              </button>
                              <button
                                onClick={handleCancelNote}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  backgroundColor: 'var(--bg-tertiary)',
                                  color: 'var(--text-secondary)',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                              fontSize: '0.75rem',
                              color: 'var(--text-secondary)',
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              transition: 'color 0.3s ease'
                            }}>
                              {customer.notes || 'Not yok'}
                            </span>
                            <button
                              onClick={() => handleEditNote(customer.id, customer.notes || '')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '1.5rem',
                                height: '1.5rem',
                                backgroundColor: 'var(--bg-tertiary)',
                                color: 'var(--text-secondary)',
                                border: 'none',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-primary)'
                                e.currentTarget.style.color = 'var(--text-primary)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                                e.currentTarget.style.color = 'var(--text-secondary)'
                              }}
                            >
                              📝
                            </button>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link
                            to={`/customers/edit/${customer.id}`}
                            style={{ 
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '2rem',
                              height: '2rem',
                              backgroundColor: 'var(--bg-tertiary)',
                              color: 'var(--text-secondary)',
                              textDecoration: 'none',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                              e.currentTarget.style.color = 'var(--text-primary)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                              e.currentTarget.style.color = 'var(--text-secondary)';
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
                              width: '2rem',
                              height: '2rem',
                              backgroundColor: '#fef2f2',
                              color: '#dc2626',
                              border: 'none',
                              cursor: 'pointer',
                              borderRadius: '6px',
                              fontSize: '0.875rem',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fee2e2';
                              e.currentTarget.style.color = '#b91c1c';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#fef2f2';
                              e.currentTarget.style.color = '#dc2626';
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Card View */
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
              gap: '1.5rem',
              padding: '1rem 0'
            }}>
              {paginatedCustomers.map((customer) => (
                <div
                  key={customer.id}
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--text-primary)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-primary)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  onClick={() => handleCustomerClick(customer)}
                >
                  {/* Customer Header */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{
                      width: '3rem',
                      height: '3rem',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1rem',
                      transition: 'background-color 0.3s ease'
                    }}>
                      <span style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        transition: 'color 0.3s ease'
                      }}>
                        {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        margin: '0 0 0.25rem 0',
                        transition: 'color 0.3s ease'
                      }}>
                        {customer.firstName} {customer.lastName}
                      </h3>
                      <p style={{ 
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        margin: '0',
                        transition: 'color 0.3s ease'
                      }}>
                        {customer.company || 'Şirket belirtilmemiş'}
                      </p>
                    </div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      borderRadius: '6px',
                      backgroundColor: customer.isActive ? '#f0fdf4' : '#fef2f2',
                      color: customer.isActive ? '#166534' : '#991b1b',
                      gap: '0.25rem'
                    }}>
                      <div style={{
                        width: '4px',
                        height: '4px',
                        backgroundColor: customer.isActive ? '#16a34a' : '#dc2626',
                        borderRadius: '50%'
                      }}></div>
                      {customer.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ 
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem',
                      fontWeight: '500',
                      transition: 'color 0.3s ease'
                    }}>
                      {customer.email}
                    </div>
                    {customer.phone && (
                      <div style={{ 
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'color 0.3s ease'
                      }}>
                        <span>📞</span>
                        {customer.phone}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {customer.notes && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ 
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        backgroundColor: 'var(--bg-tertiary)',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                        maxHeight: '60px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {customer.notes}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-primary)'
                  }}>
                    <span style={{ 
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                      transition: 'color 0.3s ease'
                    }}>
                      {new Date(customer.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link
                        to={`/customers/edit/${customer.id}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '2rem',
                          height: '2rem',
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                      >
                        ✏️
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(customer.id)
                        }}
                        style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '2rem',
                          height: '2rem',
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fee2e2';
                          e.currentTarget.style.color = '#b91c1c';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.color = '#dc2626';
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {!loading && filteredCustomers.length > 0 && <Pagination />}
        </div>
      </div>

      {/* Column Settings Modal */}
      {showColumnSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={() => setShowColumnSettings(false)}
        >
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid var(--border-primary)',
            transition: 'all 0.3s ease'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                margin: '0 0 0.5rem 0',
                transition: 'color 0.3s ease'
              }}>
                Kolon Ayarları
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                margin: '0',
                transition: 'color 0.3s ease'
              }}>
                Hangi kolonların görünür olacağını seçin
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { key: 'customer', label: 'Müşteri', description: 'Ad, soyad ve şirket bilgileri' },
                { key: 'contact', label: 'İletişim', description: 'Email ve telefon bilgileri' },
                { key: 'status', label: 'Durum', description: 'Aktif/Pasif durumu' },
                { key: 'date', label: 'Tarih', description: 'Kayıt tarihi' },
                { key: 'notes', label: 'Notlar', description: 'Müşteri notları' },
                { key: 'actions', label: 'İşlemler', description: 'Düzenle ve sil butonları' }
              ].map((column) => (
                <div key={column.key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-primary)',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      marginBottom: '0.25rem',
                      transition: 'color 0.3s ease'
                    }}>
                      {column.label}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      transition: 'color 0.3s ease'
                    }}>
                      {column.description}
                    </div>
                  </div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    position: 'relative'
                  }}>
                    <input
                      type="checkbox"
                      checked={visibleColumns[column.key as keyof typeof visibleColumns]}
                      onChange={(e) => {
                        setVisibleColumns(prev => ({
                          ...prev,
                          [column.key]: e.target.checked
                        }))
                      }}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: 'var(--text-primary)'
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setVisibleColumns({
                    customer: true,
                    contact: true,
                    status: true,
                    date: true,
                    notes: true,
                    actions: true
                  })
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-primary)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
              >
                Tümünü Seç
              </button>
              <button
                onClick={() => setShowColumnSettings(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'var(--text-primary)',
                  color: 'var(--bg-primary)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--text-secondary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--text-primary)'
                }}
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {showCustomerModal && selectedCustomer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}
        onClick={handleCloseModal}>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid var(--border-primary)',
            transition: 'all 0.3s ease'
          }}
          onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-primary)'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: 0,
                transition: 'color 0.3s ease'
              }}>
                Müşteri Detayları
              </h2>
              <button
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: '0.25rem',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ marginBottom: '1.5rem' }}>
              {/* Avatar and Name */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  width: '4rem',
                  height: '4rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '1rem',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s ease'
                }}>
                  {selectedCustomer.firstName.charAt(0)}{selectedCustomer.lastName.charAt(0)}
                </div>
                <div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    margin: '0 0 0.25rem 0',
                    transition: 'color 0.3s ease'
                  }}>
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    transition: 'color 0.3s ease'
                  }}>
                    {selectedCustomer.company || 'Şirket belirtilmemiş'}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  margin: '0 0 1rem 0',
                  transition: 'color 0.3s ease'
                }}>
                  İletişim Bilgileri
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>📧</span>
                    <span style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      transition: 'color 0.3s ease'
                    }}>
                      {selectedCustomer.email}
                    </span>
                  </div>
                  {selectedCustomer.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>📞</span>
                      <span style={{
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                        transition: 'color 0.3s ease'
                      }}>
                        {selectedCustomer.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  margin: '0 0 1rem 0',
                  transition: 'color 0.3s ease'
                }}>
                  Ek Bilgiler
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>📅</span>
                    <span style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      transition: 'color 0.3s ease'
                    }}>
                      Kayıt Tarihi: {new Date(selectedCustomer.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🏢</span>
                    <span style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      transition: 'color 0.3s ease'
                    }}>
                      Durum: {selectedCustomer.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedCustomer.notes && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    margin: '0 0 1rem 0',
                    transition: 'color 0.3s ease'
                  }}>
                    Notlar
                  </h4>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '6px',
                    border: '1px solid var(--border-primary)',
                    transition: 'all 0.3s ease'
                  }}>
                    {selectedCustomer.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-primary)'
            }}>
              <button
                onClick={handleCloseModal}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                }}
              >
                Kapat
              </button>
              <Link
                to={`/customers/edit/${selectedCustomer.id}`}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--text-primary)',
                  color: 'var(--bg-primary)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--text-secondary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--text-primary)'
                }}
              >
                ✏️ Düzenle
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}
        onClick={() => setShowImportModal(false)}>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid var(--border-primary)',
            transition: 'all 0.3s ease'
          }}
          onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid var(--border-primary)'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: 0,
                transition: 'color 0.3s ease'
              }}>
                CSV İçe Aktar
              </h2>
              <button
                onClick={() => setShowImportModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: '0.25rem',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  margin: '0 0 0.5rem 0',
                  transition: 'color 0.3s ease'
                }}>
                  CSV Formatı
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  margin: '0 0 0.5rem 0',
                  transition: 'color 0.3s ease'
                }}>
                  CSV dosyanız şu sütunları içermelidir:
                </p>
                <code style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  display: 'block',
                  transition: 'all 0.3s ease'
                }}>
                  Ad, Soyad, Email, Telefon, Şirket, Notlar, Durum
                </code>
              </div>

              <div style={{
                border: '2px dashed var(--border-primary)',
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📁</div>
                <p style={{
                  fontSize: '1rem',
                  color: 'var(--text-primary)',
                  margin: '0 0 1rem 0',
                  transition: 'color 0.3s ease'
                }}>
                  CSV dosyanızı seçin
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  style={{
                    display: 'none'
                  }}
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--text-primary)',
                    color: 'var(--bg-primary)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--text-secondary)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--text-primary)'
                  }}
                >
                  📥 Dosya Seç
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-primary)'
            }}>
              <button
                onClick={() => setShowImportModal(false)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                }}
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
      
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