import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Helper pour obtenir l'URL publique d'une image
export const getPublicImageUrl = (path) => {
    if (!path) return null;
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
};

// Helper pour uploader une image
export const uploadImage = async (file, path) => {
    const { data, error } = await supabase.storage
        .from('product-images')
        .upload(path, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) throw error;
    return data;
};

// Helper pour supprimer une image
export const deleteImage = async (path) => {
    const { error } = await supabase.storage
        .from('product-images')
        .remove([path]);

    if (error) throw error;
};
