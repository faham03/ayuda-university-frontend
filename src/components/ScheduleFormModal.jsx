import React, { useState, useEffect } from 'react';
import { X, Clock, MapPin, User, BookOpen } from 'lucide-react';
import { createSchedule, updateSchedule } from '../services/api';

export default function ScheduleFormModal({ isOpen, onClose, onSuccess, editingSchedule = null }) {
  const [formData, setFormData] = useState({
    filiere: '',
    year: '',
    day: '',
    course_name: '',
    professeur: '',
    salle: '',
    start_time: '',
    end_time: ''
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

  const DAY_CHOICES = [
    { value: 'lundi', label: 'Lundi' },
    { value: 'mardi', label: 'Mardi' },
    { value: 'mercredi', label: 'Mercredi' },
    { value: 'jeudi', label: 'Jeudi' },
    { value: 'vendredi', label: 'Vendredi' },
    { value: 'samedi', label: 'Samedi' }
  ];

  const SALLE_CHOICES = [
    { value: 'Salle A', label: 'Salle A' },
    { value: 'Salle B', label: 'Salle B' },
    { value: 'Salle C', label: 'Salle C' },
    { value: 'Salle D', label: 'Salle D' }
  ];

  // Pré-remplir le formulaire si on modifie un cours
  useEffect(() => {
    if (editingSchedule) {
      setFormData({
        filiere: editingSchedule.filiere,
        year: editingSchedule.year,
        day: editingSchedule.day,
        course_name: editingSchedule.course_name,
        professeur: editingSchedule.professeur || '',
        salle: editingSchedule.salle,
        start_time: editingSchedule.start_time.slice(0, 5), // "07:30:00" -> "07:30"
        end_time: editingSchedule.end_time.slice(0, 5)
      });
    } else {
      // Reset du formulaire pour création
      setFormData({
        filiere: '',
        year: '',
        day: '',
        course_name: '',
        professeur: '',
        salle: '',
        start_time: '',
        end_time: ''
      });
    }
    setErrors({});
  }, [editingSchedule, isOpen]);

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
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation des champs requis
    if (!formData.filiere) newErrors.filiere = 'Filière requise';
    if (!formData.year) newErrors.year = 'Année requise';
    if (!formData.day) newErrors.day = 'Jour requis';
    if (!formData.course_name.trim()) newErrors.course_name = 'Nom du cours requis';
    if (!formData.salle) newErrors.salle = 'Salle requise';
    if (!formData.start_time) newErrors.start_time = 'Heure de début requise';
    if (!formData.end_time) newErrors.end_time = 'Heure de fin requise';

    // Validation des horaires
    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}:00`);
      const end = new Date(`2000-01-01T${formData.end_time}:00`);
      
      if (start >= end) {
        newErrors.end_time = 'L\'heure de fin doit être après l\'heure de début';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Préparer les données avec les heures au format correct
      const submitData = {
        ...formData,
        start_time: `${formData.start_time}:00`,
        end_time: `${formData.end_time}:00`
      };

      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, submitData);
      } else {
        await createSchedule(submitData);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-0 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {editingSchedule ? 'Modifier le cours' : 'Nouveau cours'}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <option value="">-- Sélectionnez une filière --</option>
                {FILIERE_CHOICES.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.filiere && <p className="mt-1 text-sm text-red-600">{errors.filiere}</p>}
            </div>

            {/* Année */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
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
                <option value="">-- Sélectionnez une année --</option>
                {YEAR_CHOICES.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
            </div>

            {/* Jour */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Jour *
              </label>
              <select
                name="day"
                value={formData.day}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.day ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">-- Sélectionnez un jour --</option>
                {DAY_CHOICES.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.day && <p className="mt-1 text-sm text-red-600">{errors.day}</p>}
            </div>

            {/* Salle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Salle *
              </label>
              <select
                name="salle"
                value={formData.salle}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.salle ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">-- Sélectionnez une salle --</option>
                {SALLE_CHOICES.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.salle && <p className="mt-1 text-sm text-red-600">{errors.salle}</p>}
            </div>
          </div>

          {/* Nom du cours */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du cours *
            </label>
            <input
              type="text"
              name="course_name"
              value={formData.course_name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.course_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Ex: Algorithmes et structures de données"
              disabled={loading}
            />
            {errors.course_name && <p className="mt-1 text-sm text-red-600">{errors.course_name}</p>}
          </div>

          {/* Professeur */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professeur
            </label>
            <input
              type="text"
              name="professeur"
              value={formData.professeur}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Dr. Mme SOGNON"
              disabled={loading}
            />
          </div>

          {/* Horaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de début *
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.start_time ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.start_time && <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de fin *
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.end_time ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.end_time && <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  {editingSchedule ? 'Modification...' : 'Création...'}
                </div>
              ) : (
                editingSchedule ? 'Modifier' : 'Créer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}