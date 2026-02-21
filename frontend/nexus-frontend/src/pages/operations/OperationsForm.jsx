import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ClipboardDocumentListIcon,
  MapPinIcon,
  CalendarDaysIcon,
  ClockIcon,
  CubeIcon,
  DocumentTextIcon,
  HashtagIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import api from "../../api/axios";
import DateRangeInput from "../../components/ui/DateRangeInput";
import useFormPermissions from "../../hooks/useFormPermissions";

const OPERATION_TYPES = [
  { value: "EXTRACTION",  label: "Extraction",  emoji: "⛏️", gradient: "from-amber-500 to-amber-600",  bg: "bg-amber-100 text-amber-700"  },
  { value: "TRANSPORT",   label: "Transport",   emoji: "🚛", gradient: "from-cyan-500 to-cyan-600",    bg: "bg-cyan-100 text-cyan-700"    },
  { value: "MAINTENANCE", label: "Maintenance", emoji: "🔧", gradient: "from-orange-500 to-orange-600", bg: "bg-orange-100 text-orange-700" },
];

const STATUS_OPTIONS = [
  { value: "PLANNED",     label: "Planifié", emoji: "📅", dot: "bg-blue-500",    badge: "bg-blue-100/80 text-blue-800"     },
  { value: "IN_PROGRESS", label: "En cours", emoji: "⚙️", dot: "bg-amber-500",   badge: "bg-amber-100/80 text-amber-800"   },
  { value: "COMPLETED",   label: "Terminé",  emoji: "✅", dot: "bg-emerald-500", badge: "bg-emerald-100/80 text-emerald-800"},
  { value: "CANCELLED",   label: "Annulé",   emoji: "❌", dot: "bg-slate-500",   badge: "bg-slate-100/80 text-slate-800"   },
];

const inputCls = "block w-full rounded-xl border-0 py-3 px-4 bg-slate-50 text-slate-800 ring-1 ring-inset ring-gray-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200 hover:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium";

