import React, { useState, useEffect, useCallback } from 'react';
import { Package, Search, Filter } from 'lucide-react';
import OrderDetail from './OrderDetail';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import supabaseService from '../../services/supabase.service';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_STATUS } from '../../utils/constants';
import { formatPrice, formatDateTime } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';

const OrderList = () => {
  const { currentShop } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      if (!currentShop) {
        setOrders([]);
        setFilteredOrders([]);
        setLoading(false);
        return;
      }
      setError('');
      const response = await supabaseService.getOrders(null, currentShop.id);
      if (response.success) {
        setOrders(response.data || []);
        setFilteredOrders(response.data || []);
      } else {
        setError(response.message || 'Erreur lors du chargement des commandes');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Impossible de charger les commandes. Vérifiez votre connexion.');
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, currentShop]);

  useEffect(() => {
    let filtered = orders;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter((order) =>
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, statusFilter, orders]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowDetail(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setError('');
      const response = await supabaseService.updateOrderStatus(orderId, { status: newStatus });

      if (response.success) {
        alert('Statut de la commande mis à jour avec succès');
        fetchOrders();
        setShowDetail(false);
      } else {
        alert(response.message || 'Erreur lors de la mise à jour du statut');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Erreur lors de la mise à jour du statut de la commande');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-20" />;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une commande ou un client..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value={ORDER_STATUS.PENDING}>En attente</option>
              <option value={ORDER_STATUS.PROCESSING}>En traitement</option>
              <option value={ORDER_STATUS.SHIPPED}>Expédiée</option>
              <option value={ORDER_STATUS.DELIVERED}>Livrée</option>
              <option value={ORDER_STATUS.CANCELLED}>Annulée</option>
            </select>
          </div>
        </div>
      </div>

      {
        filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-100 dark:border-gray-800">
            <Package className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {searchTerm || statusFilter !== 'all'
                ? 'Aucune commande trouvée'
                : 'Aucune commande pour le moment'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              {searchTerm || statusFilter !== 'all'
                ? 'Essayez de modifier vos filtres'
                : 'Les commandes apparaîtront ici une fois créées'}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-800">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      N° Commande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.order_number || `#${order.id?.slice(0, 8)}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{order.customer_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{order.customer_email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-300">
                          {order.created_at ? formatDateTime(order.created_at) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatPrice(order.total_amount || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}>
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrder(order)}
                        >
                          Voir détails
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      {showDetail && selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          onClose={() => setShowDetail(false)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div >
  );
};

export default OrderList;