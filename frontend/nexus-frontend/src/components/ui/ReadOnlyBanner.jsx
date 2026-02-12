import { InformationCircleIcon } from '@heroicons/react/24/outline';

/**
 * Bandeau affiché en haut d'un formulaire en lecture seule.
 */
export default function ReadOnlyBanner({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-5 py-3.5 mb-6">
      <InformationCircleIcon className="h-6 w-6 text-amber-500 flex-shrink-0" />
      <p className="text-sm font-medium text-amber-700">{message}</p>
    </div>
  );
}
