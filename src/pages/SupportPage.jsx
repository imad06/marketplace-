// ============================================
// frontend/src/pages/SupportPage.jsx
// ============================================
import React from 'react';
import { HelpCircle, Mail, MessageCircle, Book } from 'lucide-react';
import Button from '../components/common/Button';

const SupportPage = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Support</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Besoin d'aide ? Consultez nos ressources ou contactez notre équipe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 hover:shadow-lg transition border border-transparent dark:border-gray-800">
          <HelpCircle className="w-12 h-12 text-primary-600 dark:text-primary-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2 dark:text-white">Centre d'aide</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Consultez notre base de connaissances pour trouver des réponses.
          </p>
          <Button variant="outline" size="sm">
            Consulter
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 hover:shadow-lg transition border border-transparent dark:border-gray-800">
          <MessageCircle className="w-12 h-12 text-green-600 dark:text-green-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2 dark:text-white">Chat en direct</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Discutez avec notre équipe de support en temps réel.
          </p>
          <Button variant="outline" size="sm">
            Démarrer
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 hover:shadow-lg transition border border-transparent dark:border-gray-800">
          <Mail className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2 dark:text-white">Email</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Envoyez-nous un email, nous vous répondrons rapidement.
          </p>
          <Button variant="outline" size="sm">
            Contacter
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-transparent dark:border-gray-800">
        <div className="flex items-start space-x-4">
          <Book className="w-8 h-8 text-primary-600 dark:text-primary-400 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Documentation</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Accédez à notre documentation complète pour tirer le meilleur parti de la plateforme.
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                Guide de démarrage rapide
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                Gestion des produits
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                Traitement des commandes
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                Configuration des paiements
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;