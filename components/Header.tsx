import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Sun, Moon, Zap, Menu, X, ShieldCheck, Star, User as UserIcon } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-500 text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;
    
  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-base font-medium ${
      isActive
        ? 'bg-primary-500 text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;
    
  const handleLogoutClick = () => {
    setIsMobileMenuOpen(false);
    setIsLogoutModalOpen(true);
  }
  
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4 md:space-x-8">
              <NavLink to={user?.role === 'admin' ? '/admin' : '/'} className="flex items-center space-x-2 text-xl font-bold text-primary-600 dark:text-primary-400">
                <Zap size={24} />
                <span>Prompter</span>
              </NavLink>
              {user?.role !== 'admin' && (
                <nav className="hidden md:flex space-x-4">
                  <NavLink id="nav-generator" to="/" className={navLinkClass}>Generator</NavLink>
                  <NavLink id="nav-community" to="/community" className={navLinkClass}>Community</NavLink>
                  <NavLink id="nav-marketplace" to="/marketplace" className={navLinkClass}>Marketplace</NavLink>
                </nav>
              )}
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="hidden md:flex items-center space-x-4">
                {user ? (
                  <>
                    {user.role !== 'admin' && user.subscriptionTier === 'free' && (
                       <Link to="/upgrade" className="flex items-center text-sm font-semibold bg-gradient-to-r from-primary-400 to-primary-600 text-white px-3 py-1.5 rounded-full hover:shadow-lg transition-shadow">
                          <Star size={16} className="mr-1.5" />
                          Upgrade
                       </Link>
                    )}
                    <div className="relative" ref={userMenuRef}>
                      <button 
                        id="user-menu-button" 
                        onClick={() => setIsUserMenuOpen(prev => !prev)} 
                        className="flex items-center space-x-2 relative"
                        aria-haspopup="true"
                        aria-expanded={isUserMenuOpen}
                      >
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                        {user.subscriptionTier === 'pro' && (
                          <span className={`absolute -top-1 -right-1 bg-gradient-to-br from-primary-400 to-primary-600 text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md ring-2 ring-white dark:ring-gray-800 ${user.role === 'admin' ? '!bg-indigo-500 !text-white' : ''}`}>
                              {user.role === 'admin' ? 'ADMIN' : 'PRO'}
                          </span>
                        )}
                      </button>
                      <div className={`absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 origin-top-right transition-all duration-200 ease-in-out transform ${isUserMenuOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
                        {user.role === 'admin' ? (
                            <NavLink to="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <ShieldCheck size={16} className="mr-2"/>
                                Admin Panel
                            </NavLink>
                        ) : (
                            <>
                                <NavLink to="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <UserIcon size={16} className="mr-2"/>
                                    Profile
                                </NavLink>
                            </>
                        )}
                        <div className="my-1 h-px bg-gray-100 dark:bg-gray-700" />
                        <button onClick={() => { setIsUserMenuOpen(false); setIsLogoutModalOpen(true); }} className="w-full text-left block px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">Logout</button>
                      </div>
                    </div>
                  </>
                ) : (
                  null
                )}
              </div>
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                  aria-controls="mobile-menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`md:hidden transition-all duration-300 ease-in-out overflow-y-auto ${isMobileMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'}`} id="mobile-menu">
            {user?.role !== 'admin' && (
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <NavLink to="/" className={mobileNavLinkClass} onClick={closeMobileMenu}>Generator</NavLink>
                    <NavLink to="/community" className={mobileNavLinkClass} onClick={closeMobileMenu}>Community</NavLink>
                    <NavLink to="/marketplace" className={mobileNavLinkClass} onClick={closeMobileMenu}>Marketplace</NavLink>
                </div>
            )}
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              {user ? (
                <div className="px-2 space-y-1">
                  <div className="flex items-center px-3 mb-3">
                    <div className="relative flex-shrink-0">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                      {user.subscriptionTier === 'pro' && (
                          <span className={`absolute -top-1 -right-1 bg-gradient-to-br from-primary-400 to-primary-600 text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md ring-2 ring-white dark:ring-gray-800 ${user.role === 'admin' ? '!bg-indigo-500 !text-white' : ''}`}>
                             {user.role === 'admin' ? 'ADMIN' : 'PRO'}
                          </span>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-base font-medium text-gray-800 dark:text-white">{user.name}</p>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{user.role === 'admin' ? 'Administrator' : 'View profile'}</p>
                    </div>
                  </div>
                  {user.role !== 'admin' && user.subscriptionTier === 'free' && (
                      <NavLink to="/upgrade" className="block text-center px-3 py-2 rounded-md text-base font-semibold bg-gradient-to-r from-primary-400 to-primary-600 text-white" onClick={closeMobileMenu}>
                          Upgrade to Pro
                      </NavLink>
                    )}
                  {user.role === 'admin' ? (
                    <NavLink to="/admin" className={mobileNavLinkClass} onClick={closeMobileMenu}>
                        Admin Panel
                    </NavLink>
                  ) : (
                    <>
                      <NavLink to="/profile" className={mobileNavLinkClass} onClick={closeMobileMenu}>Profile</NavLink>
                    </>
                  )}
                  <button 
                    onClick={handleLogoutClick} 
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                null
              )}
            </div>
          </div>
      </header>
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => { logout(); closeMobileMenu(); }}
        title="Confirm Logout"
        message="Are you sure you want to log out of your account?"
        confirmButtonText="Logout"
        confirmButtonVariant="danger"
      />
    </>
  );
};

export default Header;