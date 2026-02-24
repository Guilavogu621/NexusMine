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
  SparklesIcon,
  BriefcaseIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';
import useAuthStore from '../../stores/authStore';

const statusLabels = {
  ACTIVE: 'Actif',
  ON_LEAVE: 'En congé',
  INACTIVE: 'Inactif',
  TERMINATED: 'Licencié',
};

const statusConfig = {
  ACTIVE: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', icon: CheckCircleIcon },
  ON_LEAVE: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', icon: ClockIcon },
  INACTIVE: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-gray-500', icon: ClockIcon },
  TERMINATED: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', icon: ExclamationTriangleIcon },
};

const avatarColors = [
  'from-purple-500 to-indigo-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
];

export default function PersonnelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSupervisor, isAdmin, isTechnicien } = useAuthStore();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

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
      setDeleting(true);
      await api.delete(`/personnel/${id}/`);
      navigate('/personnel');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-amber-200 rounded-full animate-spin border-t-amber-600 mx-auto"></div>
            <SparklesIcon className="h-6 w-6 text-amber-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-slate-500 font-medium">Chargement du personnel...</p>
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-96">
        <div className="p-4 bg-red-100 rounded-full mb-4">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
        </div>
        <p className="text-xl font-semibold text-slate-800">Employé non trouvé</p>
        <p className="text-slate-500 mt-1">Cet employé n'existe pas ou a été supprimé</p>
        <Link to="/personnel" className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
          Retour à la liste
        </Link>
      </div>
    );
  }

  const config = statusConfig[person.status] || statusConfig.ACTIVE;
  const StatusIcon = config.icon;
  const avatarColor = avatarColors[parseInt(id) % avatarColors.length];
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const photoUrl = person.photo_url
    ? (person.photo_url.startsWith('http') ? person.photo_url : `${API_BASE}${person.photo_url}`)
    : null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 pb-12">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
        {/* ── HEADER PREMIUM ── */}
        <div className="group relative overflow-hidden rounded-[40px] bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 shadow-2xl animate-fadeInDown">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="detailGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
              <rect width="100" height="100" fill="url(#detailGrid)" />
            </svg>
          </div>

          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-700"></div>

          <div className="relative p-8 sm:p-10">
            {/* Nav & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
              <Link
                to="/personnel"
                className="group inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/10 backdrop-blur-md text-white rounded-2xl hover:bg-white hover:text-indigo-600 transition-all duration-300 shadow-lg border border-white/20"
              >
                <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold uppercase tracking-widest font-outfit">Liste Personnel</span>
              </Link>

              {(isSupervisor() || isAdmin() || isTechnicien()) && (
                <div className="flex items-center gap-3">
                  <Link
                    to={`/personnel/${id}/edit`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Modifier
                  </Link>
                  {(isSupervisor() || isAdmin()) && (
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="group inline-flex items-center gap-2 px-6 py-3 bg-red-500/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:bg-red-600 hover:shadow-red-500/20 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
                    >
                      {deleting ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <TrashIcon className="h-4 w-4 group-hover:animate-bounce" />
                      )}
                      Supprimer
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
              <div className="relative group flex-shrink-0">
                <div className="absolute inset-0 bg-white/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={`${person.first_name} ${person.last_name}`}
                      className="h-40 w-40 rounded-[32px] object-cover shadow-2xl ring-4 ring-white/30 transition-transform duration-500 group-hover:scale-[1.02]"
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <div className={`h-40 w-40 rounded-[32px] bg-gradient-to-br ${avatarColor} items-center justify-center shadow-2xl ring-4 ring-white/30 ${photoUrl ? 'hidden' : 'flex'}`}>
                    <span className="text-5xl font-bold text-white font-outfit">
                      {person.first_name?.[0]}{person.last_name?.[0]}
                    </span>
                  </div>
                  <div className={`absolute -bottom-3 -right-3 p-3 rounded-2xl shadow-xl ring-4 ring-white ${config.bg} ${config.text} group-hover:rotate-12 transition-transform`}>
                    <StatusIcon className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold uppercase tracking-[0.2em] mb-4 border border-white/20">
                  <IdentificationIcon className="h-3.5 w-3.5" />
                  {person.employee_id}
                </div>
                <h1 className="text-5xl font-bold text-white tracking-tight font-outfit mb-4">
                  {person.first_name} {person.last_name}
                </h1>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                  <div className="flex items-center gap-3 text-white bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 shadow-lg">
                    <BriefcaseIcon className="h-5 w-5 text-blue-200" />
                    <span className="font-bold tracking-tight">{person.position || 'Poste non défini'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20 shadow-lg">
                    <MapPinIcon className="h-5 w-5 text-blue-200" />
                    <span className="font-bold tracking-tight">{person.site_name || 'Non assigné'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENT GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Dossier */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-[32px] shadow-xl border border-white/40 overflow-hidden animate-fadeInUp" style={{ animationDelay: '100ms' }}>
              <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-600"><IdentificationIcon className="h-6 w-6" /></div>
                  <h2 className="text-xl font-black text-slate-900 font-outfit tracking-tight">Dossier Professionnel</h2>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { label: 'Matricule Officiel', value: person.employee_id, icon: IdentificationIcon, color: 'indigo' },
                    { label: 'Date d\'Embauche', value: person.hire_date ? new Date(person.hire_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non renseignée', icon: CalendarIcon, color: 'emerald' },
                    { label: 'Site d\'Affectation', value: person.site_name || 'Non assigné', icon: BuildingOffice2Icon, color: 'rose' },
                    { label: 'Fonction Actuelle', value: person.position || 'Non spécifié', icon: BriefcaseIcon, color: 'amber' }
                  ].map((item, i) => (
                    <div key={i} className="group p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-indigo-100 hover:shadow-xl transition-all duration-500">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{item.label}</p>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl bg-${item.color}-50 text-${item.color}-600 group-hover:scale-110 transition-transform`}>
                          <item.icon className="h-6 w-6" />
                        </div>
                        <span className="text-lg font-black text-slate-800 tracking-tight">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Placeholder for more cards (e.g., Performance, Documents) */}
          </div>

          {/* Sidebar: Contacts & Times */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-[32px] shadow-xl border border-white/40 overflow-hidden animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
                <h3 className="text-lg font-black text-slate-900 font-outfit tracking-tight">Canaux de Contact</h3>
              </div>
              <div className="p-6 space-y-4">
                {person.phone && (
                  <a href={`tel:${person.phone}`} className="flex items-center gap-5 p-4 bg-slate-50 rounded-[24px] hover:bg-indigo-600 hover:text-white group transition-all duration-300 shadow-sm">
                    <div className="p-3 bg-white rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform shadow-sm">
                      <PhoneIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Mobile</p>
                      <p className="text-base font-black tracking-tight">{person.phone}</p>
                    </div>
                  </a>
                )}
                {person.email && (
                  <a href={`mailto:${person.email}`} className="flex items-center gap-5 p-4 bg-slate-50 rounded-[24px] hover:bg-indigo-600 hover:text-white group transition-all duration-300 shadow-sm">
                    <div className="p-3 bg-white rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform shadow-sm">
                      <EnvelopeIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Professionnel</p>
                      <p className="text-base font-black tracking-tight truncate">{person.email}</p>
                    </div>
                  </a>
                )}
                {!person.phone && !person.email && (
                  <div className="text-center py-6 text-slate-400 font-bold italic">Aucun contact</div>
                )}
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-xl rounded-[32px] shadow-xl border border-white/40 overflow-hidden animate-fadeInUp" style={{ animationDelay: '300ms' }}>
              <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
                <h3 className="text-lg font-black text-slate-900 font-outfit tracking-tight">Traçabilité</h3>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl h-fit shadow-sm"><CheckCircleIcon className="h-5 w-5" /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dossier Ouvert le</p>
                    <p className="text-base font-black text-slate-800 tracking-tight">{new Date(person.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl h-fit shadow-sm"><ClockIcon className="h-5 w-5" /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dernière Mise à Jour</p>
                    <p className="text-base font-black text-slate-800 tracking-tight">{new Date(person.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown { animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fadeInUp { 
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
}
