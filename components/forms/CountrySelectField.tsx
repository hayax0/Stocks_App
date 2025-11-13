'use client';

import { Label } from "@/components/ui/label"
import { Controller, Control, FieldError } from "react-hook-form"
import { useMemo } from "react"
import dynamic from "next/dynamic"
import countryList from "react-select-country-list"
import * as flags from "country-flag-icons/react/3x2"

// Importar react-select dinamicamente SEM SSR
const Select = dynamic(() => import("react-select"), { ssr: false })

interface CountrySelectFieldProps {
  name: string;
  label: string;
  placeholder: string;
  control: Control<any>;
  error?: FieldError;
  required?: boolean;
}

const CountrySelectField = ({
  name,
  label,
  placeholder,
  control,
  error,
  required = false
}: CountrySelectFieldProps) => {
  const countries = useMemo(() => countryList().getData(), [])

  const formatOptionLabel = ({ label, value }: any) => {
    const FlagComponent = (flags as any)[value]
    return (
      <div className="flex items-center gap-3">
        {FlagComponent && <FlagComponent className="w-6 h-4" />}
        <span>{label}</span>
      </div>
    )
  }

  const customStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: '#111827',
      borderColor: '#374151',
      minHeight: '48px',
      '&:hover': {
        borderColor: '#4B5563',
      },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: '#1F2937',
      border: '1px solid #374151',
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? '#374151' : '#1F2937',
      color: 'white',
      '&:hover': {
        backgroundColor: '#374151',
      },
    }),
    singleValue: (base: any) => ({
      ...base,
      color: 'white',
    }),
    input: (base: any) => ({
      ...base,
      color: 'white',
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#9CA3AF',
    }),
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="form-label text-white">{label}</Label>

      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `Please select ${label.toLowerCase()}` : false,
        }}
        render={({ field }) => (
          <Select
            {...field}
            options={countries}
            formatOptionLabel={formatOptionLabel}
            placeholder={placeholder}
            styles={customStyles}
            isSearchable
            value={countries.find(c => c.value === field.value)}
            onChange={(val: any) => field.onChange(val?.value)}
          />
        )}
      />

      {error && (
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
      )}
    </div>
  )
}

export default CountrySelectField