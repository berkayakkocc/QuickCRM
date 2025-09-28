import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../contexts/SearchContext';
import { useTheme } from '../contexts/ThemeContext';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

const SearchModal: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const {
    isSearchOpen,
    searchQuery,
    searchResults,
    isLoading,
    closeSearch,
    setSearchQuery,
    clearSearch
  } = useSearch();

  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts for search modal
  useKeyboardShortcuts({
    onEscape: closeSearch,
    onNewCustomer: () => {
      closeSearch();
      navigate('/customers/new');
    }
  });

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleResultClick = (url: string) => {
    navigate(url);
    closeSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeSearch();
    }
  };

  if (!isSearchOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh'
      }}
      onClick={closeSearch}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '12px',
          boxShadow: `0 20px 25px -5px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'}, 0 10px 10px -5px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.04)'}`,
          border: '1px solid var(--border-primary)',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-tertiary)'
        }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{
              position: 'absolute',
              left: '1rem',
              color: 'var(--text-secondary)',
              fontSize: '1.125rem'
            }}>
              🔍
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Müşteri ara... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                fontSize: '1rem',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme === 'dark' ? '#60a5fa' : '#3b82f6';
                e.target.style.boxShadow = `0 0 0 3px ${theme === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)'}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-primary)';
                e.target.style.boxShadow = 'none';
              }}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  padding: '0.25rem',
                  borderRadius: '4px',
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
                ×
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        <div style={{
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {isLoading ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: `3px solid var(--text-tertiary)`,
                borderTop: `3px solid var(--text-primary)`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem auto'
              }}></div>
              Arama yapılıyor...
            </div>
          ) : searchResults.length > 0 ? (
            <div>
              {searchResults.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result.url)}
                  style={{
                    padding: '1rem 1.5rem',
                    borderBottom: index < searchResults.length - 1 ? '1px solid var(--border-primary)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{
                    fontSize: '1.5rem',
                    width: '2rem',
                    textAlign: 'center'
                  }}>
                    {result.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '0.25rem'
                    }}>
                      {result.title}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {result.subtitle}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-tertiary)',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    fontWeight: '500'
                  }}>
                    {result.type}
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>
                🔍
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>
                Sonuç bulunamadı
              </div>
              <div style={{
                fontSize: '0.875rem'
              }}>
                "{searchQuery}" için arama sonucu bulunamadı
              </div>
            </div>
          ) : (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>
                🔍
              </div>
              <div style={{
                fontSize: '1rem',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>
                Müşteri ara
              </div>
              <div style={{
                fontSize: '0.875rem'
              }}>
                Ad, soyad, email veya şirket adı ile arama yapın
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-tertiary)',
          fontSize: '0.75rem',
          color: 'var(--text-tertiary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <kbd style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontFamily: 'monospace'
            }}>
              Ctrl+K
            </kbd>
            <span style={{ marginLeft: '0.5rem' }}>Arama aç</span>
          </div>
          <div>
            <kbd style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontFamily: 'monospace'
            }}>
              Esc
            </kbd>
            <span style={{ marginLeft: '0.5rem' }}>Kapat</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;


