import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '../config/api';

interface SearchResult {
  id: number;
  type: 'customer';
  title: string;
  subtitle: string;
  url: string;
  icon: string;
}

interface SearchContextType {
  isSearchOpen: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
  isLoading: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Search function
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const customers = await apiRequest('/Customers');
      
      const results: SearchResult[] = customers
        .filter((customer: any) => 
          customer.firstName?.toLowerCase().includes(query.toLowerCase()) ||
          customer.lastName?.toLowerCase().includes(query.toLowerCase()) ||
          customer.email?.toLowerCase().includes(query.toLowerCase()) ||
          customer.company?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8) // Limit to 8 results
        .map((customer: any) => ({
          id: customer.id,
          type: 'customer' as const,
          title: `${customer.firstName} ${customer.lastName}`,
          subtitle: customer.email,
          url: `/customers/edit/${customer.id}`,
          icon: '👤'
        }));

      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Search-specific keyboard shortcuts (only Escape when search is open)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        closeSearch();
      }
    };

    if (isSearchOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSearchOpen]); // Removed closeSearch from dependencies

  return (
    <SearchContext.Provider value={{
      isSearchOpen,
      searchQuery,
      searchResults,
      isLoading,
      openSearch,
      closeSearch,
      setSearchQuery,
      clearSearch
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};


