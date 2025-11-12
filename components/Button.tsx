'use client';

import React from 'react';

export interface ButtonProps {
  text: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ text, type = 'button', onClick, disabled, className }) => {
  const baseClass = `btn-base ${disabled ? 'opacity-60 cursor-not-allowed bg-surface' : 'btn-primary'} `;

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={baseClass + (className ? className : '')}
    >
      {text}
    </button>
  );
};

export default Button;
