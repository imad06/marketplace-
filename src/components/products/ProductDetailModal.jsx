import React, { useState } from 'react';
import { X, Package, DollarSign, Layers, Tag, Calendar, ChevronRight } from 'lucide-react';
import Button from '../common/Button';
import { formatPrice, formatDateTime } from '../../utils/helpers';

const ProductDetailModal = ({ product, onClose, onEdit }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) return null;

  // Gérer les images multiples
  const images = product.images && Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.image_url
      ? [product.image_url]
      : ['https://via.placeholder.com/600x400?text=Aucune+image'];

  const stockStatus = product.stock_quantity > 10
    ? { text: 'En stock', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' }
    : product.stock_quantity > 0
      ? { text: 'Stock faible', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' }
      : { text: 'Rupture de stock', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800 animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-20">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Détails du produit</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-gray-500 dark:text-gray-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Section Images */}
            <div>
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden mb-4 aspect-square">
                <img
                  src={images[currentImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x400?text=Image+non+disponible';
                  }}
                />

                {/* Navigation images si plusieurs */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Indicateur de position */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Miniatures */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition ${idx === currentImageIndex
                        ? 'border-primary-600 shadow-md scale-105'
                        : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                        }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Section Informations */}
            <div>
              {/* Nom et prix */}
              <div className="mb-8">
                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
                  {product.name}
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-black text-primary-600 dark:text-primary-400">
                    {formatPrice(product.price)}
                  </span>
                  {product.status !== 'active' && (
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-full uppercase tracking-wider">
                      Inactif
                    </span>
                  )}
                </div>
              </div>

              {/* Statut du stock */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-8 ${stockStatus.bg} ${stockStatus.color}`}>
                <Package className="w-5 h-5" />
                <span className="font-bold">
                  {stockStatus.text} ({product.stock_quantity} unités)
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-8">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    Description
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Informations détaillées */}
              <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-transparent dark:border-gray-800">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Informations techniques</h4>

                {product.category && (
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <Tag className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Catégorie</p>
                      <div className="flex flex-wrap gap-2 items-center">
                        {product.category?.split(' > ').map((part, index, array) => (
                          <React.Fragment key={index}>
                            <div className="flex flex-col">
                              <span className="text-[8px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-tighter mb-0.5">
                                {index === 0 ? 'Type' : index === 1 ? 'Famille' : 'Article'}
                              </span>
                              <span className="px-2.5 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                {part}
                              </span>
                            </div>
                            {index < array.length - 1 && (
                              <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 self-end mb-2" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {product.sku && (
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                      <Layers className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">SKU</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{product.sku}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <DollarSign className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Prix unitaire</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatPrice(product.price)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Ajouté le</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {product.created_at ? formatDateTime(product.created_at) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    onEdit(product);
                    onClose();
                  }}
                >
                  Modifier le produit
                </Button>
                <Button
                  variant="secondary"
                  onClick={onClose}
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;