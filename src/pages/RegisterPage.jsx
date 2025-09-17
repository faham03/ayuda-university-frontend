import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { register } from '../services/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation côté client
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      console.log('Inscription réussie:', userData);
      
      // Redirection vers login avec message de succès
      navigate('/login', { 
        state: { 
          message: `Inscription réussie ! Bienvenue ${userData.username}. Vous pouvez maintenant vous connecter.` 
        } 
      });
      
    } catch (err) {
      console.error('Erreur d\'inscription:', err);
      
      // Gestion des erreurs spécifiques du backend
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (errorData.username) {
          setError(`Nom d'utilisateur : ${errorData.username[0]}`);
        } else if (errorData.email) {
          setError(`Email : ${errorData.email[0]}`);
        } else if (errorData.password) {
          setError(`Mot de passe : ${errorData.password[0]}`);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else {
          setError('Erreur lors de l\'inscription. Vérifiez vos informations.');
        }
      } else {
        setError('Erreur de connexion. Vérifiez votre connexion internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Effacer l'erreur quand l'utilisateur modifie le formulaire
    if (error) setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-2xl">
        <div className="text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Inscription
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Créez votre compte étudiant
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                name="username"
                required
                minLength={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.username}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Votre nom d'utilisateur"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="votre.email@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Au moins 6 caractères"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300'
                }`}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Répétez votre mot de passe"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Les mots de passe ne correspondent pas</p>
              )}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading || (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword)}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Inscription...
              </div>
            ) : (
              'S\'inscrire'
            )}
          </button>
          
          <div className="text-center">
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-500 text-sm"
              tabIndex={loading ? -1 : 0}
            >
              Déjà un compte ? Connectez-vous
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}