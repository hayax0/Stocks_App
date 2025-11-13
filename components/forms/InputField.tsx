import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface FormInputProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  validation?: object;
  disabled?: boolean;
  value?: string;
}

const InputField = ({ 
  name, 
  label, 
  placeholder, 
  type = "text", 
  register, 
  error, 
  validation, 
  disabled 
}: FormInputProps) => {
  return (
    <div className='space-y-2'>
      <Label htmlFor={name} className="form-label text-white">
        {label}
      </Label>
      
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...register(name, validation)}
        className="w-full bg-gray-800 border-gray-700 text-white focus:border-blue-500"
      />
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
      )}
    </div>
  );
};

export default InputField;