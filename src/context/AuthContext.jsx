import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { supabase } from '../config/supabase.config';
import supabaseService from '../services/supabase.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [shops, setShops] = useState([]);
  const [currentShop, setCurrentShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const justLoggedInRef = useRef(false);
  const isCheckingAuthRef = useRef(false);
  const currentShopRef = useRef(null);

  useEffect(() => {
    currentShopRef.current = currentShop;
  }, [currentShop]);

  const checkAuth = async () => {
    // Éviter les appels multiples simultanés
    if (isCheckingAuthRef.current) {
      console.log('Auth check already in progress, skipping');
      return;
    }

    try {
      isCheckingAuthRef.current = true;
      // Ne mettre le loading global que si on n'est pas déjà authentifié
      if (!isAuthenticated) setLoading(true);

      console.log('Starting checkAuth...');

      // Add longer timeout (30s) to handle background tab throttling
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth check timeout (30s)')), 30000)
      );

      const authPromise = (async () => {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (session) {
          console.log('Session found, fetching profile...');
          try {
            // Profile fetch with its own timeout
            const profileResponse = await Promise.race([
              supabaseService.getProfile(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 15000))
            ]);

            if (profileResponse.success) {
              const { user: userData, shops: userShops } = profileResponse.data;
              setUser(userData);
              setShops(userShops || []);
              setIsAuthenticated(true);

              // Restaurer la boutique sélectionnée
              if (userShops && userShops.length > 0) {
                const savedShopId = localStorage.getItem('selectedShopId');
                const lastShop = userShops.find(s => s.id === savedShopId) || userShops[0];
                setCurrentShop(lastShop);
              }
              console.log('Auth check success');
            } else {
              throw new Error('Profile fetch failed');
            }
          } catch (profileError) {
            console.error('Profile fetch error:', profileError);
            // On ne déconnecte pas forcément sur une erreur de profil (timeout réseau par ex)
            // Sauf si c'est une 401/403 explicite
            if (profileError.message === 'Profile fetch failed') {
              await supabase.auth.signOut();
              setIsAuthenticated(false);
            }
          }
        } else {
          console.log('No session found');
          setUser(null);
          setShops([]);
          setCurrentShop(null);
          setIsAuthenticated(false);
        }
      })();

      await Promise.race([authPromise, timeoutPromise]);
    } catch (error) {
      console.error('Auth check error:', error);
      // En cas de timeout, on laisse l'état actuel si possible ou on déconnecte
      if (error.message.includes('timeout') && isAuthenticated) {
        console.warn('Auth check timed out but user was authenticated, keeping state');
      } else {
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
      isCheckingAuthRef.current = false;
    }
  };

  // Vérification initiale au montage du composant
  useEffect(() => {
    console.log('AuthProvider mounted, checking auth');
    checkAuth();
  }, []); // Exécuter une seule fois

  // Listener pour les changements d'authentification (stable)
  useEffect(() => {
    console.log('Setting up auth state change listener (mounted once)');

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'session exists' : 'no session');

      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session) {
        // Si on vient juste de se connecter via login(), ne pas refaire la requête
        if (justLoggedInRef.current) {
          console.log('Just logged in via login(), skipping profile fetch');
          justLoggedInRef.current = false;
          return;
        }

        try {
          // Timeout local pour ne pas bloquer indéfiniment
          const profileResponse = await Promise.race([
            supabaseService.getProfile(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 15000))
          ]);

          if (profileResponse.success) {
            const { user: userData, shops: userShops } = profileResponse.data;
            setUser(userData);
            setShops(userShops || []);
            setIsAuthenticated(true);

            // Restaurer la boutique
            if (userShops && userShops.length > 0) {
              const savedShopId = localStorage.getItem('selectedShopId');
              const lastShop = userShops.find(s => s.id === savedShopId) || userShops[0];
              setCurrentShop(lastShop);
            }
          }
        } catch (error) {
          console.error('Profile fetch error on event:', event, error);
          // On ne change pas isAuthenticated(false) ici pour éviter les AbortError lors des refresh de token
        } finally {
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        setShops([]);
        setCurrentShop(null);
        setIsAuthenticated(false);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('Token refreshed successfully');
        setIsAuthenticated(true);
        setLoading(false);
      }
    });

    return () => {
      console.log('Unsubscribing from auth state changes');
      subscription?.unsubscribe();
    };
  }, []); // TRÈS IMPORTANT : [] pour éviter les réabonnements incessants qui causent des AbortError

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('Login attempt for:', email);

      const response = await supabaseService.login({ email, password });
      console.log('Login response:', response.success);

      if (response.success) {
        // Marquer qu'on vient de se connecter pour éviter la double requête
        justLoggedInRef.current = true;

        const { user: userData, shops: userShops } = response.data;
        setUser(userData);
        setShops(userShops || []);
        setIsAuthenticated(true);

        if (userShops && userShops.length > 0) {
          const savedShopId = localStorage.getItem('selectedShopId');
          const lastShop = userShops.find(s => s.id === savedShopId) || userShops[0];
          setCurrentShop(lastShop);
        } else {
          setCurrentShop(null);
        }

        setLoading(false);

        console.log('Login successful, user authenticated');
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, message: 'Échec de la connexion' };
      }
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      setLoading(false);
      return { success: false, message: error.message || 'Erreur lors de la connexion' };
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('Register attempt for:', userData.email);

      const response = await supabaseService.register(userData);

      if (response.success) {
        // Marquer qu'on vient de s'inscrire
        justLoggedInRef.current = true;

        const { user: userData, shops: userShops } = response.data;
        setUser(userData);
        setShops(userShops || []);

        if (userShops && userShops.length > 0) {
          setCurrentShop(userShops[0]);
          localStorage.setItem('selectedShopId', userShops[0].id);
        } else {
          setCurrentShop(null);
        }

        setIsAuthenticated(true);
        setLoading(false);

        console.log('Registration successful');
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, message: 'Échec de l\'inscription' };
      }
    } catch (error) {
      console.error('Register error in AuthContext:', error);
      setLoading(false);
      return { success: false, message: error.message || 'Erreur lors de l\'inscription' };
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out');
      setLoading(true);

      await supabaseService.logout();

      setUser(null);
      setShops([]);
      setCurrentShop(null);
      localStorage.removeItem('selectedShopId');
      setIsAuthenticated(false);
      setLoading(false);

      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      setLoading(false);
    }
  };

  const switchShop = (shopId) => {
    const newShop = shops.find(s => s.id === shopId);
    if (newShop) {
      console.log('Switching to shop:', newShop.name);
      setCurrentShop(newShop);
      localStorage.setItem('selectedShopId', shopId);
      return true;
    }
    return false;
  };

  const updateShop = (updatedShop) => {
    console.log('Updating shop in list:', updatedShop?.name);
    const newShops = shops.map(s => s.id === updatedShop.id ? updatedShop : s);
    setShops(newShops);
    if (currentShop && currentShop.id === updatedShop.id) {
      setCurrentShop(updatedShop);
    }
  };

  const addShop = (newShop) => {
    setShops(prev => [...prev, newShop]);
    if (!currentShop) {
      setCurrentShop(newShop);
      localStorage.setItem('selectedShopId', newShop.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        shops,
        currentShop,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        switchShop,
        updateShop,
        addShop,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};
