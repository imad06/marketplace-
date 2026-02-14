// frontend/src/pages/StatisticsPage.jsx - Version Interactive Complète
import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users, ArrowUpRight, X, Eye } from 'lucide-react';
import supabaseService from '../services/supabase.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatPrice, formatDateTime } from '../utils/helpers';

const StatisticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  // États pour les vues détaillées
  const [selectedView, setSelectedView] = useState(null);
  const [detailsData, setDetailsData] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await supabaseService.getShopStats(timeRange);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Handler pour clic sur Revenus
  const handleRevenueClick = async () => {
    setSelectedView('revenue');
    setDetailsLoading(true);
    try {
      const response = await supabaseService.getRevenueDetails(timeRange);
      if (response.success) {
        setDetailsData(response.data);
      }
    } catch (error) {
      console.error('Error fetching revenue details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handler pour clic sur Commandes
  const handleOrdersClick = async () => {
    setSelectedView('orders');
    setDetailsLoading(true);
    try {
      const response = await supabaseService.getOrders();
      if (response.success) {
        setDetailsData({
          orders: response.data,
          byStatus: stats.orders.byStatus
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handler pour clic sur Produits
  const handleProductsClick = async () => {
    setSelectedView('products');
    setDetailsLoading(true);
    try {
      const response = await supabaseService.getProducts();
      if (response.success) {
        setDetailsData({
          products: response.data,
          total: stats.products.total,
          active: stats.products.active
        });
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedView(null);
    setDetailsData(null);
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-20" />;
  }

  if (!stats) {
    return <div className="text-center py-20 text-gray-500">Aucune donnée disponible</div>;
  }

  const StatCard = ({ title, value, change, positive, icon: Icon, color, onClick }) => (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100 dark:border-gray-800 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 ${positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-semibold">{change}</span>
          </div>
        )}
        {onClick && <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
      </div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Statistiques</h1>
          <p className="text-gray-600 dark:text-gray-400">Analyse détaillée des performances de votre boutique</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="week">7 derniers jours</option>
          <option value="month">30 derniers jours</option>
          <option value="year">Cette année</option>
        </select>
      </div>

      {/* KPIs Cliquables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenus total"
          value={formatPrice(stats.revenue?.total || 0)}
          change="+12.5%"
          positive={true}
          icon={DollarSign}
          color="bg-gradient-to-br from-green-500 to-green-600"
          onClick={handleRevenueClick}
        />
        <StatCard
          title="Commandes"
          value={stats.orders?.total || 0}
          change="+8.2%"
          positive={true}
          icon={ShoppingCart}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          onClick={handleOrdersClick}
        />
        <StatCard
          title="Produits actifs"
          value={stats.products?.active || 0}
          change={`${stats.products?.total || 0} total`}
          positive={true}
          icon={Package}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          onClick={handleProductsClick}
        />
        <StatCard
          title="Taux de conversion"
          value="3.2%"
          change="+1.1%"
          positive={true}
          icon={Users}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des ventes */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Évolution des ventes</h3>
          <div className="space-y-3">
            {stats.revenue?.monthly && stats.revenue.monthly.map((data, index) => {
              const maxValue = Math.max(...stats.revenue.monthly.map(d => d.value || 0));
              const percentage = maxValue > 0 ? (data.value / maxValue) * 100 : 0;

              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{data.month}</span>
                    <span className="font-semibold text-gray-900">{formatPrice(data.value || 0)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top produits */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 transition-colors">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Produits les plus vendus</h3>
          <div className="space-y-4">
            {stats.topProducts && stats.topProducts.length > 0 ? (
              stats.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} ventes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatPrice(product.revenue || 0)}</p>
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>+{(Math.random() * 20 + 5).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Aucune vente enregistrée</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal de détails */}
      {selectedView && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800 animate-scale-in">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {selectedView === 'revenue' && 'Détails des Revenus'}
                {selectedView === 'orders' && 'Détails des Commandes'}
                {selectedView === 'products' && 'Détails des Produits'}
              </h2>
              <button
                onClick={closeDetails}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-gray-500 dark:text-gray-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {detailsLoading ? (
                <LoadingSpinner size="lg" className="py-20" />
              ) : (
                <>
                  {/* Vue Revenus */}
                  {selectedView === 'revenue' && detailsData && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800/50">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Revenus Payés</p>
                          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {formatPrice(detailsData.total || 0)}
                          </p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border border-yellow-100 dark:border-yellow-800/50">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">En Attente</p>
                          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                            {formatPrice(detailsData.pending || 0)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">Commandes payées</h3>
                        <div className="space-y-2">
                          {detailsData.paidOrders && detailsData.paidOrders.length > 0 ? (
                            detailsData.paidOrders.map(order => (
                              <div key={order.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition">
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">{order.order_number}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDateTime(order.created_at)}
                                  </p>
                                </div>
                                <p className="font-bold text-green-600 dark:text-green-400">
                                  {formatPrice(order.total_amount)}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-gray-500 py-4">Aucune commande payée</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vue Commandes */}
                  {selectedView === 'orders' && detailsData && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {detailsData.byStatus && Object.entries(detailsData.byStatus).map(([status, count]) => (
                          <div key={status} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl text-center border border-transparent dark:border-gray-700">
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{count}</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize mt-1 font-bold">
                              {status === 'pending' ? 'En attente' :
                                status === 'processing' ? 'En traitement' :
                                  status === 'shipped' ? 'Expédiées' :
                                    status === 'delivered' ? 'Livrées' :
                                      'Annulées'}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">Liste des commandes</h3>
                        <div className="space-y-2">
                          {detailsData.orders && detailsData.orders.length > 0 ? (
                            detailsData.orders.slice(0, 10).map(order => (
                              <div key={order.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition">
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">{order.order_number}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{order.customer_name}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900 dark:text-white">{formatPrice(order.total_amount)}</p>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                    order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-center text-gray-500 py-4">Aucune commande</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vue Produits */}
                  {selectedView === 'products' && detailsData && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl text-center border border-blue-100 dark:border-blue-800/50">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
                          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{detailsData.total}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl text-center border border-green-100 dark:border-green-800/50">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Actifs</p>
                          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{detailsData.active}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl text-center border border-gray-100 dark:border-gray-700">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Inactifs</p>
                          <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                            {detailsData.total - detailsData.active}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">Liste des produits</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {detailsData.products && detailsData.products.length > 0 ? (
                            detailsData.products.slice(0, 12).map(product => (
                              <div key={product.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition">
                                <p className="font-semibold text-gray-900 dark:text-white truncate">{product.name}</p>
                                <div className="flex justify-between items-center mt-2">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Stock: {product.stock_quantity}</p>
                                  <p className="font-bold text-primary-600 dark:text-primary-400">
                                    {formatPrice(product.price)}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="col-span-2 text-center text-gray-500 py-4">Aucun produit</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPage;
