import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface FilterOptions {
  dateRange: { start: string; end: string; };
  status: 'all' | 'active' | 'inactive';
  company: string;
  searchTerm: string;
  sortBy: 'name' | 'email' | 'createdAt' | 'company';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
  customers: Array<{ company?: string }>;
  searchSuggestions?: string[];
  showSuggestions?: boolean;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSuggestionClick?: (suggestion: string) => void;
  onSearchBlur?: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  onFiltersChange,
  onClearFilters,
  totalCount,
  filteredCount,
  customers,
  searchSuggestions = [],
  showSuggestions = false,
  onSearchChange,
  onSuggestionClick,
  onSearchBlur
}) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { start: '', end: '' },
    status: 'all',
    company: '',
    searchTerm: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [companies, setCompanies] = useState<string[]>([]);

  useEffect(() => {
    const uniqueCompanies = Array.from(
      new Set(
        customers
          .map(customer => customer.company)
          .filter((company): company is string => company !== undefined && company.trim() !== '')
      )
    ).sort();
    
    setCompanies(uniqueCompanies);
  }, [customers]);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const newDateRange = { ...filters.dateRange, [field]: value };
    const newFilters = { ...filters, dateRange: newDateRange };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterOptions = {
      dateRange: { start: '', end: '' },
      status: 'all',
      company: '',
      searchTerm: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    onClearFilters();
  };

  const getFilterCount = () => {
    let count = 0;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.status !== 'all') count++;
    if (filters.company) count++;
    if (filters.searchTerm) count++;
    return count;
  };

  const filterCount = getFilterCount();

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      borderRadius: '12px',
      boxShadow: `0 1px 3px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)'}`,
      border: '1px solid var(--border-primary)',
      marginBottom: '1.5rem',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid var(--border-primary)',
        backgroundColor: 'var(--bg-tertiary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onClick={() => setIsExpanded(!isExpanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🔍</span>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: 0,
            transition: 'color 0.3s ease'
          }}>
            Gelişmiş Filtreler
          </h3>
          {filterCount > 0 && (
            <span style={{
              backgroundColor: theme === 'dark' ? '#f9fafb' : '#1f2937',
              color: theme === 'dark' ? '#1f2937' : '#ffffff',
              fontSize: '0.75rem',
              fontWeight: '600',
              padding: '0.25rem 0.5rem',
              borderRadius: '9999px',
              minWidth: '1.25rem',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}>
              {filterCount}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            transition: 'color 0.3s ease'
          }}>
            {filteredCount} / {totalCount} müşteri
          </span>
          <span style={{
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}>
            ▼
          </span>
        </div>
      </div>

      {isExpanded && (
        <div style={{ padding: '1.5rem', animation: 'slideIn 0.3s ease-out' }}>
          <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
              transition: 'color 0.3s ease'
            }}>
              Akıllı Arama
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Ad, soyad, email veya şirket ara... (fuzzy search)"
                value={filters.searchTerm}
                onChange={(e) => {
                  // Update local state immediately for visual feedback
                  setFilters(prev => ({ ...prev, searchTerm: e.target.value }))
                  
                  if (onSearchChange) {
                    onSearchChange(e)
                  } else {
                    handleFilterChange('searchTerm', e.target.value)
                  }
                }}
                onFocus={() => {
                  if (filters.searchTerm.length >= 2) {
                    // Trigger suggestions if there's already text
                    if (onSearchChange) {
                      const event = { target: { value: filters.searchTerm } } as React.ChangeEvent<HTMLInputElement>
                      onSearchChange(event)
                    }
                  }
                }}
                onBlur={onSearchBlur}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease'
                }}
              />
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-primary)',
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  boxShadow: `0 4px 6px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)'}`,
                  zIndex: 1000,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => onSuggestionClick?.(suggestion)}
                      style={{
                        padding: '0.75rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid var(--border-primary)',
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                        transition: 'background-color 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <span style={{ fontSize: '1rem' }}>🔍</span>
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
              transition: 'color 0.3s ease'
            }}>
              Tarih Aralığı
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease'
                  }}
                />
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-tertiary)',
                  marginTop: '0.25rem',
                  display: 'block'
                }}>
                  Başlangıç
                </span>
              </div>
              <div>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease'
                  }}
                />
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-tertiary)',
                  marginTop: '0.25rem',
                  display: 'block'
                }}>
                  Bitiş
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
                transition: 'color 0.3s ease'
              }}>
                Durum
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <option value="all">Tümü</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
                transition: 'color 0.3s ease'
              }}>
                Şirket ({companies.length})
              </label>
              <select
                value={filters.company}
                onChange={(e) => handleFilterChange('company', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <option value="">Tüm Şirketler</option>
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--text-primary)',
              marginBottom: '0.5rem',
              transition: 'color 0.3s ease'
            }}>
              Sıralama
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <option value="name">Ad</option>
                <option value="email">Email</option>
                <option value="createdAt">Tarih</option>
                <option value="company">Şirket</option>
              </select>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <option value="asc">Artan</option>
                <option value="desc">Azalan</option>
              </select>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-primary)'
          }}>
            <button
              onClick={handleClearFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🗑️</span>
              Filtreleri Temizle
            </button>

            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-tertiary)',
              transition: 'color 0.3s ease'
            }}>
              {filterCount > 0 ? `${filterCount} filtre aktif` : 'Filtre yok'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;