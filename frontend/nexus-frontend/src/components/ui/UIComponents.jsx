import { SparklesIcon } from '@heroicons/react/24/outline';

// Loading Spinner moderne
export const LoadingSpinner = ({ text = 'Chargement...', size = 'md' }) => {
  const sizes = {
    sm: { container: 'h-32', spinner: 'w-10 h-10', icon: 'h-4 w-4', text: 'text-sm' },
    md: { container: 'h-64', spinner: 'w-16 h-16', icon: 'h-6 w-6', text: 'text-base' },
    lg: { container: 'h-96', spinner: 'w-20 h-20', icon: 'h-8 w-8', text: 'text-lg' },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center justify-center ${s.container}`}>
      <div className="text-center">
        <div className="relative inline-flex">
          <div className={`${s.spinner} border-4 border-slate-200 rounded-full animate-spin border-t-indigo-600`}></div>
          <SparklesIcon className={`${s.icon} text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`} />
        </div>
        {text && <p className={`mt-4 text-slate-500 font-medium ${s.text}`}>{text}</p>}
      </div>
    </div>
  );
};

// Skeleton Loader pour les cards
export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-xl p-6 shadow-sm border border-slate-200/60 animate-pulse ${className}`}>
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      <div className="h-3 bg-gray-200 rounded w-4/6"></div>
    </div>
  </div>
);

// Skeleton Loader pour les tableaux
export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden animate-pulse">
    <div className="border-b border-slate-200/60 p-4">
      <div className="flex gap-4">
        {[...Array(cols)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded flex-1"></div>
        ))}
      </div>
    </div>
    {[...Array(rows)].map((_, rowIndex) => (
      <div key={rowIndex} className="border-b border-slate-100 p-4">
        <div className="flex gap-4 items-center">
          {[...Array(cols)].map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1"></div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Empty State
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => (
  <div className={`text-center py-12 ${className}`}>
    {Icon && (
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
    )}
    <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
    {description && <p className="mt-2 text-base text-slate-500 max-w-md mx-auto">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

// Confirmation Modal
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger',
  loading = false
}) => {
  if (!isOpen) return null;

  const variants = {
    danger: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500',
    warning: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500',
    primary: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-modalIn">
          <div className="text-center">
            <div className={`mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4 ${variant === 'danger' ? 'bg-red-100' :
                variant === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
              }`}>
              <svg className={`h-7 w-7 ${variant === 'danger' ? 'text-red-600' :
                  variant === 'warning' ? 'text-amber-600' : 'text-blue-600'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
            <p className="mt-2 text-base text-slate-500">{message}</p>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-slate-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${variants[variant]}`}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : confirmText}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modalIn {
          animation: modalIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// Toast Notification
export const Toast = ({ message, type = 'success', onClose }) => {
  const types = {
    success: { bg: 'bg-green-50 border-green-200', icon: 'text-green-500', text: 'text-green-800' },
    error: { bg: 'bg-red-50 border-red-200', icon: 'text-red-500', text: 'text-red-800' },
    warning: { bg: 'bg-yellow-50 border-yellow-200', icon: 'text-yellow-500', text: 'text-yellow-800' },
    info: { bg: 'bg-blue-50 border-blue-200', icon: 'text-blue-500', text: 'text-blue-800' },
  };

  const t = types[type];

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slideUp ${t.bg}`}>
      {type === 'success' && (
        <svg className={`h-5 w-5 ${t.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {type === 'error' && (
        <svg className={`h-5 w-5 ${t.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className={`text-base font-medium ${t.text}`}>{message}</span>
      {onClose && (
        <button onClick={onClose} className={`ml-2 ${t.icon} hover:opacity-70`}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// Stats Mini Card
export const StatsMini = ({ label, value, trend, trendUp, icon: IconComponent, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <IconComponent className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-base text-slate-500">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-xl font-bold text-slate-800">{value}</p>
          {trend && (
            <span className={`text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Progress Bar
export const ProgressBar = ({ value, max = 100, color = 'blue', showLabel = true, size = 'md' }) => {
  const percent = Math.min((value / max) * 100, 100);

  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div>
      {showLabel && (
        <div className="flex justify-between text-base mb-1">
          <span className="text-slate-500">{value} / {max}</span>
          <span className="font-medium text-slate-800">{Math.round(percent)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`${colors[color]} ${sizes[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
};

// Avatar
export const Avatar = ({ src, name, size = 'md', status }) => {
  const sizes = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-14 w-14 text-lg',
    xl: 'h-20 w-20 text-xl',
  };

  const statusSizes = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };

  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="relative inline-flex">
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover ring-2 ring-white`}
        />
      ) : (
        <div className={`${sizes[size]} rounded-full bg-linear-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-semibold ring-2 ring-white`}>
          {initials}
        </div>
      )}
      {status && (
        <span className={`absolute bottom-0 right-0 ${statusSizes[size]} ${statusColors[status]} rounded-full ring-2 ring-white`}></span>
      )}
    </div>
  );
};
