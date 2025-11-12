'use client';

import React from 'react';

export interface InputFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'textarea';
  placeholder?: string;
  value: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  required,
  onChange,
}) => (
  <div style={{ marginBottom: '15px' }}>
    <label htmlFor={name}>{label}{required ? ' *' : ''}</label>
    {type === 'textarea' ? (
      <textarea
        name={name}
        id={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={4}
        required={required}
        style={{ width: '100%', padding: '10px', margin: '8px 0', resize: 'none' }}
      />
    ) : (
      <input
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        style={{ width: '100%', padding: '10px', margin: '8px 0' }}
      />
    )}
  </div>
);

export default InputField;
