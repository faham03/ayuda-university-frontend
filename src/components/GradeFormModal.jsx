import React, { useState, useEffect } from 'react';
import { X, BookOpen, User, Award } from 'lucide-react';
import { createGrade, updateGrade } from '../services/api';
import GradeFormModal from '../components/GradeFormModal';
import ReclamationManagement from '../components/ReclamationManagement';

export default function GradeFormModal({ isOpen, onClose, onSuccess, editingGrade = null }) {
  const [formData, setFormData] = useState({
    student: '',
    filiere: '',
    year: '',
    subject: '',
    score: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Options pour les select
  const FILIERE_CHOICES = [
    { value: 'informatique', label: 'Informatique' },
    { value: 'droit', label: 'Droit' },
    { value: 'gestion', label: 'Gestion' }
  ];

  const YEAR_CHOICES = [
    { value: 'L1', label: 'Licence 1' },
    { value: 'L2', label: 'Licence 2' },
    { value: 'L3', label: 'Licence 3' }
  ];

  // Matières par filière
  const SUBJECTS_BY_FILIERE = {
    informatique: [
      'Programmation Python',
      'Algorithmes',
      'Base de données',
      'Réseaux',
      'Systèmes d\'exploitation',
      'Génie logiciel',
      'Intelligence artificielle',
      'Sécurité informatique'
    ],
    droit: [
      'Droit civil',
      'Droit pénal',
      'Droit commercial',
      'Droit constitutionnel',
      'Droit international',
      'Procédure civile',
      'Droit du travail'
    ],
    gestion: [
      'Comptabilité',
      'Marketing',
      'Finance',
      'Management',
      'Économie',
      'Statistiques',
      'Ressources humaines',
      'Stratégie d\'entreprise'
    ]
  };

  // Pré-remplir le formulaire si on modifie une note
  useEffect(() => {
    if (editingGrade) {
      setFormData({
        student: editingGrade.student,
        filiere: editingGrade.filiere,
        year: editingGrade.year,
        subject: editingGrade.subject,
        score: editingGrade.score.toString()
      });
    } else {
      // Reset du formulaire pour création
      setFormData({
        student: '',
        filiere: '',
        year: '',
        subject: '',
        score: ''
      });
    }
    setErrors({});
  }, [editingGrade, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Reset du sujet si la filière change
    if (name === 'filiere') {
      setFormData(prev => ({
        ...prev,
        subject: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation des champs requis
    if (!formData.student) newErrors.student = 'Étudiant requis';
    if (!formData.filiere) newErrors.filiere = 'Filière requise';
    if (!formData.year) newErrors.year = 'Année requise';
    if (!formData.subject.trim()) newErrors.subject = 'Matière requise';
    if (!formData.score) newErrors.score = 'Note requise';

    // Validation de la note
    const score = parseFloat(formData.score);
    if (isNaN(score) || score < 0 || score > 20) {
      newErrors.score = 'La note doit être entre 0 et 20';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        score: parseFloat(formData.score)
      };

      if (editingGrade) {
        await updateGrade(editingGrade.id, submitData);
      } else {
        await createGrade(submitData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      
      // Gestion des erreurs de validation du backend
      if (error.response?.data) {
        const backendErrors = error.response.data;
        if (typeof backendErrors === 'object') {
          setErrors(backendErrors);
        } else {
          setErrors({ general: backendErrors });
        }
      } else {
        setErrors({ general: 'Erreur lors de la sauvegarde' });
      }
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return 'text-gray-600';
    if (numScore >= 16) return 'text-green-600';
    if (numScore >= 12) return 'text-blue-600';
    if (numScore >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score) => {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return '';
    if (numScore >= 16) return 'Excellent';
    if (numScore >= 12) return 'Bien';
    if (numScore >= 10) return 'Assez bien';
    return 'Insuffisant';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-0 border w-full max-w-lg shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {editingGrade ? 'Modifier la note' : 'Nouvelle note'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Erreur générale */}
          {errors.general && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {errors.general}
            </div>
          )}

          {/* Étudiant - Pour l'instant un input text, à adapter selon votre système */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              ID Étudiant *
            </label>
            <input
              type="number"
              name="student"
              value={formData.student}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.student ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="ID de l'étudiant"
              disabled={loading}
            />
            {errors.student && <p className="mt-1 text-sm text-red-600">{errors.student}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Entrez l'ID numérique de l'étudiant (ex: 14 pour boris)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Filière */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="inline h-4 w-4 mr-1" />
                Filière *
              </label>
              <select
                name="filiere"
                value={formData.filiere}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.filiere ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">-- Sélectionnez --</option>
                {FILIERE_CHOICES.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.filiere && <p className="mt-1 text-sm text-red-600">{errors.filiere}</p>}
            </div>

            {/* Année */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Année *
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.year ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">-- Sélectionnez --</option>
                {YEAR_CHOICES.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
            </div>
          </div>

          {/* Matière */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matière *
            </label>
            {formData.filiere ? (
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">-- Sélectionnez une matière --</option>
                {SUBJECTS_BY_FILIERE[formData.filiere]?.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Nom de la matière"
                disabled={loading}
              />
            )}
            {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
          </div>

          {/* Note */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Award className="inline h-4 w-4 mr-1" />
              Note * <span className="text-xs text-gray-500">(sur 20)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="score"
                value={formData.score}
                onChange={handleInputChange}
                min="0"
                max="20"
                step="0.25"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.score ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0.00"
                disabled={loading}
              />
              {formData.score && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className={`text-sm font-medium ${getScoreColor(formData.score)}`}>
                    {getScoreLabel(formData.score)}
                  </span>
                </div>
              )}
            </div>
            {errors.score && <p className="mt-1 text-sm text-red-600">{errors.score}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Utilisez des décimales si nécessaire (ex: 15.5)
            </p>
          </div>

          {/* Prévisualisation */}
          {formData.score && formData.subject && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Prévisualisation</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-900">{formData.subject}</p>
                  <p className="text-xs text-gray-500">
                    {formData.filiere && FILIERE_CHOICES.find(f => f.value === formData.filiere)?.label} • {formData.year}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline">
                    <span className={`text-lg font-bold ${getScoreColor(formData.score)}`}>
                      {formData.score}
                    </span>
                    <span className="text-gray-500 ml-1">/20</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    parseFloat(formData.score) >= 16 ? 'bg-green-100 text-green-800' :
                    parseFloat(formData.score) >= 12 ? 'bg-blue-100 text-blue-800' :
                    parseFloat(formData.score) >= 10 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {getScoreLabel(formData.score)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Boutons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  {editingGrade ? 'Modification...' : 'Création...'}
                </div>
              ) : (
                editingGrade ? 'Modifier' : 'Créer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}