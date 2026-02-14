const DashboardContent = ({ currentPage }) => {
  if (currentPage === 'dashboard') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Ventes du jour" value="2 456 DZD" change="+12%" positive />
          <StatCard title="Commandes" value="43" change="+8%" positive />
          <StatCard title="Produits" value="156" change="-2%" positive={false} />
          <StatCard title="Messages" value="12" change="+5%" positive />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Bienvenue sur votre tableau de bord</h3>
          <p className="text-gray-600 mb-4">
            Gérez votre boutique, suivez vos commandes et analysez vos performances depuis cet espace.
          </p>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Astuce:</strong> Cette interface est connectée avec Supabase pour la gestion des données.
              Vous pouvez étendre les fonctionnalités en ajoutant vos propres tables et requêtes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Section: {currentPage}</h3>
      <p className="text-gray-600">
        Le contenu de cette section sera implémenté selon vos besoins spécifiques.
      </p>
    </div>
  );
};

const StatCard = ({ title, value, change, positive }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <p className="text-sm text-gray-600 mb-2">{title}</p>
    <p className="text-2xl font-bold text-gray-800 mb-2">{value}</p>
    <p className={`text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
      {change} vs hier
    </p>
  </div>
);
export default DashboardContent;