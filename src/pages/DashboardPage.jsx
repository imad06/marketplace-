import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { STORE_TYPES, STORE_TYPE_LABELS } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/dashboard/StatCard';
import { DollarSign, ShoppingCart, Package, MessageSquare, TrendingUp, AlertCircle, Clock, Store } from 'lucide-react';
import supabaseService from '../services/supabase.service';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatPrice, formatDateTime } from '../utils/helpers';

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentShop, addShop } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shopData, setShopData] = useState({ name: '', description: '', shop_type: [] });
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Charger les statistiques au montage du composant
  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!currentShop) {
          setStats({ noShop: true });
          setLoading(false);
          return;
        }

        setError('');
        console.log('Fetching shop stats...');

        const response = await supabaseService.getShopStats('month', currentShop.id);
        console.log('Stats response:', response);

        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        if (error.message.includes('404') || error.message.includes('non trouvée') || error.message.includes('Boutique non trouvée')) {
          console.log('No shop found, showing create shop form');
          setStats({ noShop: true });
        } else {
          console.error('Stats error:', error.message);
          setError('Erreur de chargement des statistiques');
          // Afficher quand même quelque chose au lieu de rester en loading
          setStats({
            totalRevenue: 0,
            totalOrders: 0,
            totalProducts: 0,
            pendingOrders: 0,
            error: true
          });
        }
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentShop]);

  // Gérer l'ouverture du formulaire de création depuis le switcher
  useEffect(() => {
    if (location.state?.openCreateShop) {
      setShowCreateForm(true);
      // Nettoyer le state pour éviter que ça pop au prochain reload
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  const handleCreateShop = async (e) => {
    e.preventDefault();
    if (!shopData.name || shopData.shop_type.length === 0) {
      alert('Veuillez remplir le nom et choisir au moins un type de boutique');
      return;
    }

    setCreating(true);
    try {
      const response = await supabaseService.createShop(shopData);
      if (response.success) {
        addShop(response.data);
        setShowCreateForm(false);
        setShopData({ name: '', description: '', shop_type: [] });
        // Optionnel: On peut ne pas recharger et juste laisser l'AuthContext updater la liste
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleTypeChange = (typeId) => {
    const newTypes = shopData.shop_type.includes(typeId)
      ? shopData.shop_type.filter(t => t !== typeId)
      : [...shopData.shop_type, typeId];
    setShopData({ ...shopData, shop_type: newTypes });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (stats?.noShop || showCreateForm) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 relative">
          {showCreateForm && currentShop && (
            <button
              onClick={() => setShowCreateForm(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              Fermer
            </button>
          )}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-4">
              <Store className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Créez votre boutique</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Vous n'avez pas encore de boutique configurée</p>
          </div>

          <form onSubmit={handleCreateShop} className="space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom de la boutique</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition dark:text-white"
                placeholder="Ex: Ma Boutique"
                value={shopData.name}
                onChange={(e) => setShopData({ ...shopData, name: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition dark:text-white h-32"
                placeholder="Décrivez votre activité..."
                value={shopData.description}
                onChange={(e) => setShopData({ ...shopData, description: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type de boutique</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(STORE_TYPES).map(([key, typeId]) => (
                  <button
                    key={typeId}
                    type="button"
                    onClick={() => handleTypeChange(typeId)}
                    className={`px-6 py-2.5 rounded-full text-sm font-bold transition ${shopData.shop_type.includes(typeId)
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                  >
                    {STORE_TYPE_LABELS[typeId]}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/30 transition disabled:opacity-50"
            >
              {creating ? 'Création en cours...' : 'Créer ma boutique'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
        <AlertCircle className="w-5 h-5 inline mr-2" />
        {error}
      </div>
    );
  }

  // Calculer les changements (simulation pour l'exemple)
  const calculateChange = (current, previous = current * 0.9) => {
    if (previous === 0) return '+100%';
    const change = ((current - previous) / previous * 100).toFixed(1);
    return change >= 0 ? `+${change}%` : `${change}%`;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Tableau de bord</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Aperçu de votre activité des 30 derniers jours
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenu Total"
          value={formatPrice(stats.revenue?.total || 0)}
          change={calculateChange(stats.revenue?.total || 0)}
          positive={true}
          icon={DollarSign}
        />
        <StatCard
          title="Commandes"
          value={stats.orders?.total || 0}
          change={calculateChange(stats.orders?.total || 0)}
          positive={true}
          icon={ShoppingCart}
        />
        <StatCard
          title="Produits Actifs"
          value={stats.products?.active || 0}
          change={calculateChange(stats.products?.active || 0, stats.products?.total || 1)}
          positive={stats.products?.active > (stats.products?.total * 0.8)}
          icon={Package}
        />
        <StatCard
          title="En Attente"
          value={stats.orders?.pending || 0}
          change={stats.orders?.pending > 0 ? 'À traiter' : 'Aucune'}
          positive={stats.orders?.pending === 0}
          icon={Clock}
        />
      </div>

      {/* Grille de contenu */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bienvenue */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 transition-colors">
          <h3 className="text-lg font-bold mb-4 flex items-center text-gray-800 dark:text-white">
            <TrendingUp className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
            Bienvenue sur votre tableau de bord
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Gérez votre boutique, suivez vos commandes et analysez vos performances depuis cet espace.
          </p>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Total Produits</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.products?.total || 0}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800/50">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Revenu ce mois</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatPrice(stats.revenue?.period || 0)}
              </p>
            </div>
          </div>

          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 p-4 rounded-xl mt-4">
            <p className="text-sm text-primary-800 dark:text-primary-300">
              <span className="font-bold">💡 Astuce:</span> Explorez les différentes sections du menu pour découvrir toutes les fonctionnalités disponibles.
            </p>
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 transition-colors">
          <h3 className="text-lg font-bold mb-4 flex items-center justify-between text-gray-800 dark:text-white">
            <span className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
              Activité récente
            </span>
            <button
              onClick={() => navigate('/orders')}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold"
            >
              Voir tout →
            </button>
          </h3>

          {stats.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 5).map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                  onClick={() => navigate('/orders')}
                >
                  <div className={`p-2 rounded-lg ${activity.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    activity.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      activity.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30' :
                        'bg-purple-100 dark:bg-purple-900/30'
                    }`}>
                    <ShoppingCart className={`w-4 h-4 ${activity.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                      activity.status === 'processing' ? 'text-blue-600 dark:text-blue-400' :
                        activity.status === 'delivered' ? 'text-green-600 dark:text-green-400' :
                          'text-purple-600 dark:text-purple-400'
                      }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Commande #{activity.order_number?.substring(0, 8) || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {activity.created_at ? formatDateTime(activity.created_at) : 'Date inconnue'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
                      {formatPrice(activity.total_amount || 0)}
                    </p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold">
                      {activity.status || 'unknown'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-700" />
              <p className="font-medium">Aucune activité récente</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Les commandes apparaîtront ici
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Commandes par statut */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 transition-colors">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Répartition des commandes</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.orders?.byStatus && Object.entries(stats.orders.byStatus).map(([status, count]) => (
            <div key={status} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-transparent dark:border-gray-700">
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{count}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 capitalize mt-1 font-medium">
                {status === 'pending' ? 'En attente' :
                  status === 'processing' ? 'En traitement' :
                    status === 'shipped' ? 'Expédiées' :
                      status === 'delivered' ? 'Livrées' :
                        status === 'cancelled' ? 'Annulées' :
                          status}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/products')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 transition p-4 rounded-lg text-left"
          >
            <Package className="w-6 h-6 mb-2" />
            <p className="font-semibold">Ajouter un produit</p>
            <p className="text-sm opacity-90">Enrichissez votre catalogue</p>
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 transition p-4 rounded-lg text-left"
          >
            <ShoppingCart className="w-6 h-6 mb-2" />
            <p className="font-semibold">Gérer les commandes</p>
            <p className="text-sm opacity-90">{stats.orders?.pending || 0} en attente</p>
          </button>
          <button
            onClick={() => navigate('/statistics')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 transition p-4 rounded-lg text-left"
          >
            <TrendingUp className="w-6 h-6 mb-2" />
            <p className="font-semibold">Voir les statistiques</p>
            <p className="text-sm opacity-90">Analyses détaillées</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
