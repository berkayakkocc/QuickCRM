import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcutsOptions {
  onNewCustomer?: () => void;
  onSave?: () => void;
  onSearch?: () => void;
  onEscape?: () => void;
}

export const useKeyboardShortcuts = (options: KeyboardShortcutsOptions = {}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('Key pressed:', e.key, 'Ctrl:', e.ctrlKey, 'Code:', e.code);
      
      // Sadece input, textarea veya contenteditable elementlerde değilse çalış
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || 
                     target.tagName === 'TEXTAREA' || 
                     target.contentEditable === 'true';

      if (isInput) {
        console.log('Ignoring key in input field');
        return;
      }

      // Ctrl+N - Yeni Müşteri
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        e.stopPropagation();
        console.log('Ctrl+N pressed - New Customer');
        if (options.onNewCustomer) {
          options.onNewCustomer();
        } else {
          navigate('/customers/new');
        }
      }

      // Ctrl+S - Kaydet
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        e.stopPropagation();
        console.log('Ctrl+S pressed - Save');
        if (options.onSave) {
          options.onSave();
        }
      }

      // Ctrl+K - Arama
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        e.stopPropagation();
        console.log('Ctrl+K pressed - Search');
        if (options.onSearch) {
          options.onSearch();
        }
      }

      // Ctrl+1 - Dashboard
      if (e.ctrlKey && e.key === '1') {
        e.preventDefault();
        e.stopPropagation();
        console.log('Ctrl+1 pressed - Dashboard');
        navigate('/dashboard');
      }

      // Ctrl+2 - Müşteriler
      if (e.ctrlKey && e.key === '2') {
        e.preventDefault();
        e.stopPropagation();
        console.log('Ctrl+2 pressed - Customers');
        navigate('/customers');
      }

      // Ctrl+3 - Yeni Müşteri
      if (e.ctrlKey && e.key === '3') {
        e.preventDefault();
        e.stopPropagation();
        console.log('Ctrl+3 pressed - New Customer');
        navigate('/customers/new');
      }

      // Escape - Kapat/İptal
      if (e.key === 'Escape') {
        console.log('Escape pressed');
        if (options.onEscape) {
          options.onEscape();
        }
      }

      // Ctrl+Enter - Form gönder
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        console.log('Ctrl+Enter pressed - Submit form');
        const form = document.querySelector('form');
        if (form) {
          const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (submitButton && !submitButton.disabled) {
            submitButton.click();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true); // Use capture phase
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [navigate, options]);
};

export default useKeyboardShortcuts;


