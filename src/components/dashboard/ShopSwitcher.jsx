import React, { useState } from 'react';
import { ChevronDown, Plus, Store, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const ShopSwitcher = ({ isSidebarOpen = true }) => {
    const { shops, currentShop, switchShop } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    if (!shops || shops.length === 0) return null;

    const handleSwitch = (shopId) => {
        switchShop(shopId);
        setIsOpen(false);
        // Optionnel: recharger les données globales ou rediriger vers le dashboard
        navigate('/dashboard');
    };

    const handleAddNew = () => {
        setIsOpen(false);
        navigate('/dashboard', { state: { openCreateShop: true } });
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition p-2 ${isSidebarOpen ? 'space-x-3 justify-between' : 'justify-center whitespace-nowrap'
                    }`}
            >
                <div className="flex items-center space-x-3 truncate">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/40 rounded-lg flex items-center justify-center">
                        <Store className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    {isSidebarOpen && (
                        <div className="text-left truncate">
                            <p className="text-sm font-bold text-gray-800 dark:text-white leading-tight truncate">
                                {currentShop?.name || 'Sélectionner...'}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">
                                Boutique Active
                            </p>
                        </div>
                    )}
                </div>
                {isSidebarOpen && (
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden py-2">
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                Mes Boutiques ({shops.length})
                            </p>
                        </div>

                        <div className="max-h-64 overflow-y-auto">
                            {shops.map((shop) => (
                                <button
                                    key={shop.id}
                                    onClick={() => handleSwitch(shop.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-left ${currentShop?.id === shop.id ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentShop?.id === shop.id ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                                            }`}>
                                            <Store className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-semibold ${currentShop?.id === shop.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-200'
                                                }`}>
                                                {shop.name}
                                            </p>
                                            <p className="text-[10px] text-gray-500 line-clamp-1">{shop.description || 'Aucune description'}</p>
                                        </div>
                                    </div>
                                    {currentShop?.id === shop.id && <Check className="w-4 h-4 text-primary-600" />}
                                </button>
                            ))}
                        </div>

                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 px-2">
                            <button
                                onClick={handleAddNew}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Créer une nouvelle boutique</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ShopSwitcher;
