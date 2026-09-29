import { Transform } from 'class-transformer';

/** "  Laptop  " -> "Laptop" (for required text fields) */
export function Trim(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}

/** "  " or "" -> undefined, otherwise trimmed (for optional text fields and search boxes) */
export function TrimOrUndefined(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  });
}

/** Query strings are always text: "true" -> true, "false" -> false, "" -> undefined */
export function ToBoolean(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    if (value === '') return undefined;
    return value;
  });
}
