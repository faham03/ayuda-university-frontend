import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8 mr-2" />
            <span className="text-xl font-bold">Ayuda</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm opacity-90">
              {user.username} ({user.role === 'admin' ? 'Administrateur' : 'Étudiant'})
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 hover:bg-white/20 px-3 py-2 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}