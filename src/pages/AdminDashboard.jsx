import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  Calendar, 
  BookOpen, 
  FileText, 
  Bell, 
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  BarChart3,
  TrendingUp,
  Clock,
  MapPin,
  Search,
  Filter
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ScheduleFormModal from '../components/ScheduleFormModal';
import { 
  fetchSchedule, 
  fetchGrades, 
  fetchEvents, 
  fetchReclamations, 
  fetchAdminRequests,
  deleteSchedule
} from '../services/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // États pour les modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  
  // État pour les statistiques
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    requests: 0,
    events: 0,
    averageGrade: 0,
    pendingReclamations: 0
  });

  // État pour les données des différentes sections
  const [data, setData] = useState({
    schedule: [],
    grades: [],
    events: [],
    reclamations: [],
    requests: []
  });

  // Filtres et recherche
  const [filters, setFilters] = useState({
    search: '',
    filiere: '',
    year: '',
    day: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger toutes les données
      const [scheduleData, gradesData, eventsData, reclamationsData, requestsData] = await Promise.all([
        fetchSchedule().catch(() => []),
        fetchGrades().catch(() => []),
        fetchEvents().catch(() => []),
        fetchReclamations().catch(() => []),
        fetchAdminRequests().catch(() => [])
      ]);

      setData({
        schedule: scheduleData || [],
        grades: gradesData || [],
        events: eventsData || [],
        reclamations: reclamationsData || [],
        requests: requestsData || []
      });

      // Calculer les statistiques
      const pendingReclamations = reclamationsData?.filter(r => r.status === 'en_attente').length || 0;
      const avgGrade = gradesData?.length > 0 
        ? (gradesData.reduce((sum, g) => sum + parseFloat(g.score), 0) / gradesData.length).toFixed(1)
        : 0;

      setStats({
        students: 145, // À adapter selon vos données
        courses: scheduleData?.length || 0,
        requests: requestsData?.length || 0,
        events: eventsData?.length || 0,
        averageGrade: avgGrade,
        pendingReclamations
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gestion du planning
  const handleCreateSchedule = () => {
    setEditingSchedule(null);
    setShowScheduleModal(true);
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setShowScheduleModal(true);
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      try {
        await deleteSchedule(id);
        await loadDashboardData(); // Recharger les données
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleScheduleSuccess = () => {
    loadDashboardData(); // Recharger les données après création/modification
  };

  // Filtrage des données
  const filteredSchedule = data.schedule.filter(course => {
    const matchesSearch = course.course_name.toLowerCase().includes(filters.search.toLowerCase()) ||
                         course.professeur?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesFiliere = !filters.filiere || course.filiere === filters.filiere;
    const matchesYear = !filters.year || course.year === filters.year;
    const matchesDay = !filters.day || course.day === filters.day;
    
    return matchesSearch && matchesFiliere && matchesYear && matchesDay;
  });

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'schedule', label: 'Emploi du temps', icon: Calendar },
    { id: 'grades', label: 'Notes', icon: BookOpen },
    { id: 'students', label: 'Étudiants', icon: Users },
    { id: 'requests', label: 'Demandes', icon: FileText },
    { id: 'reclamations', label: 'Réclamations', icon: X },
    { id: 'events', label: 'Événements', icon: Bell }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'course': return Calendar;
      case 'grade': return BookOpen;
      case 'request': return FileText;
      case 'student': return Users;
      default: return Bell;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5);
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
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Administrateur</h1>
          <p className="text-gray-600">Gérez votre établissement scolaire</p>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Étudiants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.students}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.courses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Demandes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.requests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Réclamations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReclamations}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
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
          
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Statistiques récentes */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Activité récente</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-900">{stats.courses} cours programmés</p>
                        <p className="text-xs text-gray-500">Planning mis à jour</p>
                      </div>
                    </div>
                    
                    {stats.pendingReclamations > 0 && (
                      <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
                        <X className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-900">{stats.pendingReclamations} réclamation(s) en attente</p>
                          <p className="text-xs text-gray-500">Nécessite votre attention</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                      <BookOpen className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-900">Moyenne générale: {stats.averageGrade}/20</p>
                        <p className="text-xs text-gray-500">Performance des étudiants</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions rapides */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={handleCreateSchedule}
                      className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Ajouter un cours
                    </button>
                    
                    <button className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-green-300 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                      <Plus className="h-5 w-5 mr-2" />
                      Ajouter des notes
                    </button>
                    
                    <button className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-purple-300 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <Plus className="h-5 w-5 mr-2" />
                      Créer un événement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Emploi du temps */}
          {activeTab === 'schedule' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-lg font-medium text-gray-900">Gestion de l'emploi du temps</h3>
                <button
                  onClick={handleCreateSchedule}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau cours
                </button>
              </div>

              {/* Filtres */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un cours..."
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                    />
                  </div>
                  
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={filters.filiere}
                    onChange={(e) => setFilters({...filters, filiere: e.target.value})}
                  >
                    <option value="">Toutes les filières</option>
                    <option value="informatique">Informatique</option>
                    <option value="droit">Droit</option>
                    <option value="gestion">Gestion</option>
                  </select>
                  
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={filters.year}
                    onChange={(e) => setFilters({...filters, year: e.target.value})}
                  >
                    <option value="">Toutes les années</option>
                    <option value="L1">Licence 1</option>
                    <option value="L2">Licence 2</option>
                    <option value="L3">Licence 3</option>
                  </select>
                  
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={filters.day}
                    onChange={(e) => setFilters({...filters, day: e.target.value})}
                  >
                    <option value="">Tous les jours</option>
                    <option value="lundi">Lundi</option>
                    <option value="mardi">Mardi</option>
                    <option value="mercredi">Mercredi</option>
                    <option value="jeudi">Jeudi</option>
                    <option value="vendredi">Vendredi</option>
                    <option value="samedi">Samedi</option>
                  </select>
                </div>
              </div>

              {/* Liste des cours */}
              <div className="p-6">
                {filteredSchedule.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {filters.search || filters.filiere || filters.year || filters.day
                        ? 'Aucun cours trouvé'
                        : 'Aucun cours programmé'
                      }
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {filters.search || filters.filiere || filters.year || filters.day
                        ? 'Essayez de modifier vos filtres'
                        : 'Commencez par ajouter des cours à votre planning'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSchedule.map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900">{course.course_name}</h4>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {course.filiere} {course.year}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {course.day} • {formatTime(course.start_time)} - {formatTime(course.end_time)}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {course.salle}
                              </div>
                              {course.professeur && (
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {course.professeur}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleEditSchedule(course)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Modifier"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSchedule(course.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Autres sections */}
          {['grades', 'students', 'requests', 'reclamations', 'events'].includes(activeTab) && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🚧</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Section {tabs.find(t => t.id === activeTab)?.label}
              </h3>
              <p className="text-gray-600 mb-4">
                Cette section sera développée avec toutes les fonctionnalités de gestion.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de création/modification de cours */}
      <ScheduleFormModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSuccess={handleScheduleSuccess}
        editingSchedule={editingSchedule}
      />
    </div>
  );
}