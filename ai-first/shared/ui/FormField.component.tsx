/**
 * 📝 Form Field Component
 */

import React from 'react';

export const AI_INTERFACE = {
  purpose: "Generic form field component",
  exports: ["FormField"],
  patterns: ["ui-component"]
};

export interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password';
}

export function FormField({ label, value, onChange, type = 'text' }: FormFieldProps) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default FormField;
