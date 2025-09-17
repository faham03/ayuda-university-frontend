import React, { useState } from 'react';
import { Check, X, MessageCircle, User, BookOpen, Calendar } from 'lucide-react';
import { updateReclamation } from '../services/api';

export default function ReclamationManagement({ reclamations, onUpdate }) {
  const [processingId, setProcessingId] = useState(null);

  const handleUpdateStatus = async (id, newStatus) => {
    setProcessingId(id);
    try {
      await updateReclamation(id, { status: newStatus });
      onUpdate(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status) => {
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

  if (reclamations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune réclamation</h3>
        <p className="mt-1 text-sm text-gray-500">
          Les réclamations des étudiants apparaîtront ici
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres par statut */}
      <div className="flex space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <span className="text-sm text-gray-600">
            En attente ({reclamations.filter(r => r.status === 'en_attente').length})
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span className="text-sm text-gray-600">
            Acceptées ({reclamations.filter(r => r.status === 'acceptee').length})
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          <span className="text-sm text-gray-600">
            Rejetées ({reclamations.filter(r => r.status === 'rejettee').length})
          </span>
        </div>
      </div>

      {/* Liste des réclamations */}
      <div className="space-y-4">
        {reclamations.map((reclamation) => (
          <div key={reclamation.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              {/* Informations de la réclamation */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {reclamation.student_name || `Étudiant #${reclamation.student}`}
                    </span>
                  </div>
                  
                  {reclamation.grade_info && (
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-blue-600">
                        {reclamation.grade_info.subject} - {reclamation.grade_info.score}/20
                      </span>
                    </div>
                  )}
                  
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(reclamation.status)}`}>
                    {getStatusText(reclamation.status)}
                  </span>
                </div>

                {/* Message de la réclamation */}
                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Message de l'étudiant :</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{reclamation.message}</p>
                </div>

                {/* Métadonnées */}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Créée le {new Date(reclamation.created_at).toLocaleDateString()}</span>
                  </div>
                  {reclamation.updated_at !== reclamation.created_at && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Mise à jour le {new Date(reclamation.updated_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {reclamation.status === 'en_attente' && (
                <div className="flex items-center space-x-2 ml-6">
                  <button
                    onClick={() => handleUpdateStatus(reclamation.id, 'acceptee')}
                    disabled={processingId === reclamation.id}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    title="Accepter la réclamation"
                  >
                    {processingId === reclamation.id ? (
                      <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-1"></div>
                    ) : (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    Accepter
                  </button>
                  
                  <button
                    onClick={() => handleUpdateStatus(reclamation.id, 'rejettee')}
                    disabled={processingId === reclamation.id}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    title="Rejeter la réclamation"
                  >
                    {processingId === reclamation.id ? (
                      <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-1"></div>
                    ) : (
                      <X className="h-3 w-3 mr-1" />
                    )}
                    Rejeter
                  </button>
                </div>
              )}
            </div>

            {/* Indication du statut traité */}
            {reclamation.status !== 'en_attente' && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  {reclamation.status === 'acceptee' 
                    ? '✓ Réclamation acceptée - L\'étudiant a été notifié' 
                    : '✗ Réclamation rejetée - L\'étudiant a été notifié'
                  }
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Statistiques */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Statistiques des réclamations</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {reclamations.filter(r => r.status === 'en_attente').length}
            </div>
            <div className="text-xs text-gray-500">En attente</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {reclamations.filter(r => r.status === 'acceptee').length}
            </div>
            <div className="text-xs text-gray-500">Acceptées</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {reclamations.filter(r => r.status === 'rejettee').length}
            </div>
            <div className="text-xs text-gray-500">Rejetées</div>
          </div>
        </div>
      </div>
    </div>
  );
}