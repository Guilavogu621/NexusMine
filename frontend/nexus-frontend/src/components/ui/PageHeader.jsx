import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function PageHeader({ 
  title, 
  subtitle, 
  backLink, 
  icon: Icon,
  iconColor = 'bg-indigo-600',
  actions,
  breadcrumbs,
  className = '' 
}) {
  return (
    <div className={`animate-fadeIn ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <nav className="flex items-center gap-2 text-base text-slate-400 mb-4">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span className="text-slate-300">/</span>}
              {crumb.link ? (
                <Link to={crumb.link} className="hover:text-indigo-600 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-indigo-600 font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {backLink && (
            <Link
              to={backLink}
              className="p-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-500 transition-all hover:-translate-x-0.5 border border-slate-200/60 shadow-sm"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
          )}
          
          {Icon && (
            <div className={`p-3.5 rounded-xl flex items-center justify-center ${iconColor}`}>
              <Icon className="h-7 w-7 text-white" />
            </div>
          )}
          
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
            {subtitle && <p className="mt-1 text-base text-slate-500">{subtitle}</p>}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
