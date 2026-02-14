// frontend/src/services/supabase.service.js
import { supabase, getPublicImageUrl, uploadImage, deleteImage } from '../config/supabase.config';
import { STORE_TYPE_LABELS } from '../utils/constants';

class SupabaseService {
    constructor() {
        this.categoriesCache = [];
    }
    // ==================== AUTH ====================

    async register(userData) {
        try {
            const { email, password, name, role = 'seller' } = userData;

            // 1. Créer l'utilisateur dans Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        role
                    }
                }
            });

            if (authError) {
                console.error('Auth signup error:', authError);
                throw authError;
            }

            console.log('Auth user created:', authData.user.id);

            // 2. Créer l'entrée dans la table users
            const userRecord = {
                id: authData.user.id,
                name,
                email,
                role
            };

            console.log('Attempting to insert user record:', userRecord);

            const { data: insertedUser, error: userError } = await supabase
                .from('users')
                .insert([userRecord])
                .select()
                .single();

            if (userError) {
                console.error('User table insertion error:', userError);
                console.error('Error details:', JSON.stringify(userError, null, 2));
                throw new Error(`Erreur lors de la création du profil utilisateur: ${userError.message}`);
            }

            console.log('User record inserted successfully:', insertedUser);

            return {
                success: true,
                data: {
                    user: authData.user,
                    session: authData.session
                }
            };
        } catch (error) {
            console.error('Register error:', error);
            throw new Error(error.message || 'Erreur lors de l\'inscription');
        }
    }

    async login(credentials) {
        try {
            const { email, password } = credentials;

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Récupérer les données utilisateur complètes
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .maybeSingle();

            if (userError) throw userError;
            if (!userData) throw new Error('Utilisateur non trouvé dans la base de données. Veuillez vérifier votre email pour confirmer votre compte.');

            // Récupérer les magasins si l'utilisateur est vendeur
            let shops = [];
            if (userData.role === 'seller') {
                const { data: shopsData } = await supabase
                    .from('stores')
                    .select(`
                        *,
                        store_store_types (
                            store_type_id,
                            store_types (*)
                        )
                    `)
                    .eq('owner_id', data.user.id);

                shops = shopsData || [];
            }

            return {
                success: true,
                data: {
                    user: userData,
                    shops,
                    session: data.session
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Erreur lors de la connexion');
        }
    }

    async getProfile() {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('Non authentifié');

            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (userError) throw userError;
            if (!userData) throw new Error('Utilisateur non trouvé dans la base de données');

            let shops = [];
            if (userData.role === 'seller') {
                const { data: shopsData } = await supabase
                    .from('stores')
                    .select(`
                        *,
                        store_store_types (
                            store_type_id,
                            store_types (*)
                        )
                    `)
                    .eq('owner_id', user.id);

                shops = shopsData || [];
            }

            return {
                success: true,
                data: {
                    user: userData,
                    shops
                }
            };
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    }

    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }

    // ==================== SHOP ====================

    async getShops() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Non authentifié');

            const { data, error } = await supabase
                .from('stores')
                .select(`
                    *,
                    store_store_types (
                        store_type_id,
                        store_types (*)
                    )
                `)
                .eq('owner_id', user.id);

            if (error) throw error;

            return {
                success: true,
                data: data || []
            };
        } catch (error) {
            console.error('Get shops error:', error);
            throw error;
        }
    }

    async createShop(shopData) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Non authentifié');

            const { name, description, logo_url, store_types = [] } = shopData;

            // 1. Créer le magasin
            const { data: shop, error: shopError } = await supabase
                .from('stores')
                .insert([{
                    owner_id: user.id,
                    name,
                    description,
                    logo_url
                }])
                .select(`
                    *,
                    store_store_types (
                        store_type_id,
                        store_types (*)
                    )
                `)
                .single();

            if (shopError) throw shopError;

            // 2. Créer les relations store_types (numeric IDs: 1, 2, 3)
            if (store_types.length > 0) {
                const storeTypeRelations = store_types.map(typeId => ({
                    store_id: shop.id,
                    store_type_id: parseInt(typeId) // Ensure numeric ID
                }));

                const { error: typesError } = await supabase
                    .from('store_store_types')
                    .insert(storeTypeRelations);

                if (typesError) throw typesError;
            }

            return {
                success: true,
                data: shop
            };
        } catch (error) {
            console.error('Create shop error:', error);
            throw error;
        }
    }

    async updateShop(shopData, shopId = null) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Non authentifié');

            const { name, description, logo_url, shop_type = [] } = shopData;
            const id = shopData.id || shopId;

            if (!id) throw new Error('ID de boutique manquant');

            // 1. Mettre à jour le magasin
            const { error: shopError } = await supabase
                .from('stores')
                .update({
                    name,
                    description,
                    logo_url,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('owner_id', user.id);

            if (shopError) throw shopError;

            // 2. Mettre à jour les store_types (numeric IDs)
            // Supprimer les anciennes relations
            await supabase
                .from('store_store_types')
                .delete()
                .eq('store_id', id);

            // Créer les nouvelles relations avec numeric IDs
            if (shop_type.length > 0) {
                const storeTypeRelations = shop_type.map(typeId => ({
                    store_id: id,
                    store_type_id: parseInt(typeId) // Ensure numeric ID
                }));

                const { error: typesError } = await supabase
                    .from('store_store_types')
                    .insert(storeTypeRelations);

                if (typesError) throw typesError;
            }

            // 3. Récupérer la boutique finale avec ses relations à jour
            const { data: updatedShop, error: fetchError } = await supabase
                .from('stores')
                .select(`
                    *,
                    store_store_types (
                        store_type_id,
                        store_types (*)
                    )
                `)
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            return {
                success: true,
                data: updatedShop
            };
        } catch (error) {
            console.error('Update shop error:', error);
            throw error;
        }
    }

    async getShopStats(timeRange = 'month', shopId = null) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Non authentifié');

            let currentShopId = shopId;

            if (!currentShopId) {
                // Récupérer le premier magasin si aucun ID n'est fourni
                const { data: shop, error: shopError } = await supabase
                    .from('stores')
                    .select('id')
                    .eq('owner_id', user.id)
                    .limit(1)
                    .maybeSingle();

                if (shopError || !shop) {
                    throw new Error('Boutique non trouvée');
                }
                currentShopId = shop.id;
            }

            // Calculer les dates
            const now = new Date();
            let startDate = new Date();

            switch (timeRange) {
                case 'week':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
                default:
                    startDate.setMonth(now.getMonth() - 1);
            }

            // Récupérer les commandes
            const { data: orders, error: ordersError } = await supabase
                .from('store_orders')
                .select('subtotal, status, created_at')
                .eq('store_id', currentShopId)
                .gte('created_at', startDate.toISOString());

            if (ordersError) throw ordersError;

            // Récupérer le nombre de produits
            const { count: productsCount, error: productsError } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('store_id', currentShopId);

            if (productsError) throw productsError;

            const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.subtotal || 0), 0);
            const pendingOrders = orders.filter(o => o.status === 'pending').length;

            return {
                success: true,
                data: {
                    totalRevenue,
                    totalOrders: orders.length,
                    totalProducts: productsCount || 0,
                    pendingOrders
                }
            };
        } catch (error) {
            console.error('Get shop stats error:', error);
            throw error;
        }
    }

    // ==================== PRODUCTS ====================

    async getProducts(shopId = null) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Non authentifié');

            let currentShopId = shopId;

            if (!currentShopId) {
                const { data: shop } = await supabase
                    .from('stores')
                    .select('id')
                    .eq('owner_id', user.id)
                    .limit(1)
                    .maybeSingle();

                if (!shop) {
                    return { success: true, data: [] };
                }
                currentShopId = shop.id;
            }

            const { data, error } = await supabase
                .from('products')
                .select(`
          *,
          product_variants (*),
          product_images (*),
          categories (*)
        `)
                .eq('store_id', currentShopId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (this.categoriesCache.length === 0) {
                await this.getCategories();
            }

            // Formater les données pour correspondre à l'ancien format
            const formattedProducts = data.map(product => {
                const mainVariant = product.product_variants?.[0];
                const images = product.product_images?.map(img => img.url) || [];

                // Construire le chemin complet de la catégorie
                let fullCategory = '';
                if (product.category_id && this.categoriesCache.length > 0) {
                    const leaf = this.categoriesCache.find(c => c.id === product.category_id);
                    if (leaf) {
                        const path = [leaf.name];
                        let current = leaf;
                        while (current?.parent_id) {
                            const parent = this.categoriesCache.find(c => c.id === current.parent_id);
                            if (parent) {
                                path.unshift(parent.name);
                                current = parent;
                            } else {
                                break;
                            }
                        }
                        // Ajouter le store type au début
                        const storeTypeLabel = STORE_TYPE_LABELS[current?.store_type_id] || '';
                        if (storeTypeLabel) path.unshift(storeTypeLabel);
                        fullCategory = path.join(' > ');
                    }
                }

                return {
                    ...product,
                    price: mainVariant?.price || 0,
                    stock_quantity: mainVariant?.stock || 0,
                    category: fullCategory || product.category, // Fallback si null
                    images,
                    image_url: images[0] || null
                };
            });

            return {
                success: true,
                data: formattedProducts
            };
        } catch (error) {
            console.error('Get products error:', error);
            throw error;
        }
    }

    async getProduct(id) {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
          *,
          product_variants (*),
          product_images (*),
          categories (*)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;

            const mainVariant = data.product_variants?.[0];
            const images = data.product_images?.map(img => img.url) || [];

            // Construire le chemin complet de la catégorie
            let fullCategory = '';
            if (data.category_id) {
                if (this.categoriesCache.length === 0) await this.getCategories();
                const leaf = this.categoriesCache.find(c => c.id === data.category_id);
                if (leaf) {
                    const path = [leaf.name];
                    let current = leaf;
                    while (current?.parent_id) {
                        const parent = this.categoriesCache.find(c => c.id === current.parent_id);
                        if (parent) {
                            path.unshift(parent.name);
                            current = parent;
                        } else {
                            break;
                        }
                    }
                    const storeTypeLabel = STORE_TYPE_LABELS[current?.store_type_id] || '';
                    if (storeTypeLabel) path.unshift(storeTypeLabel);
                    fullCategory = path.join(' > ');
                }
            }

            return {
                success: true,
                data: {
                    ...data,
                    price: mainVariant?.price || 0,
                    stock_quantity: mainVariant?.stock || 0,
                    category: fullCategory || data.category,
                    images,
                    image_url: images[0] || null
                }
            };
        } catch (error) {
            console.error('Get product error:', error);
            throw error;
        }
    }

    async createProduct(formData) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Non authentifié');

            let shopId = formData.get('store_id');

            if (!shopId) {
                const { data: shops } = await supabase
                    .from('stores')
                    .select('id')
                    .eq('owner_id', user.id);

                if (!shops || shops.length === 0) throw new Error('Vous devez créer un magasin d\'abord');
                shopId = shops[0].id;
            }

            // Extraire les données du FormData
            const name = formData.get('name');
            const description = formData.get('description');
            const category_id = formData.get('category_id');
            const price = parseFloat(formData.get('price'));
            const stock = parseInt(formData.get('stock_quantity'));
            const imageFiles = formData.getAll('images');

            // 1. Créer le produit
            const { data: product, error: productError } = await supabase
                .from('products')
                .insert([{
                    store_id: shopId,
                    name,
                    description,
                    category_id,
                    seo_title: name,
                    seo_description: description
                }])
                .select()
                .single();

            if (productError) throw productError;

            // 2. Créer le variant principal
            const { error: variantError } = await supabase
                .from('product_variants')
                .insert([{
                    product_id: product.id,
                    name: 'Default',
                    price,
                    stock
                }])
                .select()
                .single();

            if (variantError) throw variantError;

            // 3. Uploader les images
            const imageUrls = [];
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                const fileName = `${product.id}/${Date.now()}_${i}_${file.name}`;

                const imageData = await uploadImage(file, fileName);
                const publicUrl = getPublicImageUrl(imageData.path);

                // Créer l'entrée dans product_images
                const { error: imageError } = await supabase
                    .from('product_images')
                    .insert([{
                        product_id: product.id,
                        url: imageData.path
                    }]);

                if (imageError) throw imageError;
                imageUrls.push(publicUrl);
            }

            return {
                success: true,
                data: {
                    ...product,
                    price,
                    stock_quantity: stock,
                    images: imageUrls
                },
                message: 'Produit créé avec succès'
            };
        } catch (error) {
            console.error('Create product error:', error);
            throw error;
        }
    }

    async updateProduct(id, formData) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Non authentifié');

            // Extraire les données
            const name = formData.get('name');
            const description = formData.get('description');
            const category_id = formData.get('category_id');
            const price = parseFloat(formData.get('price'));
            const stock = parseInt(formData.get('stock_quantity'));
            const newImageFiles = formData.getAll('images');

            // 1. Mettre à jour le produit
            const { data: product, error: productError } = await supabase
                .from('products')
                .update({
                    name,
                    description,
                    category_id,
                    seo_title: name,
                    seo_description: description,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (productError) throw productError;

            // 2. Mettre à jour le variant principal
            const { data: variants } = await supabase
                .from('product_variants')
                .select('*')
                .eq('product_id', id);

            if (variants && variants.length > 0) {
                await supabase
                    .from('product_variants')
                    .update({
                        price,
                        stock,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', variants[0].id);
            }

            // 3. Gérer les images
            // Supprimer toutes les anciennes images
            const { data: oldImages } = await supabase
                .from('product_images')
                .select('*')
                .eq('product_id', id);

            if (oldImages) {
                for (const img of oldImages) {
                    await deleteImage(img.url);
                }
            }

            await supabase
                .from('product_images')
                .delete()
                .eq('product_id', id);

            // Ajouter les nouvelles images
            const imageUrls = [];
            for (let i = 0; i < newImageFiles.length; i++) {
                const file = newImageFiles[i];
                const fileName = `${id}/${Date.now()}_${i}_${file.name}`;

                const imageData = await uploadImage(file, fileName);
                const publicUrl = getPublicImageUrl(imageData.path);

                await supabase
                    .from('product_images')
                    .insert([{
                        product_id: id,
                        url: imageData.path
                    }]);

                imageUrls.push(publicUrl);
            }

            return {
                success: true,
                data: {
                    ...product,
                    price,
                    stock_quantity: stock,
                    images: imageUrls
                },
                message: 'Produit mis à jour avec succès'
            };
        } catch (error) {
            console.error('Update product error:', error);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            // Supprimer les images du storage
            const { data: images } = await supabase
                .from('product_images')
                .select('url')
                .eq('product_id', id);

            if (images) {
                for (const img of images) {
                    await deleteImage(img.url);
                }
            }

            // Supprimer le produit (cascade supprimera variants et images)
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return {
                success: true,
                message: 'Produit supprimé avec succès'
            };
        } catch (error) {
            console.error('Delete product error:', error);
            throw error;
        }
    }

    // ==================== ORDERS ====================

    async getOrders(status = null, shopId = null) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Non authentifié');

            let currentShopId = shopId;

            if (!currentShopId) {
                const { data: shop } = await supabase
                    .from('stores')
                    .select('id')
                    .eq('owner_id', user.id)
                    .limit(1)
                    .maybeSingle();

                if (!shop) {
                    return { success: true, data: [] };
                }
                currentShopId = shop.id;
            }

            let query = supabase
                .from('store_orders')
                .select(`
          *,
          order:orders (*),
          order_items (
            *,
            product_variant:product_variants (
              *,
              product:products (*)
            )
          )
        `)
                .eq('store_id', currentShopId)
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query;

            if (error) throw error;

            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Get orders error:', error);
            throw error;
        }
    }

    async getOrder(id) {
        try {
            const { data, error } = await supabase
                .from('store_orders')
                .select(`
          *,
          order:orders (*),
          order_items (
            *,
            product_variant:product_variants (
              *,
              product:products (*)
            )
          )
        `)
                .eq('id', id)
                .single();

            if (error) throw error;

            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Get order error:', error);
            throw error;
        }
    }

    async updateOrderStatus(id, statusData) {
        try {
            const { status } = statusData;

            const { data, error } = await supabase
                .from('store_orders')
                .update({ status })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return {
                success: true,
                data,
                message: 'Statut mis à jour avec succès'
            };
        } catch (error) {
            console.error('Update order status error:', error);
            throw error;
        }
    }

    // ==================== MESSAGES (Placeholder) ====================

    async getMessages() {
        // À implémenter selon vos besoins
        return { success: true, data: [] };
    }

    async getMessage(id) {
        return { success: true, data: null };
    }

    async createMessage(messageData) {
        return { success: true, data: messageData };
    }

    async updateMessageStatus(id, status) {
        return { success: true };
    }

    // ==================== NOTIFICATIONS (Placeholder) ====================

    async getNotifications(unreadOnly = false) {
        return { success: true, data: [] };
    }

    async getUnreadCount() {
        return { success: true, data: { count: 0 } };
    }

    async markNotificationAsRead(id) {
        return { success: true };
    }

    async markAllNotificationsAsRead() {
        return { success: true };
    }

    async deleteNotification(id) {
        return { success: true };
    }

    async deleteAllReadNotifications() {
        return { success: true };
    }

    // ==================== CATEGORIES ====================

    async getCategories() {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) throw error;
            this.categoriesCache = data || [];
            return { success: true, data: this.categoriesCache };
        } catch (error) {
            console.error('Get categories error:', error);
            throw error;
        }
    }
}

const supabaseServiceInstance = new SupabaseService();
export default supabaseServiceInstance;
