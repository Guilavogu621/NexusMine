import { forwardRef } from 'react';
import { ExclamationCircleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

// Input Field avec animation et validation
export const InputField = forwardRef(({
  label,
  error,
  icon: Icon,
  required,
  helper,
  className = '',
  ...props
}, ref) => (
  <div className={`group ${className}`}>
    {label && (
      <label className="flex items-center gap-1.5 text-base font-semibold text-slate-700 mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <input
        ref={ref}
        className={`
          block w-full rounded-xl border-0 py-3.5 bg-slate-50 text-slate-800 
          ring-1 ring-inset ring-gray-200 placeholder:text-slate-400 
          focus:bg-white focus:ring-2 focus:ring-indigo-500 
          transition-all duration-200 text-base
          ${Icon ? 'pl-11 pr-4' : 'px-4'}
          ${error ? 'ring-red-300 focus:ring-red-500' : ''}
          hover:ring-gray-300
        `}
        {...props}
      />
      {error && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
        </div>
      )}
    </div>
    {error && <p className="mt-2 text-sm text-red-600 flex items-center gap-1">{error}</p>}
    {helper && !error && <p className="mt-2 text-sm text-slate-500">{helper}</p>}
  </div>
));

// Select Field avec style moderne
export const SelectField = forwardRef(({
  label,
  error,
  options = [],
  required,
  placeholder,
  icon: Icon,
  className = '',
  ...props
}, ref) => (
  <div className={`group ${className}`}>
    {label && (
      <label className="flex items-center gap-1.5 text-base font-semibold text-slate-700 mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <select
        ref={ref}
        className={`
          block w-full rounded-xl border-0 py-3.5 bg-slate-50 text-slate-800 
          ring-1 ring-inset ring-gray-200 
          focus:bg-white focus:ring-2 focus:ring-indigo-500 
          transition-all duration-200 text-base appearance-none cursor-pointer
          ${Icon ? 'pl-11 pr-10' : 'pl-4 pr-10'}
          ${error ? 'ring-red-300 focus:ring-red-500' : ''}
          hover:ring-gray-300
        `}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
    {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
  </div>
));

// Textarea avec style moderne
export const TextareaField = forwardRef(({
  label,
  error,
  required,
  rows = 4,
  className = '',
  ...props
}, ref) => (
  <div className={className}>
    {label && (
      <label className="flex items-center gap-1.5 text-base font-semibold text-slate-700 mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <textarea
      ref={ref}
      rows={rows}
      className={`
        block w-full rounded-xl border-0 py-3.5 px-4 bg-slate-50 text-slate-800 
        ring-1 ring-inset ring-gray-200 placeholder:text-slate-400 
        focus:bg-white focus:ring-2 focus:ring-indigo-500 
        transition-all duration-200 text-base resize-none
        ${error ? 'ring-red-300 focus:ring-red-500' : ''}
        hover:ring-gray-300
      `}
      {...props}
    />
    {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
  </div>
));

// Checkbox moderne
export const Checkbox = ({ label, description, className = '', ...props }) => (
  <label className={`flex items-start gap-3 cursor-pointer group ${className}`}>
    <div className="flex items-center h-5 mt-0.5">
      <input
        type="checkbox"
        className="h-5 w-5 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer transition-all"
        {...props}
      />
    </div>
    <div>
      <span className="text-base font-medium text-slate-600 group-hover:text-slate-800 transition-colors">{label}</span>
      {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
    </div>
  </label>
);

// Radio Group moderne
export const RadioGroup = ({ label, options = [], value, onChange, name, className = '' }) => (
  <div className={className}>
    {label && <p className="text-base font-medium text-slate-600 mb-3">{label}</p>}
    <div className="space-y-2">
      {options.map((option) => (
        <label
          key={option.value}
          className={`
            flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
            ${value === option.value
              ? 'bg-indigo-50 ring-2 ring-blue-500'
              : 'bg-slate-50 hover:bg-slate-100 ring-1 ring-gray-200'
            }
          `}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <div>
            <span className="text-base font-medium text-slate-800">{option.label}</span>
            {option.description && (
              <p className="text-sm text-slate-500 mt-0.5">{option.description}</p>
            )}
          </div>
        </label>
      ))}
    </div>
  </div>
);

// Switch Toggle
export const Switch = ({ label, description, checked, onChange, className = '' }) => (
  <label className={`flex items-center justify-between cursor-pointer group ${className}`}>
    <div>
      <span className="text-base font-medium text-slate-600">{label}</span>
      {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full 
        border-2 border-transparent transition-colors duration-200 ease-in-out 
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        ${checked ? 'bg-indigo-600' : 'bg-slate-200'}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full 
          bg-white shadow ring-0 transition duration-200 ease-in-out
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  </label>
);

// Date Input
export const DateField = forwardRef(({ label, error, required, className = '', ...props }, ref) => (
  <div className={className}>
    {label && (
      <label className="flex items-center gap-1.5 text-base font-semibold text-slate-700 mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      ref={ref}
      type="date"
      className={`
        block w-full rounded-xl border-0 py-3.5 px-4 bg-slate-50 text-slate-800 
        ring-1 ring-inset ring-gray-200 
        focus:bg-white focus:ring-2 focus:ring-indigo-500 
        transition-all duration-200 text-base
        ${error ? 'ring-red-300 focus:ring-red-500' : ''}
        hover:ring-gray-300
      `}
      {...props}
    />
    {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
  </div>
));

// Time Input
export const TimeField = forwardRef(({ label, error, required, className = '', ...props }, ref) => (
  <div className={className}>
    {label && (
      <label className="flex items-center gap-1.5 text-base font-semibold text-slate-700 mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      ref={ref}
      type="time"
      className={`
        block w-full rounded-xl border-0 py-3.5 px-4 bg-slate-50 text-slate-800 
        ring-1 ring-inset ring-gray-200 
        focus:bg-white focus:ring-2 focus:ring-indigo-500 
        transition-all duration-200 text-base
        ${error ? 'ring-red-300 focus:ring-red-500' : ''}
        hover:ring-gray-300
      `}
      {...props}
    />
    {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
  </div>
));

// Number Input avec +/- buttons
export const NumberField = forwardRef(({
  label,
  error,
  required,
  min,
  max,
  step = 1,
  value,
  onChange,
  className = '',
  ...props
}, ref) => {
  const increment = () => {
    const newValue = (parseFloat(value) || 0) + step;
    if (max === undefined || newValue <= max) {
      onChange({ target: { value: newValue, name: props.name } });
    }
  };

  const decrement = () => {
    const newValue = (parseFloat(value) || 0) - step;
    if (min === undefined || newValue >= min) {
      onChange({ target: { value: newValue, name: props.name } });
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="flex items-center gap-1.5 text-base font-semibold text-slate-700 mb-2">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex items-center">
        <button
          type="button"
          onClick={decrement}
          className="p-3.5 rounded-l-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors ring-1 ring-inset ring-gray-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <input
          ref={ref}
          type="number"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          className={`
            block w-full border-0 py-3 px-4 bg-slate-50 text-slate-800 text-center
            ring-1 ring-inset ring-gray-200 
            focus:bg-white focus:ring-2 focus:ring-indigo-500 
            transition-all duration-200 text-base
            ${error ? 'ring-red-300 focus:ring-red-500' : ''}
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
          `}
          {...props}
        />
        <button
          type="button"
          onClick={increment}
          className="p-3 rounded-r-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors ring-1 ring-inset ring-gray-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
});

// File Upload avec drag & drop
export const FileUpload = ({
  label,
  accept,
  onChange,
  preview,
  error,
  helper,
  className = ''
}) => {
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onChange(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onChange(file);
  };

  return (
    <div className={className}>
      {label && <label className="block text-base font-semibold text-slate-700 mb-2">{label}</label>}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          transition-all duration-200 hover:border-indigo-400 hover:bg-indigo-50/50
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'}
        `}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {preview ? (
          <img src={preview} alt="Preview" className="mx-auto h-24 w-24 object-cover rounded-lg" />
        ) : (
          <>
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mt-2 text-base text-slate-500">
              <span className="font-medium text-indigo-600">Cliquez pour télécharger</span> ou glissez-déposez
            </p>
            <p className="mt-1 text-sm text-slate-500">{helper || 'PNG, JPG jusqu\'à 10MB'}</p>
          </>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// Alert/Message Box
export const Alert = ({ type = 'info', title, children, onClose, className = '' }) => {
  const styles = {
    info: 'bg-indigo-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  const icons = {
    info: InformationCircleIcon,
    success: CheckCircleIcon,
    warning: ExclamationCircleIcon,
    error: ExclamationCircleIcon,
  };

  const Icon = icons[type];

  return (
    <div className={`rounded-xl border p-4 ${styles[type]} ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {title && <p className="font-medium text-base">{title}</p>}
          <div className="text-base mt-1">{children}</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="flex-shrink-0 hover:opacity-70 transition-opacity">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// Buttons
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading,
  disabled,
  fullWidth,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm focus:ring-indigo-500',
    secondary: 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-300 focus:ring-slate-400',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm focus:ring-emerald-500',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm focus:ring-rose-500',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm focus:ring-amber-500',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
    outline: 'border border-slate-300 text-slate-600 hover:bg-slate-50 focus:ring-slate-400',
  };

  const sizes = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-6 py-3.5 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 hover:-translate-y-0.5
        ${fullWidth ? 'w-full' : ''}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
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

// Badge/Tag
export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-600',
    primary: 'bg-indigo-50 text-indigo-700',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-rose-50 text-rose-700',
    purple: 'bg-violet-50 text-violet-700',
  };

  const sizes = {
    xs: 'px-2.5 py-0.5 text-xs',
    sm: 'px-3 py-1 text-sm',
    md: 'px-3.5 py-1.5 text-base',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

// Card Container
export const Card = ({ children, title, subtitle, action, padding = true, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60">
        <div>
          {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    <div className={padding ? 'p-6' : ''}>{children}</div>
  </div>
);

// Form Section Divider
export const FormSection = ({ title, description, children, className = '' }) => (
  <div className={`${className}`}>
    {(title || description) && (
      <div className="mb-5">
        {title && <h4 className="text-lg font-semibold text-slate-800">{title}</h4>}
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
    )}
    {children}
  </div>
);

// Separator
export const Separator = ({ className = '' }) => (
  <div className={`border-t border-slate-200/60 my-6 ${className}`} />
);

InputField.displayName = 'InputField';
SelectField.displayName = 'SelectField';
TextareaField.displayName = 'TextareaField';
DateField.displayName = 'DateField';
TimeField.displayName = 'TimeField';
NumberField.displayName = 'NumberField';
