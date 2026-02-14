import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/helpers';
import NotificationsPanel from './NotificationsPanel';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import supabaseService from '../../services/supabase.service';

const Header = ({ title }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();

    // Actualiser le compteur toutes les 30 secondes
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await supabaseService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.unread_count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationsClick = () => {
    setNotificationsOpen(true);
  };

  const handleNotificationsClose = () => {
    setNotificationsOpen(false);
    fetchUnreadCount();
  };

  return (
    <>
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{title}</h1>
        </div>

        <div className="flex items-center space-x-2">
          {/* Sélecteur de langue */}
          <LanguageSelector />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <button
            onClick={handleNotificationsClick}
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full pulse-ring"></span>
              </>
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {getInitials(user?.full_name || user?.name)}
                </span>
              </div>
              <div className="text-left hidden md:block">
                <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                  {user?.full_name || user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300"
                  >
                    <User className="w-4 h-4" />
                    <span>{t('nav.profile')}</span>
                  </button>
                  <hr className="dark:border-gray-700" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('auth.logout')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Panneau de notifications */}
      <NotificationsPanel
        isOpen={notificationsOpen}
        onClose={handleNotificationsClose}
      />
    </>
  );
};

export default Header;