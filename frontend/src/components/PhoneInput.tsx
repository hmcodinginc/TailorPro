import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface CountryCode {
  code: string; // e.g. "+91"
  country: string; // e.g. "IN"
  label: string; // e.g. "India (+91)"
  flag: string; // e.g. "🇮🇳"
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: "+91", country: "IN", label: "India", flag: "🇮🇳" },
  { code: "+1", country: "US", label: "US / Canada", flag: "🇺🇸" },
  { code: "+44", country: "GB", label: "UK", flag: "🇬🇧" },
  { code: "+971", country: "AE", label: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "SA", label: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+65", country: "SG", label: "Singapore", flag: "🇸🇬" },
  { code: "+61", country: "AU", label: "Australia", flag: "🇦🇺" },
  { code: "+49", country: "DE", label: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "FR", label: "France", flag: "🇫🇷" },
  { code: "+880", country: "BD", label: "Bangladesh", flag: "🇧🇩" },
  { code: "+977", country: "NP", label: "Nepal", flag: "🇳🇵" },
  { code: "+94", country: "LK", label: "Sri Lanka", flag: "🇱🇰" },
];

interface PhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
}

export function parsePhoneNumber(val: string): { countryCode: string; nationalNumber: string } {
  if (!val) return { countryCode: "+91", nationalNumber: "" };
  const trimmed = val.trim();
  for (const c of COUNTRY_CODES) {
    if (trimmed.startsWith(c.code)) {
      return {
        countryCode: c.code,
        nationalNumber: trimmed.slice(c.code.length).trim(),
      };
    }
  }
  return { countryCode: "+91", nationalNumber: trimmed.replace(/^\+91/, "").trim() };
}

export function PhoneInput({
  value,
  onChange,
  placeholder = "98765 43210",
  className,
  disabled = false,
  required = false,
  id,
}: PhoneInputProps) {
  const { countryCode, nationalNumber } = useMemo(() => parsePhoneNumber(value), [value]);

  const handleCountryChange = (newCode: string) => {
    if (!nationalNumber) {
      onChange(newCode + " ");
    } else {
      onChange(`${newCode} ${nationalNumber}`);
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!raw.trim()) {
      onChange("");
    } else {
      onChange(`${countryCode} ${raw.trim()}`);
    }
  };

  return (
    <div className={cn("flex items-center gap-1.5 w-full", className)}>
      <Select value={countryCode} onValueChange={handleCountryChange} disabled={disabled}>
        <SelectTrigger className="w-[105px] shrink-0 h-9 rounded-xl border-gray-200 bg-background text-xs font-medium focus:ring-2 focus:ring-sky-500/20">
          <SelectValue placeholder="+91" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {COUNTRY_CODES.map((c) => (
            <SelectItem key={`${c.country}-${c.code}`} value={c.code} className="text-xs">
              <span className="mr-1.5">{c.flag}</span>
              <span>{c.code}</span>
              <span className="text-muted-foreground ml-1 text-[10px]">({c.label})</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        type="tel"
        placeholder={placeholder}
        value={nationalNumber}
        onChange={handleNumberChange}
        disabled={disabled}
        required={required}
        className="flex-1 h-9 rounded-xl border-gray-200 bg-background text-sm focus:ring-2 focus:ring-sky-500/20"
      />
    </div>
  );
}
