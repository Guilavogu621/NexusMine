import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  PlusIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// Page Container avec gradient subtil
export const PageContainer = ({ children, className = '' }) => (
  <div className={`min-h-screen ${className}`}>
    {children}
  </div>
);

// Premium Page Header
export const PremiumPageHeader = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  iconColor = 'bg-indigo-500',
  badge,
  actions,
  stats = []
}) => (
  <div className="relative overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200/60 mb-6">
    <div className="relative p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className={`relative p-3.5 rounded-xl ${iconColor}`}>
              <Icon className="h-6 w-6 text-white relative" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
              {badge && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="mt-1 text-slate-500 text-sm">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>

      {/* Stats row */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200/60">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
              {stat.trend && (
                <div className={`flex items-center justify-center gap-1 mt-1 text-xs font-medium ${
                  stat.trendUp ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trendUp ? (
                    <ArrowTrendingUpIcon className="h-3 w-3" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-3 w-3" />
                  )}
                  {stat.trend}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// Premium Button
export const PremiumButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700',
    secondary: 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50',
    success: 'bg-emerald-600 text-white shadow-sm hover:shadow-md',
    danger: 'bg-rose-600 text-white shadow-sm hover:shadow-md',
    ghost: 'text-slate-600 hover:bg-slate-100',
  };

  const sizes = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="h-5 w-5" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="h-5 w-5" />}
        </>
      )}
    </button>
  );
};

// Premium Search & Filters Bar
export const PremiumFiltersBar = ({ 
  searchValue, 
  onSearchChange, 
  searchPlaceholder = 'Rechercher...',
  filters = [],
  children 
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Search */}
      <div className="relative flex-1">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-11 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      </div>

      {/* Filters */}
      {filters.map((filter, index) => (
        <div key={index} className="relative">
          <select
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="appearance-none w-full lg:w-48 pl-4 pr-10 py-3 bg-slate-50 border-0 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
          >
            <option value="">{filter.placeholder}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
        </div>
      ))}

      {children}
    </div>
  </div>
);

// Premium Data Card (pour affichage liste)
export const PremiumDataCard = ({
  id: _id,
  icon: Icon,
  iconColor = 'bg-indigo-500',
  title,
  subtitle,
  badges = [],
  details = [],
  actions = [],
  href,
  onClick,
}) => {
  const CardWrapper = href ? Link : 'div';
  const wrapperProps = href ? { to: href } : { onClick };

  return (
    <CardWrapper
      {...wrapperProps}
      className="group relative bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 cursor-pointer"
    >
      {/* Hover gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 to-violet-500/0 group-hover:from-indigo-500/[0.02] group-hover:to-violet-500/[0.02] transition-all"></div>
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${iconColor} shadow-lg group-hover:scale-110 transition-transform`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          
          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex gap-2">
              {badges.map((badge, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.className}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        {details.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {details.map((detail, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {detail.icon && <detail.icon className="h-4 w-4 text-slate-400" />}
                <span className="text-slate-500">{detail.label}:</span>
                <span className="font-medium text-slate-800">{detail.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  action.onClick();
                }}
                className={`p-2 rounded-lg transition-colors ${action.className || 'text-slate-400 hover:text-slate-500 hover:bg-slate-100'}`}
                title={action.label}
              >
                <action.icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        )}
      </div>
    </CardWrapper>
  );
};

// Premium Stats Card
export const PremiumStatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  color = 'blue',
  subtitle,
}) => {
  const colors = {
    blue: { bg: 'from-indigo-500 to-blue-600', light: 'bg-blue-50', text: 'text-blue-600' },
    green: { bg: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-600' },
    yellow: { bg: 'from-amber-500 to-amber-600', light: 'bg-amber-50', text: 'text-amber-600' },
    red: { bg: 'from-red-500 to-red-600', light: 'bg-red-50', text: 'text-red-600' },
    purple: { bg: 'from-purple-500 to-purple-600', light: 'bg-purple-50', text: 'text-purple-600' },
    cyan: { bg: 'from-cyan-500 to-cyan-600', light: 'bg-cyan-50', text: 'text-cyan-600' },
  };

  const c = colors[color];

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-all group">
      {/* Background decoration */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${c.bg} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`}></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${c.bg} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {trendUp ? (
                <ArrowTrendingUpIcon className="h-3 w-3" />
              ) : (
                <ArrowTrendingDownIcon className="h-3 w-3" />
              )}
              {trend}
            </div>
          )}
        </div>
        
        <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        {subtitle && (
          <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

// Premium Empty State
export const PremiumEmptyState = ({
  icon: IconComponent,
  title,
  description,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-6">
    <div className="relative">
      <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl"></div>
      <div className="relative w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
        <IconComponent className="h-10 w-10 text-slate-400" />
      </div>
    </div>
    <h3 className="mt-6 text-lg font-semibold text-slate-800">{title}</h3>
    <p className="mt-2 text-sm text-slate-500 text-center max-w-sm">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

// Premium Card Grid
export const PremiumCardGrid = ({ children, columns = 3 }) => {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${colsClass[columns]} gap-4`}>
      {children}
    </div>
  );
};

// Premium Table
export const PremiumTable = ({ columns, data, actions, loading, emptyIcon, emptyText }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="animate-pulse p-6">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 mb-4">
              <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    const EmptyIcon = emptyIcon;
    return (
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <PremiumEmptyState
          icon={EmptyIcon}
          title={emptyText || 'Aucune donnée'}
          description="Commencez par ajouter des éléments"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50/50">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-indigo-50/30 transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Action Button pour les tables
export const ActionButton = ({ icon: Icon, label, onClick, variant = 'default' }) => {
  const variants = {
    default: 'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
    view: 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50',
    edit: 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50',
    delete: 'text-slate-400 hover:text-rose-600 hover:bg-rose-50',
  };

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${variants[variant]}`}
      title={label}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
};

// Export des icônes utilisées fréquemment
export { 
  PlusIcon, 
  EyeIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  FunnelIcon 
};
