import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

/**
 * Composant de validation de plage de dates réutilisable
 * Supporte validation en temps réel avec indicateurs visuels
 */
export default function DateRangeInput({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  startLabel = 'Date de début',
  endLabel = 'Date de fin',
  startName = 'start_date',
  endName = 'end_date',
  type = 'datetime-local', // 'datetime-local', 'date', 'time'
  required = false,
  disabled = false,
  showDuration = true,
  onValidationChange, // Callback pour communiquer l'état de validation
}) {
  const [errors, setErrors] = useState({});

  // Valider la plage de dates en temps réel
  useEffect(() => {
    const validateRange = () => {
      const newErrors = {};

      if (!startValue || !endValue) {
        onValidationChange?.({ isValid: null, errors: newErrors });
        return;
      }

      const startDate = new Date(startValue);
      const endDate = new Date(endValue);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        onValidationChange?.({ isValid: false, errors: newErrors });
        return;
      }

      if (startDate >= endDate) {
        newErrors.endValue = 'La date/heure de fin doit être après celle de début';
        onValidationChange?.({ isValid: false, errors: newErrors });
      } else {
        onValidationChange?.({ isValid: true, errors: newErrors });
      }

      setErrors(newErrors);
    };

    validateRange();
  }, [startValue, endValue, onValidationChange]);

  const handleStartChange = (e) => {
    onStartChange(e.target.value);
  };

  const handleEndChange = (e) => {
    onEndChange(e.target.value);
  };

  const isValid = startValue && endValue && !errors.endValue;
  const isPartiallyFilled = (startValue || endValue) && !(startValue && endValue);

  // Calculer la durée
  const calculateDuration = () => {
    if (!startValue || !endValue) return '';
    try {
      const start = new Date(startValue);
      const end = new Date(endValue);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';

      const diffMs = end - start;
      const diffMins = Math.floor(diffMs / (1000 * 60));

      if (diffMins < 0) return '';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''}`;
      if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        return `${hours} heure${hours > 1 ? 's' : ''}`;
      }
      const days = Math.floor(diffMins / 1440);
      return `${days} jour${days > 1 ? 's' : ''}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Champ de début */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          {startLabel}
          {required && <span className="text-red-500"> *</span>}
        </label>
        <input
          type={type}
          name={startName}
          value={startValue || ''}
          onChange={handleStartChange}
          disabled={disabled}
          required={required}
          className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
            disabled
              ? 'bg-slate-50 cursor-not-allowed border-slate-200'
              : errors.endValue
              ? 'border-amber-400 bg-amber-50 focus:ring-2 focus:ring-amber-500/20'
              : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
          }`}
        />
      </div>

      {/* Champ de fin */}
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          {endLabel}
          {required && <span className="text-red-500"> *</span>}
        </label>
        <input
          type={type}
          name={endName}
          value={endValue || ''}
          onChange={handleEndChange}
          disabled={disabled}
          required={required}
          className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
            disabled
              ? 'bg-slate-50 cursor-not-allowed border-slate-200'
              : errors.endValue
              ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500/20'
              : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
          }`}
        />
        {errors.endValue && (
          <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
            <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
            {errors.endValue}
          </p>
        )}
      </div>

      {/* Indicateur de validation */}
      {startValue && endValue && (
        <div
          className={`p-4 rounded-xl border transition-all ${
            isValid
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className={`flex items-center gap-2 text-sm font-semibold ${
            isValid ? 'text-emerald-700' : 'text-red-700'
          }`}>
            {isValid ? (
              <>
                <CheckCircleIcon className="h-5 w-5" />
                Plage valide
              </>
            ) : (
              <>
                <ExclamationTriangleIcon className="h-5 w-5" />
                Plage invalide
              </>
            )}
          </div>
          {isValid && showDuration && (
            <p className="text-xs text-emerald-600 mt-1">
              Durée: {calculateDuration()}
            </p>
          )}
        </div>
      )}

      {/* Message si partiellement rempli */}
      {isPartiallyFilled && (
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-sm text-slate-600">
            Remplissez les deux champs pour valider la plage
          </p>
        </div>
      )}
    </div>
  );
}
