import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';
import { Store } from 'lucide-react';
import './Auth.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

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

      <div className="auth-card">
        <div className="text-center mb-8">
          <div className="auth-icon-wrapper">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="auth-title">Bon retour !</h2>
          <p className="auth-subtitle">Accédez à votre espace vendeur</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          <Button
            type="submit"
            className="auth-btn mt-4"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Se connecter'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[#9ea3c8] text-sm">
            Pas encore de compte ?{' '}
            <Link to="/register" className="auth-link">
              Créer ma boutique
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;