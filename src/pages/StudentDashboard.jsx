import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, Bell, AlertCircle, Clock, Plus, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { 
  fetchSchedule, 
  fetchGrades, 
  fetchEvents, 
  fetchReclamations,
  createReclamation 
} from '../services/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    schedule: [],
    grades: [],
    events: [],
    reclamations: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('schedule');
  const [showReclamationForm, setShowReclamationForm] = useState(false);

  // Formulaire de réclamation
  const [reclamationForm, setReclamationForm] = useState({
    grade: '',
    message: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger toutes les données en parallèle
      const [scheduleData, gradesData, eventsData, reclamationsData] = await Promise.all([
        fetchSchedule().catch(err => {
          console.error('Erreur schedule:', err);
          return [];
        }),
        fetchGrades().catch(err => {
          console.error('Erreur grades:', err);
          return [];
        }),
        fetchEvents().catch(err => {
          console.error('Erreur events:', err);
          return [];
        }),
        fetchReclamations().catch(err => {
          console.error('Erreur reclamations:', err);
          return [];
        })
      ]);
      
      setData({
        schedule: scheduleData || [],
        grades: gradesData || [],
        events: eventsData || [],
        reclamations: reclamationsData || []
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReclamation = async (e) => {
    e.preventDefault();
    try {
      await createReclamation(reclamationForm);
      setShowReclamationForm(false);
      setReclamationForm({ grade: '', message: '' });
      await loadData(); // Recharger les données
      alert('Réclamation envoyée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      alert('Erreur lors de l\'envoi de la réclamation');
    }
  };

  // Filtrer l'emploi du temps selon l'utilisateur connecté (si nécessaire)
  const filteredSchedule = data.schedule; // Pour l'instant on affiche tout, à adapter selon votre logique

  const tabs = [
    { id: 'schedule', label: 'Emploi du temps', icon: Calendar, color: 'blue' },
    { id: 'grades', label: 'Notes', icon: BookOpen, color: 'green' },
    { id: 'events', label: 'Événements', icon: Bell, color: 'purple' },
    { id: 'reclamations', label: 'Réclamations', icon: AlertCircle, color: 'red' }
  ];

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'en_attente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'acceptee': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejettee': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'en_attente': return 'En attente';
      case 'acceptee': return 'Acceptée';
      case 'rejettee': return 'Rejetée';
      default: return status;
    }
  };

  // Formatage du temps
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // "07:30:00" -> "07:30"
  };

  // Calcul de la moyenne
  const calculateAverage = () => {
    if (data.grades.length === 0) return 0;
    const sum = data.grades.reduce((acc, grade) => acc + parseFloat(grade.score), 0);
    return (sum / data.grades.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête avec nom utilisateur */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue {user?.username}
          </h1>
          <p className="text-gray-600">Voici votre tableau de bord étudiant</p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cours</p>
                <p className="text-2xl font-bold text-gray-900">{filteredSchedule.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Moyenne générale</p>
                <p className="text-2xl font-bold text-gray-900">
                  {data.grades.length > 0 ? calculateAverage() : '--'}/20
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Événements</p>
                <p className="text-2xl font-bold text-gray-900">{data.events.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Réclamations</p>
                <p className="text-2xl font-bold text-gray-900">{data.reclamations.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? `border-${tab.color}-500 text-${tab.color}-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          
          {/* Emploi du temps */}
          {activeTab === 'schedule' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Mon emploi du temps</h3>
              </div>
              <div className="p-6">
                {filteredSchedule.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun cours</h3>
                    <p className="mt-1 text-sm text-gray-500">Votre emploi du temps apparaîtra ici</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSchedule.map((course) => (
                      <div key={course.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900">{course.course_name}</h4>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {course.filiere} {course.year}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium capitalize">{course.day}</span> • 
                            {formatTime(course.start_time)} - {formatTime(course.end_time)} • 
                            {course.salle}
                          </p>
                          {course.professeur && (
                            <p className="text-sm text-blue-600 mt-1">Prof: {course.professeur}</p>
                          )}
                        </div>
                        <Clock className="h-5 w-5 text-blue-500 ml-4" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {activeTab === 'grades' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Mes notes</h3>
              </div>
              <div className="p-6">
                {data.grades.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune note</h3>
                    <p className="mt-1 text-sm text-gray-500">Vos notes apparaîtront ici une fois saisies</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.grades.map((grade) => (
                      <div key={grade.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{grade.subject}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {grade.filiere} • {grade.year}
                          </p>
                          {grade.created_at && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(grade.created_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="flex items-baseline">
                            <span className="text-2xl font-bold text-green-600">{grade.score}</span>
                            <span className="text-gray-500 ml-1">/20</span>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                            grade.score >= 16 ? 'bg-green-100 text-green-800' :
                            grade.score >= 12 ? 'bg-yellow-100 text-yellow-800' :
                            grade.score >= 10 ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {grade.score >= 16 ? 'Excellent' :
                             grade.score >= 12 ? 'Bien' :
                             grade.score >= 10 ? 'Assez bien' : 'Insuffisant'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Événements */}
          {activeTab === 'events' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Événements</h3>
              </div>
              <div className="p-6">
                {data.events.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun événement</h3>
                    <p className="mt-1 text-sm text-gray-500">Les événements de l'école apparaîtront ici</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.events.map((event) => (
                      <div key={event.id} className="flex items-start justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          {event.description && (
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          )}
                          <p className="text-sm text-purple-600 mt-2">
                            {new Date(event.start_date).toLocaleDateString()} à {new Date(event.start_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {event.location}
                          </p>
                        </div>
                        <Bell className="h-5 w-5 text-purple-500 mt-1 ml-4" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Réclamations - même code que précédemment */}
          {activeTab === 'reclamations' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Mes réclamations</h3>
                {data.grades.length > 0 && (
                  <button
                    onClick={() => setShowReclamationForm(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nouvelle réclamation
                  </button>
                )}
              </div>
              
              <div className="p-6">
                {data.reclamations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune réclamation</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {data.grades.length > 0 
                        ? 'Vous pouvez contester vos notes ici' 
                        : 'Vous devez d\'abord avoir des notes pour faire une réclamation'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.reclamations.map((reclamation) => (
                      <div key={reclamation.id} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{reclamation.message}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Créée le {new Date(reclamation.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(reclamation.status)}`}>
                            {getStatusText(reclamation.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Modal de création de réclamation */}
                {showReclamationForm && (
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                      <div className="mt-3">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Nouvelle réclamation</h3>
                        <form onSubmit={handleCreateReclamation}>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Note à contester
                            </label>
                            <select
                              required
                              value={reclamationForm.grade}
                              onChange={(e) => setReclamationForm({...reclamationForm, grade: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">-- Sélectionnez une note --</option>
                              {data.grades.map((grade) => (
                                <option key={grade.id} value={grade.id}>
                                  {grade.subject} - {grade.score}/20
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Message
                            </label>
                            <textarea
                              required
                              rows={4}
                              value={reclamationForm.message}
                              onChange={(e) => setReclamationForm({...reclamationForm, message: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Expliquez votre réclamation..."
                            />
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setShowReclamationForm(false);
                                setReclamationForm({ grade: '', message: '' });
                              }}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                              Annuler
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Envoyer
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}