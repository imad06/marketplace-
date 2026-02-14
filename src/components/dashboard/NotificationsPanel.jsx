import React, { useState, useEffect } from 'react';
import { Bell, X, ShoppingCart, Package, DollarSign, AlertCircle, CheckCircle, Info, Trash2, Settings } from 'lucide-react';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import supabaseService from '../../services/supabase.service';

const NotificationsPanel = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await supabaseService.getNotifications();
      if (response.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Impossible de charger les notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const response = await supabaseService.markNotificationAsRead(id);
      if (response.success) {
        setNotifications(notifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        ));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await supabaseService.markAllNotificationsAsRead();
      if (response.success) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await supabaseService.deleteNotification(id);
      if (response.success) {
        setNotifications(notifications.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order':
        return { Icon: ShoppingCart, color: 'bg-blue-500' };
      case 'payment':
        return { Icon: DollarSign, color: 'bg-green-500' };
      case 'stock':
        return { Icon: Package, color: 'bg-yellow-500' };
      case 'message':
        return { Icon: Info, color: 'bg-purple-500' };
      case 'system':
        return { Icon: AlertCircle, color: 'bg-red-500' };
      default:
        return { Icon: Bell, color: 'bg-gray-500' };
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const filteredNotifications = filter === 'all'
    ? notifications
    : filter === 'unread'
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col animate-slide-in-right border-l dark:border-gray-800">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Notifications</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-white text-primary-600 text-[10px] font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filtres */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { value: 'all', label: 'Toutes' },
              { value: 'unread', label: 'Non lues' },
              { value: 'order', label: 'Commandes' },
              { value: 'payment', label: 'Paiements' }
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${filter === f.value
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des notifications */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <Button
                variant="primary"
                onClick={fetchNotifications}
                className="mt-4"
              >
                Réessayer
              </Button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <Bell className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium">Aucune notification</p>
              <p className="text-sm text-gray-400 mt-1 text-center">
                Vous êtes à jour !
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredNotifications.map((notif) => {
                const { Icon, color } = getIcon(notif.type);
                return (
                  <div
                    key={notif.id}
                    onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                  >
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg ${color} flex-shrink-0 h-fit`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <div className="w-2.5 h-2.5 bg-primary-600 rounded-full flex-shrink-0 mt-1 shadow-sm" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">{notif.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase">
                            {formatTime(notif.created_at)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notif.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && notifications.length > 0 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 space-y-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Tout marquer comme lu
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                console.log('Paramètres notifications');
              }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationsPanel;