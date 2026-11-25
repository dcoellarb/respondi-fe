"use client";

import type { ChangeEvent, FocusEvent } from "react";
import { TextField } from "@/components/ui/text-field";

export type AddressFormValues = {
  line1: string;
  line2: string;
  mapsUrl: string;
};

type AddressFieldErrors = Partial<Record<keyof AddressFormValues, string>>;
type AddressFieldTouched = Partial<Record<keyof AddressFormValues, boolean>>;

type AddressFieldsProps = {
  namePrefix: string;
  values: AddressFormValues;
  disabled?: boolean;
  submitCount: number;
  errors?: AddressFieldErrors;
  touched?: AddressFieldTouched;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
};

function showError(
  submitCount: number,
  touched: boolean | undefined,
  error: string | undefined,
) {
  return (submitCount > 0 || touched) && error ? error : undefined;
}

export function AddressFields({
  namePrefix,
  values,
  disabled,
  submitCount,
  errors,
  touched,
  onChange,
  onBlur,
}: AddressFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <TextField
        label="Dirección"
        name={`${namePrefix}.line1`}
        autoComplete="street-address"
        autoCapitalize="sentences"
        enterKeyHint="next"
        value={values.line1}
        onChange={onChange}
        onBlur={onBlur}
        error={showError(submitCount, touched?.line1, errors?.line1)}
        disabled={disabled}
        maxLength={200}
      />
      <TextField
        label="Complemento"
        name={`${namePrefix}.line2`}
        autoComplete="address-line2"
        autoCapitalize="sentences"
        enterKeyHint="next"
        value={values.line2}
        onChange={onChange}
        onBlur={onBlur}
        hint="Opcional. Piso, local u otra referencia."
        error={showError(submitCount, touched?.line2, errors?.line2)}
        disabled={disabled}
        maxLength={200}
      />
      <TextField
        label="Enlace de Google Maps"
        name={`${namePrefix}.mapsUrl`}
        type="url"
        inputMode="url"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="done"
        placeholder="https://maps.app.goo.gl/…"
        value={values.mapsUrl}
        onChange={onChange}
        onBlur={onBlur}
        hint="Pega el enlace de la ubicación. Preferible el enlace corto de Maps."
        error={showError(submitCount, touched?.mapsUrl, errors?.mapsUrl)}
        disabled={disabled}
        maxLength={80}
      />
    </div>
  );
}

export function emptyAddressFields(): AddressFormValues {
  return {
    line1: "",
    line2: "",
    mapsUrl: "",
  };
}
