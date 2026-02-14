// ============================================
// frontend/src/pages/SettingsPage.jsx
// ============================================
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Store, User, Lock } from 'lucide-react';
import supabaseService from '../services/supabase.service';
import { STORE_TYPES, STORE_TYPE_LABELS } from '../utils/constants';

const SettingsPage = () => {
  const { user, shops, currentShop, switchShop, updateShop } = useAuth();
  const [activeTab, setActiveTab] = useState('shop');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [shopFormData, setShopFormData] = useState({
    name: '',
    description: '',
    shop_type: []
  });

  // Mettre à jour le formulaire quand la boutique actuelle change
  React.useEffect(() => {
    if (currentShop) {
      setShopFormData({
        name: currentShop.name || '',
        description: currentShop.description || '',
        shop_type: currentShop.store_store_types?.map(st => st.store_type_id) || []
      });
    }
  }, [currentShop]);

  const [profileFormData, setProfileFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleShopChange = (e) => {
    setShopFormData({ ...shopFormData, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (e) => {
    setProfileFormData({ ...profileFormData, [e.target.name]: e.target.value });
  };

  const handleTypeToggle = (typeId) => {
    const newTypes = shopFormData.shop_type.includes(typeId)
      ? shopFormData.shop_type.filter(t => t !== typeId)
      : [...shopFormData.shop_type, typeId];
    setShopFormData({ ...shopFormData, shop_type: newTypes });
  };

  const handleSaveShop = async () => {
    if (!currentShop) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await supabaseService.updateShop(shopFormData, currentShop.id);
      if (response.success) {
        updateShop(response.data);
        setMessage({ type: 'success', text: 'Boutique mise à jour avec succès' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await supabaseService.updateProfile(profileFormData);
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Paramètres</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez les paramètres de votre compte et de votre boutique.
        </p>
      </div>

      {message.text && (
        <div className={`mb-4 p-4 rounded-lg border ${message.type === 'success'
          ? 'bg-green-50 text-green-700 border-green-200'
          : 'bg-red-50 text-red-700 border-red-200'
          }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('shop')}
              className={`py-4 border-b-2 font-medium text-sm ${activeTab === 'shop'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <Store className="w-5 h-5 inline-block mr-2" />
              Boutique
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 border-b-2 font-medium text-sm ${activeTab === 'profile'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <User className="w-5 h-5 inline-block mr-2" />
              Profil
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 border-b-2 font-medium text-sm ${activeTab === 'security'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <Lock className="w-5 h-5 inline-block mr-2" />
              Sécurité
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'shop' && (
            <div className="max-w-2xl">
              <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                  Sélectionner la boutique à gérer
                </h4>
                <div className="flex flex-wrap gap-3">
                  {shops.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => switchShop(s.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition border ${currentShop?.id === s.id
                          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500/20'
                          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-primary-300 dark:hover:border-primary-700'
                        }`}
                    >
                      <Store className={`w-4 h-4 ${currentShop?.id === s.id ? 'text-primary-600' : 'text-gray-400'}`} />
                      <span className="font-semibold">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4 dark:text-white inline-flex items-center">
                Paramètres de "{currentShop?.name}"
              </h3>
              <Input
                label="Nom de la boutique"
                name="name"
                value={shopFormData.name}
                onChange={handleShopChange}
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows="4"
                  name="description"
                  value={shopFormData.description}
                  onChange={handleShopChange}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de boutique
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STORE_TYPES).map(([key, typeId]) => (
                    <button
                      key={typeId}
                      type="button"
                      onClick={() => handleTypeToggle(typeId)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${shopFormData.shop_type.includes(typeId)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}
                    >
                      {STORE_TYPE_LABELS[typeId]}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleSaveShop}
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Informations personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nom complet"
                  name="full_name"
                  value={profileFormData.full_name}
                  onChange={handleProfileChange}
                />
                <Input
                  label="Téléphone"
                  name="phone"
                  value={profileFormData.phone}
                  onChange={handleProfileChange}
                />
              </div>
              <Input
                label="Email"
                name="email"
                value={profileFormData.email}
                onChange={handleProfileChange}
                disabled
              />
              <Button
                variant="primary"
                onClick={handleSaveProfile}
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer le profil'}
              </Button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Changer le mot de passe</h3>
              <Input
                label="Mot de passe actuel"
                type="password"
                placeholder="••••••••"
              />
              <Input
                label="Nouveau mot de passe"
                type="password"
                placeholder="••••••••"
              />
              <Input
                label="Confirmer le nouveau mot de passe"
                type="password"
                placeholder="••••••••"
              />
              <Button variant="primary">Mettre à jour le mot de passe</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