const SectionCard = ({ children, delay = "0s" }) => (
  <div
    className="group relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl hover:border-white/40 transition-all duration-500 overflow-hidden animate-fadeInUp"
    style={{ animationDelay: delay }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
    <div className="relative z-10">{children}</div>
  </div>
);

const SectionHeader = ({ icon: Icon, iconBg, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/60">
    <div className={`p-2 ${iconBg} rounded-lg`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <h2 className="font-bold text-slate-900 text-lg">{title}</h2>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
  </div>
);

const OperationsForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { readOnly, canSubmit } = useFormPermissions("operations");

  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(false);
  const [sites, setSites]       = useState([]);
  const [timeRangeValid, setTimeRangeValid] = useState(true);

  const [formData, setFormData] = useState({
    operation_code:     "",
    operation_type:     "EXTRACTION",
    site:               "",
    date:               new Date().toISOString().split("T")[0],
    start_time:         "",
    end_time:           "",
    status:             "PLANNED",
    description:        "",
    quantity_extracted: "",
  });

  /* ── FETCH SITES ── */
  useEffect(() => {
    api.get("/sites/")
      .then((res) => {
        const data = res.data?.results || res.data || [];
        setSites(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Erreur lors du chargement des sites."));
  }, []);

  /* ── FETCH OPERATION (edit) ── */
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    api.get(`/operations/${id}/`)
      .then((res) => {
        const d = res.data;
        setFormData({
          operation_code:     d.operation_code     || "",
          operation_type:     d.operation_type     || "EXTRACTION",
          site:               d.site               || "",
          date:               d.date               || new Date().toISOString().split("T")[0],
          start_time:         d.start_time         || "",
          end_time:           d.end_time           || "",
          status:             d.status             || "PLANNED",
          description:        d.description        || "",
          quantity_extracted: d.quantity_extracted ?? "",
        });
      })
      .catch(() => setError("Erreur lors du chargement."))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  /* ── TIME VALIDATION ── */
  useEffect(() => {
    if (formData.start_time && formData.end_time) {
      setTimeRangeValid(formData.start_time < formData.end_time);
    } else {
      setTimeRangeValid(true);
    }
  }, [formData.start_time, formData.end_time]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity_extracted" ? (value === "" ? "" : Number(value)) : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit)      return setError("Vous n'avez pas la permission d'effectuer cette action.");
    if (!formData.site)  return setError("Veuillez sélectionner un site.");
    if (!timeRangeValid) return setError("L'heure de début doit être avant l'heure de fin.");

    const payload = {
      ...formData,
      site:               Number(formData.site),
      quantity_extracted: formData.quantity_extracted === "" ? null : formData.quantity_extracted,
      start_time:         formData.start_time || null,
      end_time:           formData.end_time   || null,
    };

    try {
      setSaving(true);
      if (isEdit) {
        await api.put(`/operations/${id}/`, payload);
      } else {
        await api.post("/operations/", payload);
      }
      setSuccess(true);
      setTimeout(() => navigate("/operations"), 1500);
    } catch (err) {
      console.error(err.response?.data);
      setError(
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data) ||
        "Erreur lors de l'enregistrement."
      );
    } finally {
      setSaving(false);
    }
  };

  const currentType   = OPERATION_TYPES.find((t) => t.value === formData.operation_type) || OPERATION_TYPES[0];
  const currentStatus = STATUS_OPTIONS.find((s) => s.value === formData.status)           || STATUS_OPTIONS[0];

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="text-slate-600 font-medium">Chargement de l'opération...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 relative">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.05),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(16,185,129,0.05),transparent_50%)]" />
      </div>

      <div className="relative space-y-6 pb-12 px-4 sm:px-6 lg:px-8 pt-8 max-w-4xl mx-auto">

        {/* ── HEADER PREMIUM ── */}
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 shadow-2xl animate-fadeInDown">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="formGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#formGrid)" />
            </svg>
          </div>
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-indigo-400 opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500" />

          <div className="relative px-8 py-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <ClipboardDocumentListIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  {/* Breadcrumb */}
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => navigate("/operations")}
                      className="text-blue-200 hover:text-white text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      <ArrowLeftIcon className="h-3.5 w-3.5" />
                      Opérations
                    </button>
                    <span className="text-blue-300 text-sm">/</span>
                    <span className="text-blue-100 text-sm font-medium">
                      {isEdit ? "Modifier" : "Nouvelle"}
                    </span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight font-outfit">
                    {isEdit ? "Modifier l'opération" : "Nouvelle opération"}
                  </h1>
                  <p className="mt-2 text-blue-100 font-medium">
                    {isEdit ? "Modifiez les détails de l'opération" : "Planifiez une nouvelle opération minière"}
                  </p>
                </div>
              </div>

              {/* Quick status pill */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold self-start sm:self-auto flex-shrink-0">
                <span className={`w-2.5 h-2.5 rounded-full ${currentStatus.dot}`} />
                {currentStatus.emoji} {currentStatus.label}
              </div>
            </div>
          </div>
        </div>

        {/* ── ALERTS ── */}
        {success && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 font-medium shadow-sm">
            <CheckCircleIcon className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            {isEdit ? "Opération modifiée avec succès." : "Opération créée avec succès."} Redirection...
          </div>
        )}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 shadow-sm">
            <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <pre className="whitespace-pre-line font-sans text-sm flex-1">{error}</pre>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-xl leading-none ml-auto">×</button>
          </div>
        )}

        <form onSubmit={readOnly ? (e) => e.preventDefault() : handleSubmit} className="space-y-6">

          {/* ── 1 · Informations de base ── */}
          <SectionCard delay="0.05s">
            <SectionHeader
              icon={ClipboardDocumentListIcon}
              iconBg="bg-indigo-100 text-indigo-600"
              title="Informations de l'opération"
              subtitle="Code, type et site concerné"
            />
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                  <HashtagIcon className="h-4 w-4" /> Code opération
                </label>
                <input type="text" name="operation_code" value={formData.operation_code} onChange={handleChange}
                  placeholder="Ex: OPE-2026-001" disabled={readOnly} className={inputCls} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                    <WrenchScrewdriverIcon className="h-4 w-4" /> Type d'opération *
                  </label>
                  <select name="operation_type" value={formData.operation_type} onChange={handleChange}
                    disabled={readOnly} className={inputCls + " appearance-none cursor-pointer"}>
                    {OPERATION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                    <MapPinIcon className="h-4 w-4" /> Site concerné *
                  </label>
                  <select name="site" value={formData.site} onChange={handleChange}
                    disabled={readOnly} className={inputCls + " appearance-none cursor-pointer"}>
                    <option value="">📍 -- Sélectionner un site --</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>{site.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── 2 · Date & Horaires ── */}
          <SectionCard delay="0.1s">
            <SectionHeader
              icon={CalendarDaysIcon}
              iconBg="bg-blue-100 text-blue-600"
              title="Date et horaires"
              subtitle="Planification temporelle de l'opération"
            />
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                  <CalendarDaysIcon className="h-4 w-4" /> Date de l'opération *
                </label>
                <input type="date" name="date" value={formData.date} onChange={handleChange}
                  required disabled={readOnly} className={inputCls} />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                  <ClockIcon className="h-4 w-4" /> Plage horaire
                </label>
                <DateRangeInput
                  startTime={formData.start_time}
                  endTime={formData.end_time}
                  onChange={(start, end) =>
                    setFormData((prev) => ({ ...prev, start_time: start, end_time: end }))
                  }
                  disabled={readOnly}
                />
                {!timeRangeValid && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">
                    <XCircleIcon className="h-4 w-4" />
                    L'heure de début doit être avant l'heure de fin.
                  </p>
                )}
              </div>

              {/* Visualisation plage horaire */}
              {formData.start_time && formData.end_time && timeRangeValid && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/60">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">DÉBUT</p>
                      <p className="text-xl font-bold text-blue-900 font-outfit">{formData.start_time}</p>
                    </div>
                    <div className="flex-1 mx-6">
                      <div className="h-0.5 bg-blue-300 relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow" />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">FIN</p>
                      <p className="text-xl font-bold text-blue-900 font-outfit">{formData.end_time}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── 3 · Statut ── */}
          <SectionCard delay="0.15s">
            <SectionHeader
              icon={ArrowPathIcon}
              iconBg="bg-amber-100 text-amber-600"
              title="Statut de l'opération"
              subtitle="État actuel de l'opération"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STATUS_OPTIONS.map((option) => {
                const isSelected = formData.status === option.value;
                return (
                  <label
                    key={option.value}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer
                      border-2 transition-all duration-200 text-center select-none
                      ${readOnly ? "opacity-50 cursor-not-allowed" : ""}
                      ${isSelected
                        ? `${option.badge} border-current shadow-sm`
                        : "bg-slate-50 border-slate-200/60 hover:border-gray-300 hover:bg-white"
                      }
                    `}
                  >
                    <input type="radio" name="status" value={option.value} checked={isSelected}
                      onChange={handleChange} disabled={readOnly} className="sr-only" />
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="font-semibold text-sm">{option.label}</span>
                    {isSelected && <span className={`w-2 h-2 rounded-full ${option.dot}`} />}
                  </label>
                );
              })}
            </div>
          </SectionCard>

          {/* ── 4 · Détails ── */}
          <SectionCard delay="0.2s">
            <SectionHeader
              icon={CubeIcon}
              iconBg="bg-emerald-100 text-emerald-600"
              title="Détails de l'opération"
              subtitle="Quantité extraite et description"
            />
            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                  <CubeIcon className="h-4 w-4" /> Quantité extraite (tonnes)
                </label>
                <input type="number" name="quantity_extracted" value={formData.quantity_extracted}
                  onChange={handleChange} placeholder="Ex: 1500" disabled={readOnly} className={inputCls} />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 mb-2">
                  <DocumentTextIcon className="h-4 w-4" /> Description
                </label>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  placeholder="Décrivez les détails de l'opération..." rows={5}
                  disabled={readOnly}
                  className={inputCls + " resize-none"} />
              </div>
            </div>
          </SectionCard>

          {/* ── RÉSUMÉ ── */}
          <div className="group relative overflow-hidden rounded-2xl border border-indigo-200 p-6 shadow-lg bg-gradient-to-r from-indigo-50 to-blue-50 animate-fadeInUp" style={{ animationDelay: "0.25s" }}>
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${currentType.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-800 text-lg">
                  {formData.operation_code || "Nouvelle opération"}
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${currentType.bg}`}>
                    {currentType.emoji} {currentType.label}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${currentStatus.badge}`}>
                    <span className={`w-2 h-2 rounded-full ${currentStatus.dot}`} />
                    {currentStatus.label}
                  </span>
                  {formData.date && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100/80 text-slate-700">
                      📅 {new Date(formData.date).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                  {formData.quantity_extracted !== "" && formData.quantity_extracted !== null && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100/80 text-slate-700">
                      ⛏️ {Number(formData.quantity_extracted).toLocaleString("fr-FR")} t
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── ACTIONS ── */}
          <div className="flex items-center justify-between pt-2 animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
            <button
              type="button"
              onClick={() => navigate("/operations")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-600 bg-white/80 border border-slate-200 hover:bg-white hover:border-slate-300 font-semibold transition-all duration-200 shadow-sm"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              {canSubmit ? "Annuler" : "Retour"}
            </button>

            {canSubmit && (
              <button
                type="submit"
                disabled={saving || !timeRangeValid}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-0.5 hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <CheckCircleIcon className="h-5 w-5" />
                {saving ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer l'opération"}
              </button>
            )}
          </div>
        </form>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

        .font-outfit { font-family: 'Outfit', sans-serif; }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInDown {
          animation: fadeInDown 0.7s ease-out forwards;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          animation-fill-mode: both;
          opacity: 0;
        }
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'%3E%3C/path%3E%3C/svg%3E");
          background-position: right 0.75rem center;
          background-repeat: no-repeat;
          background-size: 1.25em 1.25em;
        }
      `}</style>
    </div>
  );
};

export default OperationsForm;