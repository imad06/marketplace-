import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  MessageSquare,
  Settings,
  HelpCircle,
  Store,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ShopSwitcher from './ShopSwitcher';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/products', label: t('nav.products'), icon: Package },
    { path: '/orders', label: t('nav.orders'), icon: ShoppingCart },
    { path: '/statistics', label: t('nav.statistics'), icon: BarChart3 },
    { path: '/messages', label: t('nav.messages'), icon: MessageSquare },
    { path: '/settings', label: t('nav.settings'), icon: Settings },
    { path: '/support', label: t('nav.support'), icon: HelpCircle },
  ];

  return (
    <aside
      className={`${isOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col fixed lg:relative h-full z-20`}
    >
      {/* Logo & Toggle */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800">
        {isOpen && (
          <div className="flex items-center space-x-2">
            <Store className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <span className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight">VendeurPro</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
        >
          {isOpen ? <X className="w-5 h-5 dark:text-gray-300" /> : <Menu className="w-5 h-5 dark:text-gray-300" />}
        </button>
      </div>

      {/* Shop Selector */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <ShopSwitcher isSidebarOpen={isOpen} />
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-3 rounded-lg transition ${isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="font-medium">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;