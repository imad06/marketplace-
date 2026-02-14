import React from 'react';
import ProductList from '../components/products/ProductList';

const ProductsPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mes produits</h1>
        <p className="text-gray-600">
          Gérez votre catalogue de produits, ajoutez de nouveaux articles et mettez à jour les stocks.
        </p>
      </div>
      <ProductList />
    </div>
  );
};

export default ProductsPage;