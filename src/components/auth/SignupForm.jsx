import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';
import { Store } from 'lucide-react';
import { STORE_TYPES, STORE_TYPE_LABELS } from '../../utils/constants';
import './Auth.css';

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
    <div className="auth-root">
      {/* Animated Blobs */}
      <div className="auth-blob auth-blob--1"></div>
      <div className="auth-blob auth-blob--2"></div>

      <div className="auth-card" style={{ maxWidth: '540px' }}>
        <div className="text-center mb-8">
          <div className="auth-icon-wrapper">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="auth-title">Créer votre boutique</h2>
          <p className="auth-subtitle">Rejoignez la Marketplace en quelques instants</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#e2e3f5] mb-3">
              Type de boutique
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STORE_TYPES).map(([key, typeId]) => (
                <button
                  key={typeId}
                  type="button"
                  onClick={() => handleTypeChange(typeId)}
                  className={`auth-pill ${formData.shop_type.includes(typeId) ? 'active' : ''}`}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <Button
            type="submit"
            className="auth-btn mt-6"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" /> : "S'inscrire"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[#9ea3c8] text-sm">
            Déjà un compte ?{' '}
            <Link to="/login" className="auth-link">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;