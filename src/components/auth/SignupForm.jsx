import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';
import { Store } from 'lucide-react';
import { STORE_TYPES, STORE_TYPE_LABELS } from '../../utils/constants';

const SignupForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    shop_name: '',
    shop_type: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTypeChange = (typeId) => {
    const newTypes = formData.shop_type.includes(typeId)
      ? formData.shop_type.filter(t => t !== typeId)
      : [...formData.shop_type, typeId];
    setFormData({ ...formData, shop_type: newTypes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (formData.shop_type.length === 0) {
      setError('Veuillez sélectionner au moins un type de boutique');
      return;
    }

    setLoading(true);

    const result = await register({
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
      shop_name: formData.shop_name,
      shop_type: formData.shop_type
    });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-white/20 dark:border-gray-800">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Inscription</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Créez votre boutique en ligne</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Nom complet"
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Jean Dupont"
            required
          />

          <Input
            label="Nom de la boutique"
            type="text"
            name="shop_name"
            value={formData.shop_name}
            onChange={handleChange}
            placeholder="Ma Super Boutique"
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type de boutique
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STORE_TYPES).map(([key, typeId]) => (
                <button
                  key={typeId}
                  type="button"
                  onClick={() => handleTypeChange(typeId)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${formData.shop_type.includes(typeId)
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  {STORE_TYPE_LABELS[typeId]}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="votre@email.com"
            required
          />

          <Input
            label="Mot de passe"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <Input
            label="Confirmer le mot de passe"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" /> : "S'inscrire"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Déjà un compte ?{' '}
            <a href="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;