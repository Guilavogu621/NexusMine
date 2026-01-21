import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
  MapPinIcon,
  CalendarIcon,
  CpuChipIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const typeLabels = {
  TRUCK: 'Camion',
  EXCAVATOR: 'Pelle excavatrice',
  LOADER: 'Chargeuse',
  DRILL: 'Foreuse',
  CRUSHER: 'Concasseur',
  CONVEYOR: 'Convoyeur',
  PUMP: 'Pompe',
  GENERATOR: 'Générateur',
  OTHER: 'Autre',
};

const statusLabels = {
  OPERATIONAL: 'Opérationnel',
  MAINTENANCE: 'En maintenance',
  BREAKDOWN: 'En panne',
  RETIRED: 'Hors service',
};

const statusColors = {
  OPERATIONAL: 'bg-green-100 text-green-800',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800',
  BREAKDOWN: 'bg-red-100 text-red-800',
  RETIRED: 'bg-gray-100 text-gray-800',
};

export default function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSupervisor } = useAuthStore();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquipment();
  }, [id]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/equipment/${id}/`);
      setEquipment(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${equipment.name}" ?`)) {
      return;
    }
    try {
      await api.delete(`/equipment/${id}/`);
      navigate('/equipment');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Équipement non trouvé</p>
        <Link to="/equipment" className="mt-4 text-blue-600 hover:text-blue-500">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/equipment"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{equipment.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{equipment.equipment_code}</p>
          </div>
        </div>
        {isSupervisor() && (
          <div className="flex items-center gap-2">
            <Link
              to={`/equipment/${id}/edit`}
              className="inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 transition-colors"
            >
              <PencilSquareIcon className="h-4 w-4 mr-2" />
              Modifier
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 transition-colors"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Supprimer
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Informations de l'équipement
            </h2>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                statusColors[equipment.status] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {statusLabels[equipment.status] || equipment.status}
            </span>
          </div>
          
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex items-start gap-3">
              <WrenchScrewdriverIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {typeLabels[equipment.equipment_type] || equipment.equipment_type}
                </dd>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Site d'affectation</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {equipment.site_name || '—'}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CpuChipIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Fabricant</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {equipment.manufacturer || 'Non renseigné'}
                </dd>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <TagIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Modèle</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {equipment.model || 'Non renseigné'}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <TagIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Numéro de série</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {equipment.serial_number || 'Non renseigné'}
                </dd>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Date de mise en service</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {equipment.commissioning_date 
                    ? new Date(equipment.commissioning_date).toLocaleDateString('fr-FR')
                    : 'Non renseignée'}
                </dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Dates */}
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-900/5 p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Historique</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-gray-500">Créé le</p>
                  <p className="font-medium text-gray-900">
                    {new Date(equipment.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-gray-500">Modifié le</p>
                  <p className="font-medium text-gray-900">
                    {new Date(equipment.updated_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
