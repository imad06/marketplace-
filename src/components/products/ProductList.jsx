// frontend/src/components/products/ProductList.jsx - Version complète
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Package } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductForm from './ProductForm';
import ProductDetailModal from './ProductDetailModal';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import supabaseService from '../../services/supabase.service';
import { useAuth } from '../../hooks/useAuth';

const ProductList = () => {
  const { currentShop } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      if (!currentShop) {
        setProducts([]);
        setFilteredProducts([]);
        setLoading(false);
        return;
      }
      setError('');
      const response = await supabaseService.getProducts(currentShop.id);
      if (response.success) {
        setProducts(response.data || []);
        setFilteredProducts(response.data || []);
      } else {
        setError(response.message || 'Erreur lors du chargement des produits');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Impossible de charger les produits. Vérifiez votre connexion.');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, currentShop]);

  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleCreate = () => {
    setSelectedProduct(null);
    setShowForm(true);
    setError('');
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowForm(true);
    setShowDetail(false);
    setError('');
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setShowDetail(true);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer ce produit ?\nCette action est irréversible.'
    );

    if (confirmed) {
      try {
        setError('');
        const response = await supabaseService.deleteProduct(id);
        if (response.success) {
          setSuccessMessage('Produit supprimé avec succès');
          fetchProducts();
        } else {
          setError(response.message || 'Impossible de supprimer le produit');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        setError(error.message || 'Impossible de supprimer le produit');
      }
    }
  };

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    setError('');

    try {
      let response;
      if (selectedProduct) {
        // Mode édition
        response = await supabaseService.updateProduct(selectedProduct.id, formData);
      } else {
        // Mode création
        response = await supabaseService.createProduct(formData);
      }

      if (response.success) {
        setShowForm(false);
        fetchProducts();
        setSuccessMessage(
          selectedProduct
            ? 'Produit modifié avec succès'
            : 'Produit créé avec succès'
        );
      } else {
        throw new Error(response.message || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.message || 'Impossible d\'enregistrer le produit');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-20" />;
  }

  return (
    <div>
      {/* Messages */}
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg animate-shake">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg animate-slide-down">
          ✓ {successMessage}
        </div>
      )}

      {/* Barre de recherche et bouton */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          />
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="w-5 h-5 mr-2" />
          Nouveau produit
        </Button>
      </div>

      {/* Liste des produits */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
            {searchTerm ? 'Aucun produit trouvé' : 'Aucun produit dans votre catalogue'}
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            {searchTerm
              ? 'Essayez avec un autre terme de recherche'
              : 'Commencez par ajouter votre premier produit'}
          </p>
          {!searchTerm && (
            <Button variant="primary" onClick={handleCreate} className="mt-6">
              <Plus className="w-5 h-5 mr-2" />
              Ajouter un produit
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <ProductForm
          product={selectedProduct}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setError('');
          }}
          loading={formLoading}
        />
      )}

      {showDetail && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setShowDetail(false)}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default ProductList;