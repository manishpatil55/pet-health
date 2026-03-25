import { type SelectHTMLAttributes, forwardRef } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, helperText, options, placeholder, id, className = '', ...props },
    ref,
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-[#2F3A3A] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full appearance-none rounded-lg border bg-white px-3.5 py-2.5 pr-10
              text-sm text-[#2F3A3A]
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-[#4FB6B2] focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#F7FAFA]
              ${error
                ? 'border-[#E76F51] focus:ring-[#E76F51]'
                : 'border-[#E6EEEE] hover:border-[#4FB6B2]/40'
              }
              ${className}
            `}
            aria-invalid={!!error}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A8A8A] pointer-events-none" />
        </div>
        {error && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-[#E76F51]">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-[#7A8A8A]">{helperText}</p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';

export { Select };
export type { SelectProps, SelectOption };
