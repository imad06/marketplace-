// frontend/src/components/products/ProductForm.jsx - VERSION CORRIGÉE
import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { X, AlertCircle, Trash2, Upload } from 'lucide-react';
import { getPublicImageUrl } from '../../config/supabase.config';
import { PRODUCT_CATEGORIES, STORE_TYPE_LABELS } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import supabaseService from '../../services/supabase.service';

const ProductForm = ({ product, onSubmit, onCancel, loading }) => {
  const { currentShop } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category: '',
    category_id: '',
    status: 'active'
  });
  const [dbCategories, setDbCategories] = useState([]);

  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const [selection, setSelection] = useState({
    typeId: '',
    groupId: '',
    itemId: ''
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await supabaseService.getCategories();
        if (response.success) {
          setDbCategories(response.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (product) {
      console.log('Loading product:', product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock_quantity: product.stock_quantity || '',
        category: product.category || '',
        category_id: product.category_id || null,
        status: product.status || 'active'
      });
      // Charger les images existantes
      const images = product.images || (product.image_url ? [product.image_url] : []);
      setExistingImages(images);
      console.log('Existing images:', images);

      // Initialiser la sélection si on a un category_id
      if (product.category_id && dbCategories.length > 0) {
        const currentCat = dbCategories.find(c => c.id === product.category_id);
        if (currentCat && currentCat.parent_id) {
          const parentCat = dbCategories.find(c => c.id === currentCat.parent_id);
          setSelection({
            typeId: currentCat.store_type_id || (parentCat ? parentCat.store_type_id : ''),
            groupId: currentCat.parent_id,
            itemId: currentCat.id
          });
        }
      } else if (product.category) {
        // Fallback backward compatibility or if category_id not yet synced
        const parts = product.category.split(' > ');
        if (parts.length === 3) {
          const typeId = Object.keys(STORE_TYPE_LABELS).find(k => STORE_TYPE_LABELS[k] === parts[0]);
          const group = dbCategories.find(c => c.name === parts[1] && !c.parent_id && c.store_type_id == typeId);
          const item = dbCategories.find(c => c.name === parts[2] && c.parent_id === group?.id);

          setSelection({
            typeId: typeId || '',
            groupId: group?.id || '',
            itemId: item?.id || ''
          });
        }
      }
    } else {
      // Reset pour nouveau produit
      setFormData({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category: '',
        category_id: null,
        status: 'active'
      });
      setExistingImages([]);
      setSelection({ typeId: '', groupId: '', itemId: '' });
    }
    // Reset des nouvelles images
    setNewImageFiles([]);
    setImagePreviews([]);
  }, [product, dbCategories]);

  // Gérer la cascade des sélections
  const handleSelectionChange = (level, value) => {
    const newSelection = { ...selection, [level]: value };

    if (level === 'typeId') {
      newSelection.groupId = '';
      newSelection.itemId = '';
    } else if (level === 'groupId') {
      newSelection.itemId = '';
    }

    setSelection(newSelection);

    // Sync avec formData.category_id si tout est sélectionné
    if (newSelection.typeId && newSelection.groupId && newSelection.itemId) {
      const typeLabel = STORE_TYPE_LABELS[newSelection.typeId];
      const groupLabel = dbCategories.find(c => c.id === newSelection.groupId)?.name;
      const itemLabel = dbCategories.find(c => c.id === newSelection.itemId)?.name;

      const fullCategory = `${typeLabel} > ${groupLabel} > ${itemLabel}`;

      setFormData(prev => ({
        ...prev,
        category: fullCategory,
        category_id: newSelection.itemId
      }));
      if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
    } else {
      setFormData(prev => ({ ...prev, category: '', category_id: null }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (checked ? 'active' : 'inactive') : value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    setGeneralError('');
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    if (!files || files.length === 0) return;

    // Filtrer seulement les images < 5MB
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      const isUnder5MB = file.size <= 5 * 1024 * 1024;
      return isValid && isUnder5MB;
    });

    if (validFiles.length !== files.length) {
      setErrors({ ...errors, images: 'Certains fichiers ont été ignorés (format ou taille invalide)' });
    } else {
      setErrors({ ...errors, images: '' });
    }

    const totalImages = existingImages.length + newImageFiles.length + validFiles.length;
    if (totalImages > 5) {
      setErrors({ ...errors, images: 'Maximum 5 images par produit' });
      return;
    }

    setNewImageFiles([...newImageFiles, ...validFiles]);

    // Créer les previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveExistingImage = (index) => {
    const newImages = [...existingImages];
    newImages.splice(index, 1);
    setExistingImages(newImages);
  };

  const handleRemoveNewImage = (index) => {
    const newFiles = [...newImageFiles];
    const newPreviews = [...imagePreviews];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setNewImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Le nom du produit est obligatoire';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Le nom doit contenir au moins 3 caractères';
    }

    if (!formData.price) {
      newErrors.price = 'Le prix est obligatoire';
    } else {
      const priceValue = parseFloat(formData.price);
      if (isNaN(priceValue) || priceValue <= 0) {
        newErrors.price = 'Le prix doit être supérieur à 0';
      }
    }

    if (formData.stock_quantity === '') {
      newErrors.stock_quantity = 'La quantité en stock est obligatoire';
    } else {
      const stockValue = parseInt(formData.stock_quantity);
      if (isNaN(stockValue) || stockValue < 0) {
        newErrors.stock_quantity = 'Le stock ne peut pas être négatif';
      }
    }

    if (!formData.category) {
      newErrors.category = 'Veuillez sélectionner une catégorie';
    }

    // Vérifier qu'il y a au moins une image (existante ou nouvelle)
    if (existingImages.length === 0 && newImageFiles.length === 0) {
      newErrors.images = 'Ajoutez au moins une image pour votre produit';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      setGeneralError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    try {
      // Créer FormData
      const formDataToSend = new FormData();

      // Ajouter les données du produit
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description?.trim() || '');
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('stock_quantity', parseInt(formData.stock_quantity));
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('status', formData.status);

      // Associer à la boutique actuelle (indispensable en mode multi-boutique)
      if (currentShop) {
        formDataToSend.append('store_id', currentShop.id);
      }

      // Si mode édition, envoyer les images existantes
      if (product) {
        console.log('Mode édition - Existing images:', existingImages);
        formDataToSend.append('existing_images', JSON.stringify(existingImages));
      }

      // Ajouter les nouveaux fichiers
      if (newImageFiles.length > 0) {
        console.log('Adding new files:', newImageFiles.length);
        newImageFiles.forEach((file, index) => {
          formDataToSend.append('images', file);
          console.log(`File ${index}:`, file.name, file.type, file.size);
        });
      }

      // Log pour debug
      console.log('Submitting FormData:');
      for (let pair of formDataToSend.entries()) {
        if (pair[1] instanceof File) {
          console.log(pair[0], '(File):', pair[1].name);
        } else {
          console.log(pair[0], ':', pair[1]);
        }
      }

      await onSubmit(formDataToSend);
    } catch (error) {
      console.error('Submit error:', error);
      setGeneralError(error.message || 'Une erreur est survenue');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800 animate-scale-in">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {product ? 'Modifier le produit' : 'Nouveau produit'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-gray-500 dark:text-gray-400"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {generalError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl flex items-start mb-6">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="text-sm font-medium">{generalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Colonne gauche - Informations */}
            <div className="space-y-4">
              <Input
                label="Nom du produit"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Ex: T-shirt en coton bio"
                required
                disabled={loading}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none"
                  placeholder="Décrivez votre produit..."
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Prix (DZD)"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  error={errors.price}
                  placeholder="0.00"
                  required
                  disabled={loading}
                />

                <Input
                  label="Stock"
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  min="0"
                  error={errors.stock_quantity}
                  placeholder="0"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Catégorie <span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-1 gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  {/* Niveau 1: Type */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Genre / Type</label>
                    <select
                      value={selection.typeId}
                      onChange={(e) => handleSelectionChange('typeId', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                      disabled={loading}
                    >
                      <option value="">-- Choisir --</option>
                      {(() => {
                        const shopTypeIds = currentShop?.store_store_types?.map(st => st.store_type_id) || [];
                        const typesToShow = shopTypeIds.length > 0 ? shopTypeIds : Object.keys(STORE_TYPE_LABELS);

                        return typesToShow.map(id => (
                          <option key={id} value={id}>
                            {STORE_TYPE_LABELS[id] || id}
                          </option>
                        ));
                      })()}
                    </select>
                  </div>

                  {/* Niveau 2: Groupe */}
                  {selection.typeId && (
                    <div className="space-y-1 animate-slide-down">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Famille</label>
                      <select
                        value={selection.groupId}
                        onChange={(e) => handleSelectionChange('groupId', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                        disabled={loading}
                      >
                        <option value="">-- Choisir --</option>
                        {(() => {
                          const groups = dbCategories.filter(c => !c.parent_id && c.store_type_id == selection.typeId);
                          // Déduplication par nom
                          const uniqueGroups = Array.from(new Map(groups.map(c => [c.name, c])).values());

                          return uniqueGroups.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ));
                        })()}
                      </select>
                    </div>
                  )}

                  {/* Niveau 3: Item */}
                  {selection.groupId && (
                    <div className="space-y-1 animate-slide-down">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Article</label>
                      <select
                        value={selection.itemId}
                        onChange={(e) => handleSelectionChange('itemId', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                        disabled={loading}
                      >
                        <option value="">-- Choisir --</option>
                        {dbCategories
                          .filter(c => c.parent_id === selection.groupId)
                          .map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))
                        }
                      </select>
                    </div>
                  )}
                </div>

                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                )}
                {formData.category && (
                  <div className="text-[10px] font-medium text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded inline-block">
                    Sélection : {formData.category}
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="status"
                  name="status"
                  checked={formData.status === 'active'}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 dark:border-gray-700 rounded focus:ring-primary-500 bg-white dark:bg-gray-800"
                  disabled={loading}
                />
                <label htmlFor="status" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Produit actif (visible)
                </label>
              </div>
            </div>

            {/* Colonne droite - Images */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Images du produit <span className="text-red-500">*</span>
                </label>

                {/* Bouton d'upload */}
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Cliquez pour ajouter</span>
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG, GIF (max. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={loading || (existingImages.length + newImageFiles.length >= 5)}
                  />
                </label>

                {errors.images && (
                  <p className="text-sm text-red-500 mt-2">{errors.images}</p>
                )}

                {/* Images existantes */}
                {existingImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Images actuelles ({existingImages.length})</p>
                    <div className="grid grid-cols-2 gap-2">
                      {existingImages.map((img, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <img
                            src={img.startsWith('http') ? img : getPublicImageUrl(img)}
                            alt={`Produit ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/200?text=Erreur';
                            }}
                          />
                          {index === 0 && (
                            <span className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                              Principale
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nouvelles images ({newImageFiles.length})
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative group rounded-xl overflow-hidden aspect-square">
                        <img
                          src={preview}
                          alt={`Nouveau ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-lg"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-[10px] rounded font-bold">
                          {(newImageFiles[index].size / 1024).toFixed(1)} KB
                        </div>
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded shadow-sm">
                          Nouveau
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-3 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  La première image sera l'image principale. Maximum 5 images.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : (product ? 'Modifier' : 'Créer le produit')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              className="px-8"
              disabled={loading}
            >
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;