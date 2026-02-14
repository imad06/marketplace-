// frontend/src/components/products/ProductCard.jsx - Version avec images
import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { formatPrice } from '../../utils/helpers';
import Button from '../common/Button';
import { getPublicImageUrl } from '../../config/supabase.config';

const ProductCard = ({ product, onEdit, onDelete, onView }) => {
  const stockQuantity = product.stock_quantity || 0;
  const isActive = product.status === 'active';

  // Gérer les images - prendre la première du tableau ou l'image_url
  const getImageUrl = () => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      // Si c'est déjà une URL complète, la retourner directement
      if (product.images[0].startsWith('http')) {
        return product.images[0];
      }
      // Sinon, c'est un path Supabase Storage
      return getPublicImageUrl(product.images[0]);
    } else if (product.image_url) {
      if (product.image_url.startsWith('http')) {
        return product.image_url;
      }
      return getPublicImageUrl(product.image_url);
    }
    return 'https://via.placeholder.com/300x200?text=Produit';
  };

  const imageUrl = getImageUrl();

  return (
    <div className={`group bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition ${!isActive ? 'opacity-75' : ''}`}>
      <div className="relative">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Image+non+disponible';
          }}
        />

        {/* Overlay d'actions au survol */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={() => onView(product)}
            className="p-3 bg-white hover:bg-primary-50 text-gray-900 rounded-full shadow-lg transition transform hover:scale-110"
            title="Voir les détails"
          >
            <Eye className="w-5 h-5 text-primary-600" />
          </button>
          <button
            onClick={() => onEdit(product)}
            className="p-3 bg-white hover:bg-blue-50 text-gray-900 rounded-full shadow-lg transition transform hover:scale-110"
            title="Modifier"
          >
            <Edit className="w-5 h-5 text-blue-600" />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="p-3 bg-white hover:bg-red-50 text-gray-900 rounded-full shadow-lg transition transform hover:scale-110"
            title="Supprimer"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
        </div>

        {!isActive && (
          <div className="absolute top-2 right-2 bg-gray-800/90 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
            INACTIF
          </div>
        )}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
            +{product.images.length - 1} photo{product.images.length > 2 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-1 truncate">{product.name}</h3>
        {product.category && (
          <div className="flex flex-col gap-0.5 mb-3">
            <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-tight">
              {product.category.split(' > ').pop()}
            </span>
            <p className="text-[9px] text-gray-400 dark:text-gray-500 truncate">
              {product.category}
            </p>
          </div>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 h-10">
          {product.description || 'Aucune description'}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {formatPrice(product.price)}
          </span>
          <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-tight ${stockQuantity > 10
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
            : stockQuantity > 0
              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
            }`}>
            {stockQuantity > 0 ? `STOCK: ${stockQuantity}` : 'RUPTURE'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;