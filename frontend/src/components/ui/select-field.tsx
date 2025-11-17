/**
 * SelectField - Backward compatible wrapper for shadcn Select
 */
import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface SelectFieldProps {
  label?: string
  name?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onValueChange?: (value: string) => void
  options: Array<{ value: string; label: string }>
  required?: boolean
  disabled?: boolean
  error?: string
  placeholder?: string
  className?: string
}

export const SelectField = React.forwardRef<HTMLButtonElement, SelectFieldProps>(
  ({ label, name, value, onChange, onValueChange, options, required, disabled, error, placeholder, className }, ref) => {
    const handleValueChange = (newValue: string) => {
      if (onValueChange) {
        onValueChange(newValue)
      }
      if (onChange && name) {
        // Create synthetic event for backward compatibility
        const syntheticEvent = {
          target: { name, value: newValue },
        } as React.ChangeEvent<HTMLSelectElement>
        onChange(syntheticEvent)
      }
    }

    return (
      <div className={className}>
        {label && (
          <Label htmlFor={name} className="mb-2 block">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        <Select
          value={value}
          onValueChange={handleValueChange}
          disabled={disabled}
          required={required}
        >
          <SelectTrigger ref={ref} id={name} className="w-full">
            <SelectValue placeholder={placeholder || "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>
    )
  }
)

SelectField.displayName = "SelectField"
