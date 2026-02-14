import React from 'react';
import OrderList from '../components/orders/OrderList';

const OrdersPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Commandes</h1>
        <p className="text-gray-600 dark:text-gray-400">Gérez vos ventes et le suivi des livraisons</p>
      </div>
      <OrderList />
    </div>
  );
};

export default OrdersPage;
