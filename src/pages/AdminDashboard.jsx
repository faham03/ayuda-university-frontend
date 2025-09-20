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
  Filter,
  Mail,
  User
} from 'lucide-react';
import Navbar from '../components/Navbar';
import ScheduleFormModal from '../components/ScheduleFormModal';
import GradeFormModal from '../components/GradeFormModal';
import ReclamationManagement from '../components/ReclamationManagement';
import { 
  fetchSchedule, 
  fetchGrades, 
  fetchEvents, 
  fetchReclamations, 
  fetchAdminRequests,
  deleteSchedule,
  fetchUsers,
  updateRequest,
  deleteEvent
} from '../services/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // États pour les modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  
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
    requests: [],
    students: []
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
      const [scheduleData, gradesData, eventsData, reclamationsData, requestsData, studentsData] = await Promise.all([
        fetchSchedule().catch(() => []),
        fetchGrades().catch(() => []),
        fetchEvents().catch(() => []),
        fetchReclamations().catch(() => []),
        fetchAdminRequests().catch(() => []),
        fetchUsers().catch(() => [])
      ]);

      setData({
        schedule: scheduleData || [],
        grades: gradesData || [],
        events: eventsData || [],
        reclamations: reclamationsData || [],
        requests: requestsData || [],
        students: studentsData || []
      });

      // Calculer les statistiques
      const pendingReclamations = reclamationsData?.filter(r => r.status === 'en_attente').length || 0;
      const avgGrade = gradesData?.length > 0 
        ? (gradesData.reduce((sum, g) => sum + parseFloat(g.score), 0) / gradesData.length).toFixed(1)
        : 0;

      setStats({
        students: studentsData?.length || 0,
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

  // Gestion des notes
  const handleCreateGrade = () => {
    setEditingGrade(null);
    setShowGradeModal(true);
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
                    
                    <button 
                      onClick={handleCreateGrade}
                      className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-green-300 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
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

          {/* Section Notes */}
          {activeTab === 'grades' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestion des notes</h3>
                <button 
                  onClick={handleCreateGrade}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nouvelle note
                </button>
              </div>
              <div className="p-6">
                <p className="text-gray-600">Interface de gestion des notes en cours de développement...</p>
              </div>
            </div>
          )}

          {/* Section Étudiants */}
          {activeTab === 'students' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Liste des étudiants ({data.students.length})
                </h3>
              </div>
              <div className="p-6">
                {data.students.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun étudiant trouvé</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Les étudiants inscrits apparaîtront ici
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {data.students.map((student) => (
                      <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900">{student.username}</h4>
                                <span className="text-sm text-gray-500">ID: {student.id}</span>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <p className="text-sm text-gray-600">{student.email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              student.role === 'admin' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {student.role === 'admin' ? 'Administrateur' : 'Étudiant'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section Réclamations */}
          {activeTab === 'reclamations' && (
            <div>
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Réclamations des étudiants</h3>
              </div>
              <div className="p-6">
                <ReclamationManagement 
                  reclamations={data.reclamations}
                  onUpdate={loadDashboardData}
                />
              </div>
            </div>
          )}

          {/* Section Demandes */}
{activeTab === 'requests' && (
  <div>
    <div className="px-6 py-4 border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">
        Demandes administratives ({data.requests.length})
      </h3>
    </div>
    <div className="p-6">
      {data.requests.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune demande</h3>
          <p className="mt-1 text-sm text-gray-500">
            Les demandes des étudiants apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filtres par statut */}
          <div className="flex space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-gray-600">
                En attente ({data.requests.filter(r => r.status === 'pending').length})
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Acceptées ({data.requests.filter(r => r.status === 'accepted').length})
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Rejetées ({data.requests.filter(r => r.status === 'rejected').length})
              </span>
            </div>
          </div>

          {/* Liste des demandes */}
          {data.requests.map((request) => (
            <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <h4 className="font-medium text-gray-900">{request.request_type}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      request.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : request.status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {request.status === 'pending' ? 'En attente' : 
                       request.status === 'accepted' ? 'Acceptée' : 'Rejetée'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>Étudiant ID: {request.student}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {request.description && (
                    <div className="bg-gray-50 rounded p-3 mt-2">
                      <p className="text-sm text-gray-700">{request.description}</p>
                    </div>
                  )}
                </div>

                {/* Actions pour les demandes en attente */}
                {request.status === 'pending' && (
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={async () => {
                        try {
                          await updateRequest(request.id, { status: 'accepted' });
                          await loadDashboardData();
                        } catch (error) {
                          alert('Erreur lors de l\'acceptation');
                        }
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                      title="Accepter la demande"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Accepter
                    </button>
                    
                    <button
                      onClick={async () => {
                        try {
                          await updateRequest(request.id, { status: 'rejected' });
                          await loadDashboardData();
                        } catch (error) {
                          alert('Erreur lors du rejet');
                        }
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                      title="Rejeter la demande"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Rejeter
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}


{/* Section Événements */}
{activeTab === 'events' && (
  <div>
    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h3 className="text-lg font-medium text-gray-900">
        Gestion des événements ({data.events.length})
      </h3>
      <button
        onClick={() => {
          // Fonction à créer pour ouvrir le modal d'événement
          console.log('Créer un événement');
        }}
        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
      >
        <Plus className="h-4 w-4 mr-1" />
        Nouvel événement
      </button>
    </div>
    
    <div className="p-6">
      {data.events.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun événement</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par créer votre premier événement
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filtres par type */}
          <div className="flex space-x-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Académique ({data.events.filter(e => e.event_type === 'ACADEMIC').length})
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Sport ({data.events.filter(e => e.event_type === 'SPORT').length})
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Culturel ({data.events.filter(e => e.event_type === 'CULTURAL').length})
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
              <span className="text-sm text-gray-600">
                Externe ({data.events.filter(e => e.event_type === 'EXTERNAL').length})
              </span>
            </div>
          </div>

          {/* Liste des événements */}
          {data.events.map((event) => (
            <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bell className="h-4 w-4 text-purple-500" />
                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      event.event_type === 'ACADEMIC' 
                        ? 'bg-blue-100 text-blue-800'
                        : event.event_type === 'SPORT'
                        ? 'bg-green-100 text-green-800'
                        : event.event_type === 'CULTURAL'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {event.event_type === 'ACADEMIC' ? 'Académique' :
                       event.event_type === 'SPORT' ? 'Sport' :
                       event.event_type === 'CULTURAL' ? 'Culturel' : 'Externe'}
                    </span>
                    
                    {/* Badge statut */}
                    {event.is_ongoing && (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">
                        En cours
                      </span>
                    )}
                    {event.is_upcoming && !event.is_ongoing && (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">
                        À venir
                      </span>
                    )}
                    {!event.is_upcoming && !event.is_ongoing && (
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 font-medium">
                        Terminé
                      </span>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(event.start_date).toLocaleDateString()} à {new Date(event.start_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>
                        Fin: {new Date(event.end_date).toLocaleDateString()} à {new Date(event.end_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => {
                      // Fonction à créer pour modifier l'événement
                      console.log('Modifier événement', event.id);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Modifier"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
                        try {
                          await deleteEvent(event.id);
                          await loadDashboardData();
                        } catch (error) {
                          alert('Erreur lors de la suppression');
                        }
                      }
                    }}
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

      {/* Statistiques des événements */}
      {data.events.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Statistiques des événements</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.events.filter(e => e.event_type === 'ACADEMIC').length}
              </div>
              <div className="text-xs text-gray-500">Académiques</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.events.filter(e => e.event_type === 'SPORT').length}
              </div>
              <div className="text-xs text-gray-500">Sport</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.events.filter(e => e.event_type === 'CULTURAL').length}
              </div>
              <div className="text-xs text-gray-500">Culturels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {data.events.filter(e => e.event_type === 'EXTERNAL').length}
              </div>
              <div className="text-xs text-gray-500">Externes</div>
            </div>
          </div>
        </div>
      )}
    </div>
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

      {/* Modal de création/modification de notes */}
      <GradeFormModal
        isOpen={showGradeModal}
        onClose={() => setShowGradeModal(false)}
        onSuccess={loadDashboardData}
        editingGrade={editingGrade}
      />
    </div>
  );
}