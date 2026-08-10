import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Pressable,
  TextInput,
  type TextInputProps,
} from "react-native";
import { useCSSVariable } from "uniwind";

import { hapticSelection } from "@/lib/haptics";

export type SearchProps = Omit<
  TextInputProps,
  "value" | "defaultValue" | "onChangeText"
> & {
  value?: string;
  defaultValue?: string;
  onChangeText?: (text: string) => void;
  /**
   * Fires after the user stops typing for `debounceMs`.
   * Use this for API lookups — not fired on mount.
   */
  onSearch?: (query: string) => void | Promise<void>;
  /** @deprecated Use `onSearch` instead. */
  onDebouncedChange?: (text: string) => void;
  debounceMs?: number;
  /** Minimum trimmed length before `onSearch` runs. Empty query always fires `""`. */
  minLength?: number;
  onClear?: () => void;
  /** Keyboard submit — runs immediately, bypassing debounce. */
  onSubmit?: (text: string) => void;
};

export type SearchHandle = {
  focus: () => void;
  blur: () => void;
  clear: () => void;
};

const Search = forwardRef<SearchHandle, SearchProps>(function Search(
  {
    value: controlledValue,
    defaultValue = "",
    onChangeText,
    onSearch,
    onDebouncedChange,
    debounceMs = 300,
    minLength = 1,
    onClear,
    onSubmit,
    placeholder = "Search",
    autoCapitalize = "none",
    autoCorrect = false,
    returnKeyType = "search",
    onSubmitEditing,
    onFocus,
    onBlur,
    ...inputProps
  },
  ref,
) {
  const inputRef = useRef<TextInput>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSearchRef = useRef(true);
  const onSearchRef = useRef(onSearch ?? onDebouncedChange);

  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const isControlled = controlledValue !== undefined;
  const query = isControlled ? controlledValue : internalValue;

  onSearchRef.current = onSearch ?? onDebouncedChange;

  const muted = useCSSVariable("--color-muted");
  const placeholderColor = useCSSVariable("--color-field-placeholder");
  const iconColor = typeof muted === "string" ? muted : "#8a8a8f";
  const resolvedPlaceholderColor =
    typeof placeholderColor === "string" ? placeholderColor : "#8a8a8f";

  const runSearch = useCallback(
    (text: string) => {
      const trimmed = text.trim();

      if (trimmed.length === 0) {
        onSearchRef.current?.("");
        return;
      }

      if (trimmed.length < minLength) {
        onSearchRef.current?.("");
        return;
      }

      onSearchRef.current?.(trimmed);
    },
    [minLength],
  );

  const cancelScheduledSearch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const scheduleSearch = useCallback(
    (text: string) => {
      cancelScheduledSearch();
      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        runSearch(text);
      }, debounceMs);
    },
    [cancelScheduledSearch, debounceMs, runSearch],
  );

  const setQuery = useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onChangeText?.(next);
    },
    [isControlled, onChangeText],
  );

  const clear = useCallback(() => {
    hapticSelection();
    cancelScheduledSearch();
    setQuery("");
    onClear?.();
    runSearch("");
    inputRef.current?.focus();
  }, [cancelScheduledSearch, onClear, runSearch, setQuery]);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear,
  }));

  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    scheduleSearch(query);

    return cancelScheduledSearch;
  }, [query, scheduleSearch, cancelScheduledSearch]);

  useEffect(() => cancelScheduledSearch, [cancelScheduledSearch]);

  return (
    <Pressable
      accessibilityRole="search"
      onPress={() => inputRef.current?.focus()}
      className={`min-h-11 flex-row items-center gap-3 rounded-4xl border-[1.5px] bg-surface-secondary px-4 ${
        isFocused ? "border-accent" : "border-transparent"
      }`}
      style={{ borderCurve: "continuous" }}
    >
      <HugeiconsIcon
        icon={Search01Icon}
        size={20}
        color={iconColor}
        strokeWidth={1.75}
      />

      <TextInput
        ref={inputRef}
        value={query}
        placeholder={placeholder}
        placeholderTextColor={resolvedPlaceholderColor}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        returnKeyType={returnKeyType}
        className="min-h-11 flex-1 bg-transparent px-0 font-normal text-foreground"
        style={{ borderWidth: 0, borderCurve: "continuous" }}
        underlineColorAndroid="transparent"
        onChangeText={setQuery}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        onSubmitEditing={(event) => {
          cancelScheduledSearch();
          runSearch(query);
          onSubmit?.(query.trim());
          onSubmitEditing?.(event);
        }}
        {...inputProps}
      />

      {query.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={8}
          onPress={clear}
          className="-mr-1 h-8 w-8 items-center justify-center rounded-full"
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            size={18}
            color={iconColor}
            strokeWidth={1.75}
          />
        </Pressable>
      ) : null}
    </Pressable>
  );
});

export default Search;
