// Store Types
export const STORE_TYPES = {
  HOMME: 1,
  FEMME: 2,
  ENFANT: 3
};

export const STORE_TYPE_LABELS = {
  1: 'Homme',
  2: 'Femme',
  3: 'Enfant'
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  COMPLETED: 'completed'
};

export const ORDER_STATUS_LABELS = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  completed: 'Terminée'
};

export const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const PAYMENT_STATUS_LABELS = {
  pending: 'En attente',
  paid: 'Payé',
  failed: 'Échoué',
  refunded: 'Remboursé'
};

export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock'
};
export const PRODUCT_CATEGORIES = {
  [STORE_TYPES.FEMME]: {
    'Vêtements': ['Robes', 'Ensembles', 'Vestes'],
    'Chaussures': ['Baskets', 'Bottes', 'Talons'],
    'Accessoires': ['Sacs', 'Ceintures', 'Bijoux']
  },
  [STORE_TYPES.HOMME]: {
    'Vêtements': ['Pantalons', 'Vestes', 'Hauts'],
    'Chaussures': ['Baskets', 'Classique', 'Claquettes'],
    'Accessoires': ['Lunettes', 'Casquettes', 'Montres']
  },
  [STORE_TYPES.ENFANT]: {
    'Fille': ['Robes', 'Chaussures', 'Vestes'],
    'Garçon': ['Ensembles', 'Chaussures', 'Vestes'],
    'Bébé': ['Pyjama', 'Chaussures', 'Bonnets']
  }
};
