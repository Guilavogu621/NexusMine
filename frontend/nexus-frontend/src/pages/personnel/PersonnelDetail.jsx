import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const statusLabels = {
  ACTIVE: 'Actif',
  ON_LEAVE: 'En congé',
  INACTIVE: 'Inactif',
  TERMINATED: 'Licencié',
};

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  ON_LEAVE: 'bg-yellow-100 text-yellow-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  TERMINATED: 'bg-red-100 text-red-800',
};

export default function PersonnelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSupervisor } = useAuthStore();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerson();
  }, [id]);

  const fetchPerson = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/personnel/${id}/`);
      setPerson(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${person.last_name} ${person.first_name}" ?`)) {
      return;
    }
    try {
      await api.delete(`/personnel/${id}/`);
      navigate('/personnel');
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

  if (!person) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Employé non trouvé</p>
        <Link to="/personnel" className="mt-4 text-blue-600 hover:text-blue-500">
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
            to="/personnel"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-xl font-bold text-blue-600">
                {person.first_name?.[0]}{person.last_name?.[0]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {person.last_name} {person.first_name}
              </h1>
              <p className="mt-1 text-sm text-gray-500">{person.position}</p>
            </div>
          </div>
        </div>
        {isSupervisor() && (
          <div className="flex items-center gap-2">
            <Link
              to={`/personnel/${id}/edit`}
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informations personnelles
          </h2>
          
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex items-start gap-3">
              <IdentificationIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Matricule</dt>
                <dd className="mt-1 text-sm text-gray-900">{person.employee_id}</dd>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Statut</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      statusColors[person.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {statusLabels[person.status] || person.status}
                  </span>
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Site d'affectation</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {person.site_name || '—'}
                </dd>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <dt className="text-sm font-medium text-gray-500">Date d'embauche</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {person.hire_date 
                    ? new Date(person.hire_date).toLocaleDateString('fr-FR')
                    : 'Non renseignée'}
                </dd>
              </div>
            </div>

            {person.phone && (
              <div className="flex items-start gap-3">
                <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a href={`tel:${person.phone}`} className="text-blue-600 hover:text-blue-500">
                      {person.phone}
                    </a>
                  </dd>
                </div>
              </div>
            )}
            
            {person.email && (
              <div className="flex items-start gap-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a href={`mailto:${person.email}`} className="text-blue-600 hover:text-blue-500">
                      {person.email}
                    </a>
                  </dd>
                </div>
              </div>
            )}
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
                    {new Date(person.created_at).toLocaleDateString('fr-FR', {
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
                    {new Date(person.updated_at).toLocaleDateString('fr-FR', {
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
