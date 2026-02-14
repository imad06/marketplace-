// frontend/src/pages/MessagesPage.jsx - Version connectée à la BDD
import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Search, Plus, X, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import supabaseService from '../services/supabase.service';
import { formatDateTime } from '../utils/helpers';

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewMessageForm, setShowNewMessageForm] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    message: '',
    priority: 'normal'
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await supabaseService.getMessages();
      if (response.success) {
        setMessages(response.data || []);
      } else {
        setError('Impossible de charger les messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Erreur de chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMessage = async (e) => {
    e.preventDefault();
    setError('');

    if (!newMessage.subject.trim() || !newMessage.message.trim()) {
      setError('Le sujet et le message sont requis');
      return;
    }

    try {
      const response = await supabaseService.createMessage(newMessage);
      if (response.success) {
        setSuccessMessage('Message créé avec succès');
        setNewMessage({ subject: '', message: '', priority: 'normal' });
        setShowNewMessageForm(false);
        fetchMessages();
      } else {
        setError(response.message || 'Erreur lors de la création');
      }
    } catch (error) {
      console.error('Error creating message:', error);
      setError('Impossible de créer le message');
    }
  };

  const handleUpdateStatus = async (messageId, newStatus) => {
    try {
      const response = await supabaseService.updateMessageStatus(messageId, newStatus);
      if (response.success) {
        setSuccessMessage('Statut mis à jour');
        fetchMessages();
        // Mettre à jour le message sélectionné
        if (selectedMessage?.id === messageId) {
          setSelectedMessage({ ...selectedMessage, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Impossible de mettre à jour le statut');
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'open': return 'Ouvert';
      case 'in_progress': return 'En cours';
      case 'resolved': return 'Résolu';
      case 'closed': return 'Fermé';
      default: return status;
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-20" />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Messages & Support</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez vos demandes de support et messages
        </p>
      </div>

      {/* Messages d'état */}
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Liste des messages */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
          {/* Header de la liste */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800 dark:text-white">Tous les messages</h2>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowNewMessageForm(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Nouveau
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Liste scrollable */}
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-700" />
                <p className="text-sm">
                  {searchTerm ? 'Aucun message trouvé' : 'Aucun message'}
                </p>
                {!searchTerm && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowNewMessageForm(true)}
                    className="mt-3"
                  >
                    Créer un message
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredMessages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition text-left ${selectedMessage?.id === msg.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-600'
                      : ''
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className={`font-semibold truncate pr-2 ${selectedMessage?.id === msg.id ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'
                        }`}>
                        {msg.subject}
                      </p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-medium ${getPriorityColor(msg.priority)}`}>
                        {msg.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {msg.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {formatDateTime(msg.created_at)}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusColor(msg.status)}`}>
                        {getStatusLabel(msg.status)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Détail du message */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
          {selectedMessage ? (
            <>
              {/* Header du détail */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedMessage.subject}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span>Créé le {formatDateTime(selectedMessage.created_at)}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(selectedMessage.priority)}`}>
                        Priorité: {selectedMessage.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(selectedMessage.status)}`}>
                        {getStatusLabel(selectedMessage.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenu du message */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              {/* Actions au bas du message */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Modifier le statut :</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMessage.status !== 'in_progress' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedMessage.id, 'in_progress')}
                      >
                        En cours
                      </Button>
                    )}
                    {selectedMessage.status !== 'resolved' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedMessage.id, 'resolved')}
                      >
                        Résoudre
                      </Button>
                    )}
                    {selectedMessage.status !== 'closed' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedMessage.id, 'closed')}
                      >
                        Fermer
                      </Button>
                    )}
                    {selectedMessage.status === 'closed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(selectedMessage.id, 'open')}
                      >
                        Réouvrir
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 p-8">
              <div className="text-center max-w-xs">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pas de message sélectionné</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choisissez une demande dans la liste de gauche pour voir les échanges.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nouveau Message */}
      {showNewMessageForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 dark:border-gray-800 animate-scale-in">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Nouveau message</h2>
              <button
                onClick={() => {
                  setShowNewMessageForm(false);
                  setNewMessage({ subject: '', message: '', priority: 'normal' });
                  setError('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-gray-500 dark:text-gray-400"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateMessage} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sujet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                    placeholder="Ex: Problème avec une commande"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priorité
                  </label>
                  <select
                    value={newMessage.priority}
                    onChange={(e) => setNewMessage({ ...newMessage, priority: e.target.value })}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                  >
                    <option value="low">Basse</option>
                    <option value="normal">Normale</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newMessage.message}
                    onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                    rows="6"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none"
                    placeholder="Décrivez votre demande en détail..."
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button type="submit" variant="primary" className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer le message
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowNewMessageForm(false);
                    setNewMessage({ subject: '', message: '', priority: 'normal' });
                    setError('');
                  }}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;