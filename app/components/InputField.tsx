'use client';

import React from 'react';

type Option = { label: string; value: string };

type CommonProps = {
  label: string;
  name: string;
  required?: boolean;
  className?: string;
};

type TextLikeProps = CommonProps & {
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type TextareaProps = CommonProps & {
  textarea: true;
  placeholder?: string;
  rows?: number;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

type SelectProps = CommonProps & {
  select: true;
  options: Option[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

type CheckboxProps = CommonProps & {
  type: 'checkbox';
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type InputFieldProps = TextLikeProps | TextareaProps | SelectProps | CheckboxProps;

export default function InputField(props: InputFieldProps) {
  const labelClass = 'block text-sm font-medium text-gray-200';
  const baseClass =
    'block w-full mt-2 px-3 py-2 bg-[var(--color-bg)] text-white placeholder-gray-400 border border-token rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]';

  if ('textarea' in props) {
    const { label, name, rows = 4, placeholder, required, className, value, onChange } = props;
    return (
      <div className={className}>
        <label htmlFor={name} className={labelClass}>
          {label}
        </label>
        <textarea
          id={name}
          name={name}
          rows={rows}
          placeholder={placeholder}
          required={required}
          className={`${baseClass} resize-none`}
          value={value}
          onChange={onChange}
        />
      </div>
    );
  }

  if ('select' in props) {
    const { label, name, options, required, className, value, onChange } = props;
    return (
      <div className={className}>
        <label htmlFor={name} className={labelClass}>
          {label}
        </label>
        <select id={name} name={name} required={required} className={baseClass} value={value} onChange={onChange}>
          <option value="" disabled>
            Select an option
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (props.type === 'checkbox') {
    const { label, name, required, className, checked, onChange } = props;
    return (
      <div className={`flex items-center gap-2 ${className ?? ''}`}>
        <input
          id={name}
          name={name}
          type="checkbox"
          required={required}
          className="h-4 w-4 rounded border-token bg-[var(--color-bg)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          checked={checked}
          onChange={onChange}
        />
        <label htmlFor={name} className={labelClass}>
          {label}
        </label>
      </div>
    );
  }

  const { label, name, type = 'text', placeholder, required, className, value, onChange } = props as TextLikeProps;
  return (
    <div className={className}>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className={baseClass}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
