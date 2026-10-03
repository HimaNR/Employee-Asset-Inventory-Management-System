import { useEffect, useState } from 'react';
import { ApiError, isAbortError } from '@/libs/api/api-error';
import { useDebouncedValue } from '@/libs/use-debounced-value';
import { assetsService } from '@/services/assets/assets.service';
import type { AssetSuggestions, BulkCreateAssetsResult } from '@/types/asset.types';
import {
  EMPTY_BULK_FORM,
  mapServerError,
  toBulkInput,
  validateBulkForm,
  type BulkFormErrors,
  type BulkFormField,
  type BulkFormValues,
} from '../utils/bulk-asset-form';

export function useBulkAssetDialog(onCreated: (result: BulkCreateAssetsResult) => void) {
  const [values, setValues] = useState<BulkFormValues>(EMPTY_BULK_FORM);
  const [clientErrors, setClientErrors] = useState<BulkFormErrors>({});
  const [serverError, setServerError] = useState<ApiError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serverFieldErrors = serverError ? mapServerError(serverError) : {};
  const errors = { ...serverFieldErrors, ...clientErrors };
  const generalError =
    serverError && Object.keys(serverFieldErrors).length === 0 ? serverError : null;

  const update = (field: BulkFormField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setClientErrors((current) => ({ ...current, [field]: undefined }));
    setServerError(null);
  };

  // ---- Previously used names/brands/models as typing suggestions ----
  const [suggestions, setSuggestions] = useState<AssetSuggestions>({ names: [], brands: [], models: [] });
  useEffect(() => {
    const controller = new AbortController();
    assetsService
      .suggestions(controller.signal)
      .then(setSuggestions)
      .catch(() => {
        // Not critical
      });
    return () => controller.abort();
  }, []);

  // ---- Live preview of the codes that will be created ----
  const prefix = useDebouncedValue(values.codePrefix.trim().toUpperCase(), 300);
  const isPrefixValid = /^[A-Z0-9]{2,10}$/.test(prefix);
  const [nextNumber, setNextNumber] = useState<{ prefix: string; value: number } | null>(null);

  useEffect(() => {
    if (!isPrefixValid) return;
    const controller = new AbortController();
    assetsService
      .nextCode(prefix, controller.signal)
      .then((result) => setNextNumber({ prefix: result.prefix, value: result.nextNumber }))
      .catch((err: unknown) => {
        if (!isAbortError(err)) setNextNumber(null);
      });
    return () => controller.abort();
  }, [prefix, isPrefixValid]);

  const submit = async () => {
    const nextErrors = validateBulkForm(values);
    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    setServerError(null);
    try {
      onCreated(await assetsService.bulkCreate(toBulkInput(values)));
    } catch (err) {
      setServerError(ApiError.from(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    generalError,
    isSubmitting,
    update,
    submit,
    // only show the preview for the prefix it was loaded for
    nextNumber: isPrefixValid && nextNumber?.prefix === prefix ? nextNumber.value : null,
    previewPrefix: prefix,
    suggestions,
  };
}
