import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();

  // Keyboard shortcuts for modal
  useKeyboardShortcuts({
    onEscape: onClose,
    onSearch: () => {
      onClose(); // Modal'ı kapat
      // SearchContext'teki openSearch'ü çağır
      const event = new CustomEvent('openSearch');
      window.dispatchEvent(event);
    },
    onNewCustomer: () => {
      onClose(); // Modal'ı kapat
      // Kısa bir gecikme ile sayfaya git
      setTimeout(() => {
        window.location.href = '/customers/new';
      }, 100);
    }
  });

  // Additional keyboard shortcuts for modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '1') {
        e.preventDefault();
        console.log('KeyboardShortcutsHelp: Ctrl+1 pressed - Dashboard');
        onClose(); // Modal'ı kapat
        // Kısa bir gecikme ile dashboard'a git
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      }
      if (e.ctrlKey && e.key === '2') {
        e.preventDefault();
        console.log('KeyboardShortcutsHelp: Ctrl+2 pressed - Customers');
        onClose(); // Modal'ı kapat
        // Kısa bir gecikme ile müşteriler sayfasına git
        setTimeout(() => {
          window.location.href = '/customers';
        }, 100);
      }
      if (e.ctrlKey && e.key === '3') {
        e.preventDefault();
        console.log('KeyboardShortcutsHelp: Ctrl+3 pressed - New Customer');
        onClose(); // Modal'ı kapat
        // Kısa bir gecikme ile yeni müşteri sayfasına git
        setTimeout(() => {
          window.location.href = '/customers/new';
        }, 100);
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl+K', description: 'Arama aç/kapat' },
    { key: 'Ctrl+N', description: 'Yeni müşteri ekle' },
    { key: 'Ctrl+S', description: 'Formu kaydet' },
    { key: 'Ctrl+Enter', description: 'Formu gönder' },
    { key: 'Escape', description: 'Modal kapat/İptal' },
    { key: 'Ctrl+1', description: 'Dashboard\'a git' },
    { key: 'Ctrl+2', description: 'Müşteriler sayfasına git' },
    { key: 'Ctrl+3', description: 'Yeni müşteri sayfasına git' }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '12px',
          boxShadow: `0 20px 25px -5px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'}, 0 10px 10px -5px ${theme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.04)'}`,
          border: '1px solid var(--border-primary)',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-tertiary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            ⌨️ Klavye Kısayolları
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '0.25rem',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '1.5rem',
          maxHeight: '60vh',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-primary)',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                  fontWeight: '500'
                }}>
                  {shortcut.description}
                </span>
                <kbd style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  color: 'var(--text-primary)',
                  fontWeight: '600'
                }}>
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-primary)',
          backgroundColor: 'var(--bg-tertiary)',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
            margin: 0
          }}>
            💡 İpucu: Bu kısayollar tüm sayfalarda çalışır
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;


