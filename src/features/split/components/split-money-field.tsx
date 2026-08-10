import { forwardRef, useEffect, useRef, useState } from "react";
import type { TextInput } from "react-native";

import type { InputProps } from "heroui-native/input";

import { centsToDisplay, displayToCents } from "../data/split-form";
import { SplitField } from "./split-form-field";

type SplitMoneyFieldProps = Omit<
  InputProps,
  "value" | "onChangeText" | "onFocus" | "keyboardType"
> & {
  label: string;
  valueCents: number;
  onChangeCents: (cents: number) => void;
  error?: string | null;
  description?: string;
  isRequired?: boolean;
};

export const SplitMoneyField = forwardRef<TextInput, SplitMoneyFieldProps>(
  (
    {
      label,
      valueCents,
      onChangeCents,
      error,
      description,
      isRequired,
      onBlur,
      ...inputProps
    },
    ref,
  ) => {
    const [draft, setDraft] = useState(() => centsToDisplay(valueCents));
    const isFocused = useRef(false);

    useEffect(() => {
      if (isFocused.current) return;
      setDraft(centsToDisplay(valueCents));
    }, [valueCents]);

    return (
      <SplitField
        ref={ref}
        label={label}
        description={description}
        isRequired={isRequired}
        error={error}
        value={draft}
        onChangeText={setDraft}
        onFocus={() => {
          isFocused.current = true;
        }}
        onBlur={(event) => {
          isFocused.current = false;
          const cents = displayToCents(draft);
          setDraft(centsToDisplay(cents));
          onChangeCents(cents);
          onBlur?.(event);
        }}
        keyboardType="decimal-pad"
        {...inputProps}
      />
    );
  },
);

SplitMoneyField.displayName = "SplitMoneyField";
