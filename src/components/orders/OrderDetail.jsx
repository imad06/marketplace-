import React from 'react';
import { X, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import Button from '../common/Button';
import { formatPrice, formatDateTime } from '..//../utils/helpers';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_STATUS } from '../../utils/constants';

const OrderDetail = ({ order, onClose, onUpdateStatus }) => {
  if (!order) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case ORDER_STATUS.PROCESSING:
        return <Package className="w-6 h-6 text-blue-600" />;
      case ORDER_STATUS.SHIPPED:
        return <Truck className="w-6 h-6 text-purple-600" />;
      case ORDER_STATUS.DELIVERED:
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case ORDER_STATUS.CANCELLED:
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Package className="w-6 h-6 text-gray-600" />;
    }
  };

  const getNextStatusButton = () => {
    switch (order.status) {
      case ORDER_STATUS.PENDING:
        return (
          <Button
            variant="primary"
            onClick={() => onUpdateStatus(order.id, ORDER_STATUS.PROCESSING)}
          >
            <Package className="w-4 h-4 mr-2" />
            Marquer en traitement
          </Button>
        );
      case ORDER_STATUS.PROCESSING:
        return (
          <Button
            variant="primary"
            onClick={() => onUpdateStatus(order.id, ORDER_STATUS.SHIPPED)}
          >
            <Truck className="w-4 h-4 mr-2" />
            Marquer comme expédiée
          </Button>
        );
      case ORDER_STATUS.SHIPPED:
        return (
          <Button
            variant="success"
            onClick={() => onUpdateStatus(order.id, ORDER_STATUS.DELIVERED)}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Marquer comme livrée
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800 animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Commande #{order.id?.slice(0, 8) || 'N/A'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {order.created_at ? formatDateTime(order.created_at) : 'Date inconnue'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-gray-500 dark:text-gray-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Statut avec icône */}
          <div className="flex items-center space-x-3">
            {getStatusIcon(order.status)}
            <span className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full ${ORDER_STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}>
              {ORDER_STATUS_LABELS[order.status] || order.status}
            </span>
          </div>

          {/* Info client */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center text-lg">
              <Package className="w-5 h-5 mr-3 text-primary-500" />
              Informations client
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Nom</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{order.customer_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">Email</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">{order.customer_email || 'N/A'}</p>
              </div>
              {order.customer_phone && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Téléphone</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{order.customer_phone}</p>
                </div>
              )}
              {order.shipping_address && (
                <div className="md:col-span-2">
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Adresse de livraison</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{order.shipping_address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Articles commandés */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4 text-lg">Articles commandés</h3>
            <div className="space-y-3">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center space-x-4">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded-lg shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{item.product_name || 'Produit'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Quantité: {item.quantity || 1} × {formatPrice(item.price || 0)}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">
                      {formatPrice((item.price || 0) * (item.quantity || 1))}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Aucun article dans cette commande
                </div>
              )}
            </div>
          </div>

          {/* Résumé de la commande */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
            <div className="space-y-3 bg-gray-50/50 dark:bg-gray-800/20 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Sous-total</span>
                <span className="font-medium dark:text-gray-200">{formatPrice(order.subtotal || order.total_amount || 0)}</span>
              </div>
              {order.shipping_cost && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Frais de livraison</span>
                  <span className="font-medium dark:text-gray-200">{formatPrice(order.shipping_cost)}</span>
                </div>
              )}
              {order.tax && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>TVA</span>
                  <span className="font-medium dark:text-gray-200">{formatPrice(order.tax)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-2xl font-bold pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-primary-600 dark:text-primary-400">
                  {formatPrice(order.total_amount || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {getNextStatusButton()}
            {order.status !== ORDER_STATUS.CANCELLED && order.status !== ORDER_STATUS.DELIVERED && (
              <Button
                variant="danger"
                onClick={() => {
                  if (window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
                    onUpdateStatus(order.id, ORDER_STATUS.CANCELLED);
                  }
                }}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Annuler la commande
              </Button>
            )}
            <Button variant="secondary" onClick={onClose} className="sm:ml-auto">
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;