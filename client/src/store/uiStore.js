import { create } from 'zustand';

const useUIStore = create((set) => ({
  // Search
  isSearchOpen:    false,
  openSearch:      () => set({ isSearchOpen: true }),
  closeSearch:     () => set({ isSearchOpen: false }),

  // Mobile menu
  isMobileMenuOpen:  false,
  openMobileMenu:    () => set({ isMobileMenuOpen: true }),
  closeMobileMenu:   () => set({ isMobileMenuOpen: false }),

  // Page loader
  isPageLoading:   false,
  setPageLoading:  (val) => set({ isPageLoading: val }),
}));

export default useUIStore;